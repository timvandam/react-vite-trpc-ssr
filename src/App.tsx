import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import type { TRPCClient } from '@trpc/client';
import type { SSRState } from '@trpc/react-query/shared';
import { Ping } from './components/Ping.js';
import { AuthenticatedPing } from './components/AuthenticatedPing.js';
import type { AppRouter } from './server/index.js';
import { trpc } from './utils/trpc.js';
import { ReactNode, useEffect } from 'react';
import { Mutation } from './components/Mutation.js';
import { getQueryKey } from '@trpc/react-query';

export function App({
    queryClient,
    trpcClient,
    ssrState,
}: {
    queryClient: QueryClient;
    trpcClient: TRPCClient<AppRouter>;
    ssrState: SSRState;
}) {
    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient} ssrState={ssrState}>
            <QueryClientProvider client={queryClient}>
                <InvalidationBoundary>
                    <Ping />
                    <AuthenticatedPing />
                    <Mutation />
                </InvalidationBoundary>
            </QueryClientProvider>
        </trpc.Provider>
    );
}

function InvalidationBoundary({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();
    const trpcUtils = trpc.useUtils();

    useEffect(() => {
        queryClient.setMutationDefaults(getQueryKey(trpc), {
            onSuccess: () => {
                trpcUtils.invalidate();
            },
        });
    }, [queryClient, trpcUtils]);

    return children;
}
