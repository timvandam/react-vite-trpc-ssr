import express from 'express';
import { createServer as createViteServer } from 'vite';
import { resolve } from 'path';
import { readFile } from 'fs/promises';
import { createContext, trpcHandler } from './trpc.js';

const app = express();

const vite =
    process.env.NODE_ENV === 'production'
        ? null
        : await createViteServer({
              server: { middlewareMode: true },
              appType: 'custom',
          });

if (vite) {
    app.use(vite.middlewares);
} else {
    app.use('/assets', express.static(resolve(process.cwd(), 'build/client/assets')));
}

app.use('/trpc', trpcHandler);

app.use('*', async (req, res, next) => {
    const templatePath = vite ? resolve(vite.config.root, 'index.html') : 'build/client/index.html';

    try {
        let template = await readFile(templatePath, 'utf-8');

        if (vite) {
            template = await vite.transformIndexHtml(req.originalUrl, template);
        }

        const { render } = vite
            ? await vite.ssrLoadModule('/src/entry.server.tsx')
            : await import(resolve(process.cwd(), 'build/server/entry.server.js'));

        const { html, state } = await render(createContext(req));

        const reactQueryState = btoa(JSON.stringify(state));

        res.setHeader('Content-Type', 'text/html').end(
            template
                .replace(`<ssr-outlet />`, html)
                .replace(
                    `</body>`,
                    `<script>window.__REACT_QUERY_STATE__ = ${JSON.stringify(
                        reactQueryState,
                    )}</script>\n</body>`,
                ),
        );
    } catch (error: any) {
        next(error);
    }
});

const port = parseInt(process.env.PORT ?? '3000', 10);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
