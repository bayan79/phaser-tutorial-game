import { defineConfig, type PluginOption } from 'vite'
import compression from 'vite-plugin-compression2';

export default defineConfig({
	plugins: [
        compression({
            deleteOriginalAssets: true,
            algorithm: 'brotliCompress', 
            exclude: [/\.(br)$ /, /\.(gz)$/],
        }),
    ],
	server: { host: '0.0.0.0', port: 8000 },
	clearScreen: false,
    base: "/phaser-tutorial-game/",
})
