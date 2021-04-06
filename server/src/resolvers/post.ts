import { Post } from '../entities/Post';
import {
    Arg,
    Ctx,
    Field,
    FieldResolver,
    InputType,
    Int,
    Mutation,
    ObjectType,
    Query,
    Resolver,
    Root,
    UseMiddleware,
} from 'type-graphql';
import { MyContext } from '../types';
import { isAuth } from '../middleware/isAuth';
import { getConnection } from 'typeorm';
import { Updoot } from '../entities/Updoot';

@InputType()
class PostInput {
    @Field()
    title: string;
    @Field()
    text: string;
}

@ObjectType()
class PaginatedPosts {
    @Field(() => [Post])
    posts: Post[];

    @Field()
    hasMore: Boolean;
}

@Resolver(Post)
export class PostResolver {
    @FieldResolver()
    textSnippet(@Root() root: Post): string {
        let text = root.text;
        if (text.length > 90) {
            text = text.slice(0, 88) + '...';
        }
        return text;
    }

    @Query(() => PaginatedPosts)
    async posts(
        @Arg('limit', () => Int) limit: number,
        @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
        @Ctx() { req }: MyContext,
    ): Promise<PaginatedPosts> {
        const realLimit = Math.min(50, limit);
        const realLimitPlusOne = realLimit + 1;

        const params: any[] = [realLimitPlusOne];
        if (req.session.userId) params.push(req.session.userId);
        let cursorIdx = 3;
        if (cursor) {
            params.push(new Date(parseInt(cursor)));
            cursorIdx = params.length;
        }

        const posts = await getConnection().query(
            `
            SELECT 
            p.*,
            JSON_BUILD_OBJECT(
                'id', u.id,
                'username', u.username,
                'email', u.email,
                'createdAt', u."createdAt",
                'updatedAt', u."updatedAt"
            ) AS creator,
            ${
                req.session.userId
                    ? '(SELECT value FROM updoot WHERE "userId" = $2 AND "postId" = p.id) AS "voteStatus"'
                    : 'null AS "voteStatus"'
            }
            FROM post p
            INNER JOIN users u ON (u.id = p."creatorId")
            ${cursor ? `WHERE p."createdAt" < $${cursorIdx}` : ''}
            ORDER BY p."createdAt" DESC
            LIMIT $1
        `,
            params,
        );

        return {
            posts: posts.slice(0, realLimit),
            hasMore: posts.length === realLimitPlusOne,
        };
    }

    @Query(() => Post, { nullable: true })
    post(@Arg('id', () => Int) id: number): Promise<Post | undefined> {
        return Post.findOne(id, { relations: ['creator'] });
    }

    //===============

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async vote(
        @Arg('postId', () => Int) postId: number,
        @Arg('value', () => Int) value: number,
        @Ctx() { req }: MyContext,
    ) {
        const { userId } = req.session;
        const updoot = await Updoot.findOne({ where: { postId, userId } });
        const isUpdoot = value >= 0;
        const realValue = isUpdoot ? 1 : -1;

        if (updoot && updoot.value !== realValue) {
            // changing
            await getConnection().transaction(async tm => {
                await tm.query(
                    `
                    UPDATE updoot
                    SET value = $1
                    WHERE "postId" = $2
                    AND "userId" = $3;
                `,
                    [realValue, postId, userId],
                );
                await tm.query(
                    `
                UPDATE post
                SET points = points + $1
                WHERE id = $2;
                `,
                    [realValue * 2, postId],
                );
            });
        } else if (!updoot) {
            await getConnection().transaction(async tm => {
                await tm.query(
                    `
                INSERT INTO updoot("userId", "postId", value)
                VALUES($1, $2, $3);
                `,
                    [userId, postId, realValue],
                );
                await tm.query(
                    `
                UPDATE post
                SET points = points + $1
                WHERE id = $2;
                `,
                    [realValue, postId],
                );
            });
        }

        return true;
    }

    // =============

    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost(
        @Arg('input') input: PostInput,
        @Ctx() { req }: MyContext,
    ): Promise<Post> {
        const creatorId = req.session.userId;
        return Post.create({ ...input, creatorId }).save();
    }

    @Mutation(() => Post, { nullable: true })
    @UseMiddleware(isAuth)
    async updatePost(
        @Arg('id', () => Int) id: number,
        @Arg('title') title: string,
        @Arg('text') text: string,
        @Ctx() { req }: MyContext,
    ): Promise<Post | null> {
        const result = await getConnection()
            .createQueryBuilder()
            .update(Post)
            .set({ title, text })
            .where('id = :id AND "creatorId" = :creatorId', {
                id,
                creatorId: req.session.userId,
            })
            .returning('*')
            .execute();
        return result.raw[0];
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async deletePost(
        @Arg('id', () => Int) id: number,
        @Ctx() { req }: MyContext,
    ): Promise<Boolean> {
        // one way
        // const post = await Post.findOne(id);
        // if (!post) return false;

        // if (post.creatorId !== req.session.userId) {
        //     throw new Error('Not Authenticated');
        // }
        // await Updoot.delete({ postId: id });

        await Post.delete({ id, creatorId: req.session.userId });
        return true;
    }
}
