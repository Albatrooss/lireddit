import { Request, Response } from 'express';
import { SessionData } from 'express-session';
import { Redis } from 'ioredis';
import { createUpdootLoader } from './utils/createUpDootLoader';
import { createUserLoader } from './utils/createUserLoader';

export type MyContext = {
    req: Request & { session: SessionData & { userId: number } };
    res: Response;
    redis: Redis;
    userLoader: ReturnType<typeof createUserLoader>;
    updootLoader: ReturnType<typeof createUpdootLoader>;
};
