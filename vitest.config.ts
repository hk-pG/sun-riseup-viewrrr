import process from 'node:process';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

// Node 25+ は globalThis.localStorage を持つ。Vitest 4.1 の jsdom 環境は
// 既に global にあるキーを window へコピーしないため、localStorage が undefined になる。
// --no-webstorage は Node 25 で入ったフラグなので、それより前では付けない。
const nodeMajor = Number.parseInt(process.versions.node.split('.')[0] ?? '0', 10);
const jsdomExecArgv = nodeMajor >= 25 ? ['--no-webstorage'] : [];

export default defineConfig({
  test: {
    projects: [
      {
        extends: './vite.config.ts',
        test: {
          name: 'jsdom',
          globals: true,
          environment: 'jsdom',
          execArgv: jsdomExecArgv,
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
