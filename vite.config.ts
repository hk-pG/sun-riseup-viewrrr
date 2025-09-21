import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

const host = process.env.TAURI_DEV_HOST;

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // エイリアス設定
      '@': path.resolve(__dirname, './src/'),
    },
  },
  test: {
    // describe, it, expectなどをグローバルスコープで使えるようにする
    globals: true,
    // DOM環境をシミュレート
    environment: 'jsdom',
    // (オプション) テスト全体のセットアップファイル
    setupFiles: './src/test/setup.ts',
    testTimeout: 10000,
    // プロジェクト設定（旧vitest.workspace.tsの内容を統合）
    projects: [
      // デフォルトのテストプロジェクト
      {
        resolve: {
          alias: {
            '@': path.resolve(dirname, './src/'),
          },
        },
        test: {
          globals: true,
          environment: 'jsdom',
          setupFiles: './src/test/setup.ts',
          testTimeout: 10000,
        },
      },
      // Storybookテストプロジェクト
      {
        plugins: [
          react(),
          tailwindcss(),
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        resolve: {
          alias: {
            '@': path.resolve(dirname, './src/'),
          },
        },
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: 'playwright',
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
          testTimeout: 10000,
          deps: {
            optimizer: {
              web: {
                include: [
                  '@testing-library/react',
                  '@storybook/react-vite',
                  '@storybook/addon-a11y',
                ],
              },
            },
          },
        },
      },
    ],
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
