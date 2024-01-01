import { QueryClient, hydrate } from '@tanstack/react-query';
import { hydrateRoot } from 'react-dom/client';
import { App } from './App.js';
import { httpLink } from '@trpc/client';
import { trpc } from './utils/trpc.js';
import { StrictMode } from 'react';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000,
        },
    },
});

const trpcClient = trpc.createClient({
    links: [
        httpLink({
            url: new URL('/trpc', window.location.href).toString(),
        }),
    ],
});

const dehydratedState = JSON.parse(atob(window.__REACT_QUERY_STATE__));

hydrate(queryClient, dehydratedState);

hydrateRoot(
    document.getElementById('root')!,
    <StrictMode>
        <App {...{ queryClient, trpcClient, ssrState: 'mounting' }} />
    </StrictMode>,
);

declare global {
    interface Window {
        /**
         * btoa(JSON.stringify(dehydrate(queryClient))) from ssr
         */
        __REACT_QUERY_STATE__: string;
    }
}
