import { trpc } from '../utils/trpc.js';

export function Ping() {
    const { data } = trpc.ping.useQuery(undefined, { trpc: { ssr: false } });

    return <div style={{ color: 'red' }}>Ping: {data ?? 'loading'}</div>;
}
