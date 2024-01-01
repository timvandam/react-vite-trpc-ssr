import { trpc } from '../utils/trpc.js';

export function Mutation() {
    const { status, mutate } = trpc.myMutation.useMutation();

    return (
        <button style={{ backgroundColor: 'orange' }} onClick={() => mutate()}>
            Mutation ({status})
        </button>
    );
}
