# [Bug] `pnpm test` が Playwright ブラウザ未インストール環境で失敗する

> この文書は GitHub Issue として登録する内容の下書きです。
> 作業エージェントの権限では GitHub Issue の新規作成ができなかったため、
> 内容をここに残しています。`.github/ISSUE_TEMPLATE/bug-report.yml` を使って
> そのまま Issue化してください。

## 不具合の内容

`pnpm install` 直後に `pnpm test` を実行すると、jsdom プロジェクトの 316 件の
テストはすべて成功する（`Tests 316 passed (316)` と表示される）にもかかわらず、
以下のような大量のスタックトレースがコンソールに出力され、**プロセスの終了コードが
`1`（失敗）になる**。

```
⎯⎯⎯⎯⎯⎯ Unhandled Errors ⎯⎯⎯⎯⎯⎯

Vitest caught 1 unhandled error during the test run.
This might cause false positive tests. Resolve unhandled errors to make sure your tests are not affected.

⎯⎯⎯⎯⎯⎯ Unhandled Error ⎯⎯⎯⎯⎯⎯⎯
Error: browserType.launch: Executable doesn't exist at
/home/<user>/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell
╔════════════════════════════════════════════════════════════╗
║ Looks like Playwright was just installed or updated.       ║
║ Please run the following command to download new browsers: ║
║                                                            ║
║     pnpm exec playwright install                           ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
...(長いスタックトレースが 2 回出力される)...

 Test Files  28 passed (29)
      Tests  316 passed (316)
     Errors  1 error
 ELIFECYCLE  Test failed. See above for more details.
```

`pnpm test` の実際の終了コードで確認できる。

```bash
pnpm test; echo "EXIT_CODE=$?"
# ...
# EXIT_CODE=1
```

`pnpm exec playwright install chromium` を実行してブラウザ本体
（Chromium 一式で約 180MB のダウンロードが発生する）をキャッシュした状態で
`pnpm test` を実行すると、警告・エラーは一切出力されず終了コードも `0` になる。

```
 Test Files  29 passed (29)
      Tests  317 passed (317)
```

## 原因

- `vitest.config.ts` は `jsdom` プロジェクトと `browser`（Playwright/Chromium）
  プロジェクトの 2 つで構成されている。
- `browser` プロジェクトは
  `src/features/folder-navigation/components/FolderList/__test__/FolderList.browser.test.tsx`
  （TanStack Virtual など実 DOM が必要なテスト）を実行するために存在する。
- `.github/workflows/ci.yml` の `frontend-test` ジョブでは `pnpm test` の直前に
  `pnpm exec playwright install --with-deps` を実行しており、CI 上は問題が
  顕在化しない。
- 一方で、ローカル開発環境やこのリポジトリを新しく clone したエージェント環境では、
  `pnpm install` だけでは Playwright 本体のブラウザバイナリはダウンロードされない
  （`playwright` パッケージの `postinstall` はブラウザを自動取得しない）。
  README・CONTRIBUTING 等にも `playwright install` の実行手順の記載がない。
- そのため、CI 以外の環境で素直に `pnpm install && pnpm test` を実行すると、
  本来ケアすべきでない環境起因のエラーで `pnpm test` が失敗する。

## 深刻度

- テストの正誤判定そのものは汚染されていない（316/316 は実際に成功している）。
- ただし `pnpm test` の終了コード自体が `1` になるため、
  - このコマンドを exit code で判定する CI 以外のスクリプトやフック
    （例: 将来 `pre-push` などに `pnpm test` を組み込んだ場合）が誤って失敗扱いになる
  - 新規参加者やこのエージェントのようにまっさらな環境で作業する場合、
    「テストが落ちている」という誤った第一印象を与え、調査コストが発生する
  - 出力ノイズが多く、実際のテスト失敗と区別しにくい

  という点で無視できない実害があるため、優先度は中程度と判断した。

## すぐに修正しなかった理由

このリポジトリのコード自体にバグがあるわけではなく、「テスト実行に必要な外部バイナリ
（Playwright の Chromium、約 180MB）をどう確実に用意するか」という開発者体験・
CI 構成の設計判断が必要な問題であり、単純な1行修正では済まないため、直接の修正は
見送り、この Issue 化に留めた。

- 対処方法が複数あり、それぞれトレードオフが異なる（下記「修正方法の提案」参照）。
- `postinstall` でブラウザを自動ダウンロードする場合、
  - すべての `pnpm install` 実行（型チェックだけしたい CI ジョブや Rust 側の
    作業者を含む）でネットワークアクセスと数百MBのダウンロード・ディスク消費が
    発生するようになり、影響範囲がテスト実行に閉じない。
  - オフライン環境やネットワーク制限のある環境で `pnpm install` 自体が失敗する
    リスクが増える。
- `vitest.config.ts` や `package.json` の `test` スクリプトの構成を変える場合、
  「ブラウザテストを常にカバレッジに含めるか」「ローカルでは jsdom のみを既定に
  するか」といったテスト戦略上の意思決定が必要で、チームでの合意が望ましい。

## 修正方法の提案

以下のいずれか、または組み合わせを検討する。

1. **`package.json` に Playwright ブラウザの取得を明示する scripts を追加する**
   - 例: `"test:setup": "playwright install chromium"` を追加し、
     README / CONTRIBUTING に「初回セットアップ時に `pnpm test:setup` を
     実行する」旨を明記する。
   - 変更が小さく、既存の `pnpm install` の挙動やネットワーク要件を変えない。
   - ただし手動実行が前提のため、実行し忘れは防げない。

2. **`pnpm test` を jsdom / browser で分離する**
   - `"test": "vitest --run --project jsdom"` のように既定を jsdom のみに絞り、
     Playwright ブラウザが必要なテストは `"test:browser": "vitest --run
     --project browser"` のような別スクリプトに切り出す。
   - CI では `test` と `test:browser` の両方を実行するようにワークフローを
     更新する。
   - ローカルで `pnpm test` を実行した際にブラウザ未インストールによる
     ノイズが出なくなる一方、`FolderList.browser.test.tsx` のカバレッジを
     ローカルで見落としやすくなるリスクがある。

3. **`husky` の `prepare` フックや `postinstall` で自動インストールする**
   - `pnpm install` 完了後に自動で Playwright ブラウザを取得する。
   - 開発者が手順を意識せずに済む一方、前述のとおり全 `pnpm install` の
     ネットワーク・ディスクコストが増える。
   - CI の `lint` ジョブなど Playwright ブラウザを必要としないジョブにも
     コストが波及するため、対象を絞る工夫（例: 環境変数でスキップ可能にする）
     が必要になる。

4. **Vitest 側でブラウザ未インストール時のフォールバックを用意する**
   - Playwright ブラウザが存在しない場合は `browser` プロジェクトをスキップし、
     警告メッセージ1行のみを出すようなラッパースクリプトを `test` に導入する。
   - ノイズは減らせるが、実装・保守コストが増え、
     「気づかないうちにブラウザテストが常にスキップされている」状態を招く懸念がある。

対応方針の決定にはテスト戦略上のトレードオフ判断が必要なため、
チームでの合意のうえで方針を確定し、対応 Issue として起票することを推奨する。

## 関連

- `.github/workflows/ci.yml`（`frontend-test` ジョブでのみ `playwright install`
  を実行している）
- `vitest.config.ts`（`browser` プロジェクト定義）
- `src/features/folder-navigation/components/FolderList/__test__/FolderList.browser.test.tsx`
