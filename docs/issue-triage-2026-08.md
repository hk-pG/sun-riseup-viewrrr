# GitHub Issue 現状照合（2026-08-18）

照合対象: `feature/keyboard-shortcut` HEAD（`88f2fb7` 付近）。
オープン Issue 16 件を現行コード・ADR・クローズ済み Issue と突き合わせ、**その後のアクション**で分類した。

ラベルの意味:

| アクション | 意味 |
|---|---|
| **クローズしてよい** | 起票内容は現行コードで充足。残作業があっても別 Issue にするほどではない |
| **方針を更新してから着手** | やりたいことは残っているが、起票時の修正案・前提が陳腐化している |
| **これから実装** | 方針は今も有効。未着手または残作業が明確 |
| **着手基準待ち** | 今やる理由が薄い。条件が来てから再評価 |

---

## 1. 分類サマリー

| アクション | Issue |
|---|---|
| クローズしてよい | #42, #46, #49, #51 |
| 方針を更新してから着手 | #6, #20, #27, #50, #56 |
| これから実装 | #2, #39, #40, #41, #121, #122 |
| 着手基準待ち | #5（#6 の再設計後） |

特に起票時から前提が変わっているもの: **#6, #20, #27, #46, #49, #51, #56**。

---

## 2. クローズしてよい

起票時の ToDo は現行コードで実質完了。Issue 本文が古い API 名のまま残っているだけ。

| # | タイトル | 起票時の前提 | 現行コード | 残作業 |
|---|---|---|---|---|
| 42 | `core_logic::fs` の引数型を Rust 慣例に準拠 | `list_images_in_folder(folder_path: String)` / `get_sibling_folders(folder_path: String)` | 公開 API は `list_image_handles` / `resolve_images_in_range` / `get_sibling_containers` で、いずれも `impl AsRef<Path>`。元の `String` API は消滅 | ドキュメント（`docs/specs/016-...`, copilot-instructions）が旧 API 名のまま。Issue クローズ時に一言残す程度 |
| 46 | プロジェクトルートのフォルダ構成を整理 | ルートに `specs/`・`data/`・`test_images/` が散在 | `docs/specs/` へ集約済み。`tests/fixtures/data/` あり。ルートの `specs/` / `data/` / `test_images/` は無い | `docs/README.md` や `docs/architecture/` 分割、テスト画像の fixtures 化は未実施。構成整理の本丸は終わっているので、残りは任意 |
| 49 | `beforeEach` の `setupTauriMocks()` 二重呼び出し | グローバル setup と各テストの `beforeEach` が同関数を二重実行 | `setupTauriMocks` 自体が消滅。`src/test/mocks.ts` の `vi.mock` + `resetAllMocks()` に置き換わっている | `docs/testing-strategy.md` 追記は未了（ファイル自体が `testing-strategy-2026-05.md` に置き換わり、そちらも `setupTauriMocks` 記述が古い） |
| 51 | ストーリーのモック命名とローカルモック統合 | 4 つの `*.stories.tsx` が同名 factory を持ち、`openFolderAction.test.ts` が `as unknown as FileSystemService` | Storybook ファイルは 0 件。`openFolderAction.test.ts` / `helpers.ts` / `useOpenImageFile.test.ts` はいずれも `createMockFileSystemService` を使用 | なし。DoD のストーリーリネームは対象消失 |

クローズ案: 本文に「現行コードで充足。2026-08 照合」と書いて閉じる。#46 だけ残作業をコメントに残す。

---

## 3. 方針を更新してから着手

やりたいことは残っているが、**起票時のパッチ案をそのまま実装すると現行設計と衝突する**。

| # | タイトル | 何が変わったか | 今やるなら |
|---|---|---|---|
| 27 | App レベルでキーボードナビゲーションが動作しない | 症状は残っている（`App.tsx` は今も `keyboardMapping` 未渡し、`useKeyboardHandler` は `enabled ?? false`）。ただし ADR-003 で **「App が mapping を組み立てて渡す」案は却下**。代わりに `useViewerActions.dispatch` と `createDefaultKeyboardMapping` を `ImageViewer` 内で配線する。`dispatch` と ViewerControls 接続まではこのブランチで実装済み。キーボード配線だけ未完 | Issue 本文を ADR-003 準拠に書き換える。DoD の「#18 の E2E シナリオ3 を更新」は無効（#18 は Storybook 前提でクローズ、Storybook 自体も削除済み）。残作業は `ImageViewer` でデフォルト mapping を生成し `onAction → dispatch` すること |
| 6 | カレントディレクトリを複数前提で再設計 | 「コレクションクラス + サイドバーは 0 番目だけ使う」は、その後の `ImageContainer` / `LocalFolderContainer` / `useSiblingContainers` 導入で前提が崩れた。今の `AppState` は単一 `currentFolderPath` のまま | #5 の前準備としては有効だが、コレクションクラスではなく **コンテナ抽象の上に「ルート集合」を載せる**形で書き直す |
| 20 | Zustand による段階的状態管理スケールアップ | 着手基準「`AppState` が 5 フィールド超」は未達（今は 2 フィールド）。Command Registry / Result パターン / `useViewerActions` で App の状態は既に分割済み。参照先 `docs/state-management-analysis.md` は欠落 | Zustand を前提にしない。肥大化したら再評価、今は着手しないか Issue を「条件付きバックログ」に落とす |
| 56 | アーカイブ画像をカスタム URI スキームでオンデマンド提供 | ADR-002 が **2 フェーズ API（handles + 範囲展開）** を採用済み。#1 / #55 も完了扱い。一方 `useImages` はまだ `resolveRange(0, handles.length)` で全件解決しており、ADR-002 マイルストーン 1 が未達。カスタムスキームは「ディスク展開しない」別アーキテクチャ | カスタム URI は ADR-002 の代替案であり、今の本線ではない。本線の残は `useImages` のチャンク化（`docs/adr-002-todo-milestone.md`）。#56 は「ディスク展開すら嫌になったら再検討」に格下げ |
| 50 | `mocks.ts` 未使用エクスポートに型安全性 | `createMockFileSystemServiceWithThumbnails` は未使用のまま。ただし戻り値型は既に `: FileSystemService` で、起票時の「`satisfies` が無くサイレント乖離」リスクは相当下がっている。`mockStoreInstance` は内部の `resetAllMocks` が使っている | `satisfies` 追加と未使用 factory 削除は任意の片付け。独立 Issue にする優先度は低い。#49 とまとめてクローズし、残りは `docs/test-mock-refactor-todo.md` に寄せてもよい |

---

## 4. これから実装（方針は有効）

起票時の問題が現行コードでも再現・残存している。

| # | タイトル | 現行コードの根拠 | 優先度の目安 |
|---|---|---|---|
| 2 | ドラッグ＆ドロップでファイル・フォルダを開く | `data-tauri-drag-region` はウィンドウ移動用のみ。ファイル drop ハンドラは無い | ユーザー向け機能。P1 ラベルどおり着手候補 |
| 39 | サムネイルパス入力のセキュリティ検証 | `get_or_create_thumbnail(image_path: &str)` は存在確認のみ。`canonicalize` もベースディレクトリ検証も無い。ローカルアプリなので実害は限定的 | 低リスク。やるなら thumbnail 入口に一箇所 |
| 40 | 小さいサムネイルのアップスケーリング回避 | `calculate_thumbnail_dimensions` は入力サイズを見ずターゲットへ拡大。`test_calculate_thumbnail_dimensions_small_image` は 50×50 → 200×200 を期待したまま | 小さな品質改善。テスト期待値を変えれば完了 |
| 41 | バッチ処理時のスレッドプール毎回生成 | `prefetch_folder_thumbnails` が呼ぶたびに `BatchThumbnailGenerator::with_default_config` を new。サイドバープリフェッチがある今は起票時より呼び出し頻度は上がっている。一方 `core_logic` TODO では「キャッシュ未チェックで毎回解凍」の方が大きい | スレッドプール再利用より、先に prefetch のキャッシュスキップ（`src-tauri/core_logic/docs/todo.md` の 2）を見た方が効果が出やすい。#41 単体は測定してから |
| 121 | `useSiblingFolders.test.tsx` の `act()` 警告 | ファイルは `useSiblingContainers` テストに改名済みだが、アンマウント直後に Promise 完了を待つパターンはそのまま。フック側の `mounted` ガードはある | テストだけ直せる。低〜中 |
| 122 | Playwright 未インストール時のテストエラー | CI は `playwright install --with-deps` 済み。README のセットアップには無い。リポジトリに `environment.json` も無い。`AGENTS.md` だけ Cloud Agent 向けに触れている | README に `pnpm exec playwright install chromium` を足すのが最小。`postinstall` は重量のため非推奨のままが妥当 |

---

## 5. 着手基準待ち

| # | タイトル | 理由 |
|---|---|---|
| 5 | カレントディレクトリを複数管理 | プロダクトアイデアとしては生きている。ただし #6 の「前準備」が現行抽象とずれているので、#6 を書き直してからでないと実装単位が決まらない。独立に DnD（#2）やキーボード（#27）を先に進めてよい |

---

## 6. クローズ済み Issue との関係（参考）

オープン Issue の前提が、クローズ済み Issue で既に変わっているもの。

| クローズ | 関係するオープン | メモ |
|---|---|---|
| #1 圧縮ファイル対応（2026-08-18 完了） | #56 | アーカイブ閲覧自体は入った。残りは提供方式（ディスク展開 vs URI） |
| #18 Playwright E2E（Storybook で代替してクローズ） | #27 | Storybook 削除済み。ブラウザテストは `FolderList.browser.test.tsx` のみ。#27 の E2E DoD は破棄してよい |
| #31 エッジケーステスト（コンテナ抽象化のためクローズ） | #42 | 旧関数名ベースの Issue は同様にクローズが自然 |
| #32 サムネイルを core_logic へ分離 | #39 #40 #41 #42 | レビュー派生。#42 は完了、他 3 つは残件 |
| #35 テスト基盤整理 | #49 #50 #51 | 親はクローズ。子のうち #49/#51 は完了相当 |
| #55 サムネイル時の全解凍廃止 | #41 #56 | 先頭 1 ファイル書き出しは入った。全件ビューア展開とスレッドプールは別問題 |
| #16 サムネイル最適化をバックエンドへ | #41 | コマンドは `get_container_thumbnail` / `prefetch_folder_thumbnails` に寄った。毎回 `new` する点は残っている |

---

## 7. 推奨する次の動き

1. **即クローズ**: #42, #49, #51。#46 は残コメント付きでクローズ可。
2. **本文更新が先**: #27（ADR-003 準拠に書き換え → `ImageViewer` 配線をこのブランチで完了）。
3. **格下げ / 書き換え**: #56 → ADR-002 マイルストーン 1（`useImages` チャンク化）を本線にする。#6/#20/#50 はバックログ文言を現況に合わせる。
4. **通常の実装キュー**: #2（DnD）、#122（README）、#121（act 警告）、その後 #40 → #39。#41 は測定前提。
5. **触らない**: #5 は #6 再設計まで待ってよい。

この照合はコードと Issue 本文の差分確認であり、GitHub 上の close / ラベル変更は含まない。
