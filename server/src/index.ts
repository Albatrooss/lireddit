import 'reflect-metadata';
import { COOKIE_NAME, __prod__ } from './constants';
import { createConnection } from 'typeorm';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import cors from 'cors';
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { User } from './entities/User';
import { Post } from './entities/Post';
import path from 'path';

const main = async () => {
    const conn = await createConnection({
        type: 'postgres',
        database: 'lireddit',
        username: 'postgres',
        password: 'password',
        logging: true,
        synchronize: true,
        migrations: [path.join(__dirname, './migrations/*')],
        entities: [User, Post],
    });

    await conn.runMigrations();

    const app = express();

    const RedisStore = connectRedis(session);
    const redis = new Redis();

    app.use(
        cors({
            origin: 'http://localhost:3000',
            credentials: true,
        }),
    );

    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({
                client: redis,
                disableTouch: true,
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
                httpOnly: true,
                secure: __prod__, // cookie only works in https
                sameSite: 'lax', // csrf
            },
            saveUninitialized: false,
            secret: 'ohhimark',
            resave: false,
        }),
    );

    const apolloSever = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false,
        }),
        context: ({ req, res }) => ({ req, res, redis }),
    });

    apolloSever.applyMiddleware({ app, cors: false });

    const port = 4000;
    app.listen(port, () => {
        console.log(`Server started on Post localhost:${port}`);
    });
};

main().catch(err => {
    console.log(err);
});