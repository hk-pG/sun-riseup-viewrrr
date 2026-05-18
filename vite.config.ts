import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const host = process.env.TAURI_DEV_HOST;

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
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
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    testTimeout: 10000,
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
});
