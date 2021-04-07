import 'reflect-metadata';
import 'dotenv-safe/config';
import { COOKIE_NAME, __prod__ } from './constants';
import { createConnection } from 'typeorm';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import cors from 'cors';
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { User } from './entities/User';
import { Post } from './entities/Post';
import path from 'path';
import { Updoot } from './entities/Updoot';
import { createUserLoader } from './utils/createUserLoader';
import { createUpdootLoader } from './utils/createUpDootLoader';

const main = async () => {
    const conn = await createConnection({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        logging: true,
        synchronize: false,
        migrations: [path.join(__dirname, './migrations/*.js')],
        entities: [User, Post, Updoot],
    });

    await conn.runMigrations();

    const app = express();

    const redisClient = redis.createClient(process.env.REDIS_URL);
    redisClient.on('error', err =>
        console.log('could not connct to redis' + err),
    );
    redisClient.on('connect', () => console.log('connected to redis!'));
    const RedisStore = connectRedis(session);

    app.set('proxy', 1);
    app.use(
        cors({
            origin: process.env.CORS_ORIGIN,
            credentials: true,
        }),
    );

    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({
                client: redisClient,
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
                httpOnly: true,
                secure: __prod__, // cookie only works in https
                sameSite: 'lax', // csrf
                domain: __prod__ ? '.ohohoh.ca' : undefined,
            },
            saveUninitialized: false,
            secret: process.env.SESSION_SECRET,
            resave: false,
        }),
    );

    const apolloSever = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false,
        }),
        context: ({ req, res }) => ({
            req,
            res,
            redis,
            userLoader: createUserLoader(),
            updootLoader: createUpdootLoader(),
        }),
    });

    apolloSever.applyMiddleware({ app, cors: false });

    const port = parseInt(process.env.PORT);
    app.listen(port, () => {
        console.log(`Server started on Post localhost:${port}`);
    });
};

main().catch(err => {
    console.log(err);
});
