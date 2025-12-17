/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import {defineConfig, loadEnv} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import reload from 'vite-plugin-full-reload';
import glslPlugin from './plugins/vite-plugin-glsl.js';
import sitemapPlugin from './plugins/vite-plugin-sitemap.js';
import copy from 'rollup-plugin-copy';

// https://vite.dev/config/
export default defineConfig(({command, mode}) => {
    const env = loadEnv(mode, process.cwd(), 'VITE');
    console.log(env);
    return {
        base: env.VITE_PUBLIC_PATH,
        build: {
            outDir: 'showcase',
        },
        assetsInclude: ['**/*.glb', '**/*.geojson', '**/*.csv', '**/*.txt', '**/*.wasm'],
        plugins: [
            react({
                // 禁用React Fast Refresh
                fastRefresh: false,
            }),
            reload(['./src/**/*']),
            glslPlugin(),
            copy({
                targets: [
                    {src: 'node_modules/@baidumap/mapv-three/dist/assets', dest: 'public/mapvthree'},
                    {src: 'node_modules/cesium/Build/Cesium/Assets', dest: 'public/external'},
                    {src: 'node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.js', dest: 'public/ffmpeg/core'},
                    {src: 'node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.wasm', dest: 'public/ffmpeg/core'},
                    {src: 'node_modules/@ffmpeg/ffmpeg/dist/esm/worker.js', dest: 'public/ffmpeg'},
                ],
                verbose: true, // vite需要加这个参数
                hook: 'buildStart', // vite需要加这个参数
            }),
            // 自动生成sitemap.xml（仅在构建时）
            sitemapPlugin({
                hostname: 'https://lbsyun.baidu.com/jsapithree/showcase',
                showcasesPath: '../src/data/showcases.js',
                outputPath: 'sitemap.xml',
            }),
        ],
        define: {
            __BASE_URL_ONLINE__: "'../mapv-three'",
            __MAPVTHREE_VERSION__: "'0.0.0'",
        },
        css: {
            preprocessorOptions: {
                less: {
                    javascriptEnabled: true,
                },
            },
        },
        esbuild: {
            loader: 'jsx',
            include: /src\/.*\.jsx?$/,
            exclude: [],
        },
        optimizeDeps: {
            force: true,
            esbuildOptions: {
                loader: {
                    '.js': 'jsx',
                },
            },
            exclude: [
                // '@baidumap/mapv-three',
            ],
        },
        server: {
            // 开发服务器配置
            host: '127.0.0.1',
            port: 5173,
            strictPort: true,
            fs: {
                strict: false, // 允许服务超出根目录的文件
            },
            watch: {
                ignored: [
                    '!**/node_modules/@baidumap/mapv-three/**',
                ],
            },
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
    };
});
