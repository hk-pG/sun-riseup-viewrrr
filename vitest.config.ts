import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        extends: './vite.config.ts',
        test: {
          name: 'jsdom',
          globals: true,
          environment: 'jsdom',
          setupFiles: './src/test/setup.ts',
          testTimeout: 10000,
          include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
          exclude: [
            '**/*.browser.test.tsx',
            '**/node_modules/**',
            '**/dist/**',
          ],
        },
      },
      {
        extends: './vite.config.ts',
        test: {
          //INFO:  Tanstack Virtualのような実際のDOMを必要とするテストは、jsdomではなくブラウザ環境で実行する
          name: 'browser',
          globals: true,
          setupFiles: ['./src/test/setup.ts', './src/test/setup.browser.ts'],
          testTimeout: 10000,
          //INFO: 拡張子に .browser.test.tsx を付けたテストファイルのみを対象とする
          include: ['**/*.browser.test.tsx'],
          browser: {
            enabled: true,
            provider: playwright(),
            // INFO: headless: falseにすると、テスト実行時にブラウザが立ち上がるので、UIの挙動を確認できる
            instances: [{ browser: 'chromium', headless: true }],
          },
        },
      },
    ],
  },
});
