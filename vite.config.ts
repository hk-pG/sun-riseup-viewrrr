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
  plugins: [
    react({
      // React 19 optimizations
      jsxRuntime: 'automatic',
      jsxImportSource: 'react',
      // Enable React 19 compiler optimizations
      babel: {
        plugins: [
          // React 19 specific optimizations can be added here
        ],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // エイリアス設定
      '@': path.resolve(__dirname, './src/'),
    },
  },

  // Build optimizations for React 19
  build: {
    // Enable modern JavaScript features
    target: 'esnext',
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': [
            '@radix-ui/react-menubar',
            '@radix-ui/react-slot',
            'lucide-react',
          ],
          'tauri-vendor': [
            '@tauri-apps/api',
            '@tauri-apps/plugin-dialog',
            '@tauri-apps/plugin-fs',
            '@tauri-apps/plugin-opener',
            '@tauri-apps/plugin-store',
          ],
        },
      },
    },
    // Enable source maps for better debugging
    sourcemap: true,
    // Optimize CSS
    cssCodeSplit: true,
  },

  // Development optimizations
  optimizeDeps: {
    // Pre-bundle dependencies for faster dev server startup
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      '@radix-ui/react-menubar',
      '@radix-ui/react-slot',
      'lucide-react',
      'clsx',
      'tailwind-merge',
      'class-variance-authority',
    ],
    // Exclude Tauri APIs from pre-bundling as they need to be handled specially
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
    // Development server optimizations
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..'],
    },
  },

  // Performance optimizations
  esbuild: {
    // Use React 19 JSX transform
    jsx: 'automatic',
    jsxImportSource: 'react',
    // Enable tree shaking
    treeShaking: true,
  },
}));
