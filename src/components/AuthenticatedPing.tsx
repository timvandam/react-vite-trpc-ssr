import { trpc } from '../utils/trpc.js';

export function AuthenticatedPing() {
    const { data } = trpc.authenticatedPing.useQuery();

    return <div style={{ color: 'green' }}>Authenticated Ping: {data ?? 'loading'}</div>;
}
