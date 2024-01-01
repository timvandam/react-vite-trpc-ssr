import { initTRPC } from '@trpc/server';

export type Context = {
    authCookie: string | null;
};

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const authenticatedProcedure = t.procedure.use(async (opts) => {
    if (!opts.ctx.authCookie) {
        // throw new Error('Not authenticated');
    }

    return opts.next();
});
