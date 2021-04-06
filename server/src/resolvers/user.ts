import { User } from '../entities/User';
import { MyContext } from '../types';
import {
    Arg,
    Ctx,
    Field,
    FieldResolver,
    Mutation,
    ObjectType,
    Query,
    Resolver,
    Root,
} from 'type-graphql';
import argon from 'argon2';
import { COOKIE_NAME, FORGOT_PW_PRE } from '../constants';
import { UsernamePasswordInput } from './UsernamePasswordInput';
import { validateRegister } from '../utils/validateRegister';
import { sendEmail } from '../utils/sendEmail';
import { v4 } from 'uuid';
import { getConnection } from 'typeorm';

@ObjectType()
class FieldError {
    @Field()
    field: string;

    @Field()
    message: string;
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => User, { nullable: true })
    user?: User;
}

@Resolver(User)
export class UserResolver {
    @FieldResolver()
    email(@Root() user: User, @Ctx() { req }: MyContext) {
        if (req.session.userId === user.id) {
            return user.email;
        }
        return '';
    }

    @Query(() => User, { nullable: true })
    me(@Ctx() { req }: MyContext): Promise<User | undefined> {
        const userId = req.session.userId;
        if (!userId) return new Promise(res => res(undefined));
        return User.findOne(userId);
    }

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() { redis }: MyContext,
    ) {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return true;
        }
        const token = v4();

        await redis.set(
            FORGOT_PW_PRE + token,
            user.id,
            'ex',
            1000 * 60 * 60 * 24, // one day
        );

        await sendEmail(
            email,
            `<a href="http://localhost:3000/reset-password/${token}">Reset Password</a>`,
        );
        return true;
    }

    @Mutation(() => UserResponse)
    async resetPassword(
        @Arg('token') token: string,
        @Arg('newPassword') newPassword: string,
        @Ctx() { redis, req }: MyContext,
    ) {
        if (newPassword.length < 3) {
            return {
                errors: [
                    {
                        field: 'password',
                        message: 'Password must contain at least 3 characters',
                    },
                ],
            };
        }
        const key = FORGOT_PW_PRE + token;
        const userId = await redis.get(key);
        if (!userId) {
            return {
                errors: [
                    {
                        field: 'token',
                        message: 'Token expired',
                    },
                ],
            };
        }
        const userIdNum = parseInt(userId);
        const user = await User.findOne(userIdNum);

        if (!user) {
            return {
                errors: [
                    {
                        field: 'token',
                        message: 'User no longer exists',
                    },
                ],
            };
        }

        await User.update(
            { id: userIdNum },
            { password: await argon.hash(newPassword) },
        );

        req.session.userId = user.id;
        await redis.del(key);

        return { user };
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { req }: MyContext,
    ): Promise<UserResponse> {
        const errors = validateRegister(options);
        if (errors) return { errors };
        const hashedPassword = await argon.hash(options.password);
        let user;
        try {
            const result = await getConnection()
                .createQueryBuilder()
                .insert()
                .into(User)
                .values({
                    username: options.username,
                    email: options.email,
                    password: hashedPassword,
                })
                .returning('*')
                .execute();
            user = result.raw[0];
        } catch (error) {
            if (error.detail.includes('already exists')) {
                return {
                    errors: [
                        {
                            field: 'username',
                            message: 'Username taken',
                        },
                    ],
                };
            }
            return {
                errors: [
                    {
                        field: 'username',
                        message: error.message,
                    },
                ],
            };
        }
        req.session.userId = user.id;
        return { user };
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('usernameOrEmail') usernameOrEmail: string,
        @Arg('password') password: string,
        @Ctx() { req }: MyContext,
    ): Promise<UserResponse> {
        const user = await User.findOne(
            usernameOrEmail.includes('@')
                ? { where: { email: usernameOrEmail } }
                : { where: { username: usernameOrEmail.toLowerCase() } },
        );
        if (!user) {
            return {
                errors: [
                    {
                        field: 'usernameOrEmail',
                        message: 'User not found',
                    },
                ],
            };
        }
        const valid = await argon.verify(user.password, password);
        if (!valid) {
            return {
                errors: [
                    {
                        field: 'password',
                        message: 'Incorrect password',
                    },
                ],
            };
        }
        req.session.userId = user.id;
        return {
            user,
        };
    }

    @Mutation(() => Boolean)
    logout(@Ctx() { req, res }: MyContext) {
        return new Promise(resolve =>
            req.session.destroy(error => {
                res.clearCookie(COOKIE_NAME);
                if (error) {
                    console.log(error);
                    resolve(false);
                    return;
                }
                resolve(true);
            }),
        );
    }
}
