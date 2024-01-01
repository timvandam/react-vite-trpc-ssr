import { authenticatedProcedure, publicProcedure, router } from './trpc.js';
import { cast } from '@deepkit/type';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const appRouter = router({
    ping: publicProcedure.query(async () => {
        await sleep(500);

        return `pong ${Math.random() * 100}`;
    }),
    authenticatedPing: authenticatedProcedure.query((opts) => {
        return `pong ${opts.ctx.authCookie} ${Math.random() * 100}`;
    }),
    validatedThing: publicProcedure
        .input((x) => cast<{ a: number; b: number }>(x))
        .query((opts) => {
            return opts.input.a + opts.input.b;
        }),
    myMutation: publicProcedure.mutation(async () => {
        return ':)';
    }),
});

export type AppRouter = typeof appRouter;
