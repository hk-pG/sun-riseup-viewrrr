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
      // React 19 optimizations
      jsxRuntime: 'automatic',
      jsxImportSource: 'react',
      // React 19 Fast Refresh optimizations
      fastRefresh: true,
      // Enable React 19 development features
      include: /\.(jsx|tsx)$/,
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
    // Enable modern JavaScript features for React 19
    target: ['esnext', 'chrome91', 'firefox90', 'safari15'],
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
        // Optimize chunk naming for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Enable source maps for better debugging
    sourcemap: process.env.NODE_ENV === 'development',
    // Optimize CSS
    cssCodeSplit: true,
    // React 19 build optimizations
    minify: 'esbuild',
    // Optimize bundle size
    reportCompressedSize: false,
    // Increase chunk size warning limit for React 19
    chunkSizeWarningLimit: 1000,
  },

  // Development optimizations for React 19
  optimizeDeps: {
    // Pre-bundle dependencies for faster dev server startup
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      '@radix-ui/react-menubar',
      '@radix-ui/react-slot',
      'lucide-react',
      'clsx',
      'tailwind-merge',
      'class-variance-authority',
      'swr',
    ],
    // Exclude Tauri APIs from pre-bundling as they need to be handled specially
    exclude: [
      '@tauri-apps/api',
      '@tauri-apps/plugin-dialog',
      '@tauri-apps/plugin-fs',
      '@tauri-apps/plugin-opener',
      '@tauri-apps/plugin-store',
    ],
    // React 19 optimization: force re-optimization on dependency changes
    force: process.env.NODE_ENV === 'development',
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
      // React 19: Optimize file watching
      usePolling: false,
      interval: 100,
    },
    // Development server optimizations for React 19
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..'],
    },
    // Optimize middleware for React 19
    middlewareMode: false,
    // Enable HTTP/2 for better performance
    https: false,
    // Optimize CORS for development
    cors: true,
  },

  // Performance optimizations for React 19
  esbuild: {
    // Use React 19 JSX transform
    jsx: 'automatic',
    jsxImportSource: 'react',
    // Enable tree shaking
    treeShaking: true,
    // TypeScript optimizations for React 19
    target: 'esnext',
    format: 'esm',
    // React 19: Enable advanced optimizations
    keepNames: false,
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
    // Optimize for React 19 patterns
    supported: {
      'dynamic-import': true,
      'import-meta': true,
    },
  },

  // TypeScript configuration for React 19
  define: {
    // Enable React 19 development mode features
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    // React 19 specific feature flags
    __REACT_DEVTOOLS_GLOBAL_HOOK__: 'globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__',
  },

  // React 19: Enable experimental features
  experimental: {
    // Enable React 19 server components support (if needed in future)
    // renderBuiltUrl: true,
  },
}));
