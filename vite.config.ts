import { UserConfig } from 'vite';
import { deepkitType } from '@deepkit/vite';

export default {
    plugins: [deepkitType()],
} satisfies UserConfig;
