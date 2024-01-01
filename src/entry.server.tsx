import { renderToString } from 'react-dom/server';
import { App } from './App.js';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import ssrPrepass from 'react-ssr-prepass';
import { trpc } from './utils/trpc.js';
import { appRouter } from './server/index.js';
import { Context } from './server/trpc.js';
import { callProcedure } from '@trpc/server';
import { observable } from '@trpc/server/observable';
import { TRPCErrorResponse } from '@trpc/server/rpc';
import { TRPCClientError } from '@trpc/client';

// TODO: Convert this s.t. only trpc can prefetch
export const render = async (context: Context) => {
    const queryClient = new QueryClient();

    // trpc client that calls the server directly using the provided context
    const trpcClient = trpc.createClient({
        links: [
            () =>
                ({ op }) =>
                    observable((observer) => {
                        callProcedure({
                            procedures: appRouter._def.procedures,
                            path: op.path,
                            ctx: context,
                            type: op.type,
                            rawInput: op.input,
                        })
                            .then((data) => {
                                observer.next({ result: { data } });
                                observer.complete();
                            })
                            .catch((cause: TRPCErrorResponse) => {
                                observer.error(TRPCClientError.from(cause));
                            });
                    }),
        ],
    });

    const appProps: Parameters<typeof App>[0] = {
        queryClient,
        trpcClient,
        ssrState: 'prepass',
    };

    // wait for all suspense queries to resolve
    await ssrPrepass(<App {...appProps} />);

    while (true) {
        // render to trigger any fetches, then wait for them to finish
        renderToString(<App {...appProps} />);

        const isFetching = queryClient.isFetching();

        if (!isFetching) {
            break;
        }

        await new Promise<void>((resolve) => {
            const unsub = queryClient.getQueryCache().subscribe((event) => {
                if (event?.query.getObserversCount() === 0) {
                    resolve();
                    unsub();
                }
            });
        });
    }

    const html = renderToString(<App {...appProps} />);
    const state = dehydrate(queryClient);

    return { html, state };
};
