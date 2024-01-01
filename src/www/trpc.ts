import type { Request, Response } from 'express-serve-static-core';
import type { Context } from '../server/trpc.js';
import { createHTTPHandler } from '@trpc/server/adapters/standalone';
import { appRouter } from '../server/index.js';

/**
 * Creates a context object from an express request.
 */
export function createContext(req: Request): Context {
    return {
        authCookie:
            req.headers.cookie
                ?.split('; ')
                ?.map((c) => c.split('='))
                ?.find((c) => c[0] === 'authCookie')?.[1] ?? null,
    };
}

/**
 * tRPC express request handler
 */
export const trpcHandler = (req: Request, res: Response) => {
    const handler = createHTTPHandler({
        router: appRouter,
        createContext: () => createContext(req),
    });

    void handler(req, res);
};
