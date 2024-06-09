import { defineConfig, type PluginOption } from 'vite'
import { ViteMinifyPlugin } from 'vite-plugin-minify'

export default defineConfig({
	plugins: [
        // compression({
        //     deleteOriginalAssets: true,
        //     algorithm: 'brotliCompress', 
        //     exclude: [/\.(br)$ /, /\.(gz)$/],
        // }),
        ViteMinifyPlugin({}),
    ],
    esbuild: { legalComments: 'none' },
	server: { host: '0.0.0.0', port: 8000 },
	clearScreen: false,
    base: "/phaser-tutorial-game/",
})
