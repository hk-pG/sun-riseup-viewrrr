import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(async () => ({
	plugins: [react(), tailwindcss()],
	test: {
		globals: true, // describe, it, expectなどをグローバルスコープで使えるようにする
		environment: 'jsdom', // DOM環境をシミュレート
		setupFiles: './src/test/setup.ts', // (オプション) テスト全体のセットアップファイル
		// Tauri APIのモックがうまく解決されない場合、エイリアスが役立つことがあります
		// alias: {
		//   '@tauri-apps/api/path': 'path-browserify', // 例: Node.jsのpathモジュールのブラウザ版で代替する場合など。ただし、今回は直接モックします。
		// },
	},

	// Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
	//
	// 1. prevent vite from obscuring rust errors
	clearScreen: false,
	// 2. tauri expects a fixed port, fail if that port is not available
	server: {
		port: 1420,
		strictPort: true,
		host: host || false,
		hmr: host
			? {
					protocol: 'ws',
					host,
					port: 1421,
				}
			: undefined,
		watch: {
			// 3. tell vite to ignore watching `src-tauri`
			ignored: ['**/src-tauri/**'],
		},
	},
}));
