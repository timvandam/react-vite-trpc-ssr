import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../server/index.js';

export const trpc = createTRPCReact<AppRouter>();
