import path from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import adonisjs from '@adonisjs/vite/client';
import inertia from '@adonisjs/inertia/vite';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
    define: {
        __VUE_PROD_DEVTOOLS__: false,
    },
    plugins: [
        vue(),
        inertia({ ssr: { enabled: true, entrypoint: 'inertia/ssr.ts' } }),
        adonisjs({
            entrypoints: ['inertia/app.ts'],
            reload: ['resources/views/**/*.edge'],
        }),
        tailwindcss(),
        ...(process.env.ANALYZE ? [visualizer({ open: true, filename: 'bundle-stats.html', gzipSize: true, brotliSize: true })] : []),
    ],

    resolve: {
        alias: {
            '~/': `${import.meta.dirname}/inertia/`,
            '@generated': `${import.meta.dirname}/.adonisjs/client/`,
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
        watch: {
            usePolling: true,
            interval: 100,
        },
    },
});
