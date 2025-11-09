import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const host = process.env.TAURI_DEV_HOST;

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler']
      }
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/'),
    },
  },

  // Essential build configuration
  build: {
    target: 'es2022',
    sourcemap: process.env.NODE_ENV === 'development',
  },

  // Exclude Tauri APIs from pre-bundling
  optimizeDeps: {
    exclude: [
      '@tauri-apps/api',
      '@tauri-apps/plugin-dialog',
      '@tauri-apps/plugin-fs',
      '@tauri-apps/plugin-opener',
      '@tauri-apps/plugin-store',
    ],
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
          react({
            jsxRuntime: 'automatic',
            jsxImportSource: 'react',
          }),
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

  // Tauri development server configuration
  clearScreen: false,
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
      ignored: ['**/src-tauri/**'],
    },
  },
}));
