# sun-riseup-viewrrr — Agent Instructions

Tauri v2 + React 19 + TypeScript の画像ビューア。機能ベースアーキテクチャ（`src/features/`）。

## 基本方針

- **回答は日本語**
- ソース変更後は品質ゲートを実行し、結果を報告する
- 問題発生時は即修正せず、詳細を報告して指示を待つ
- コミットは明示的な依頼がある場合のみ。メッセージは日本語（Conventional Commits）
- 大きな変更はこまめにコミットし、ロールバック可能に保つ

## 品質ゲート（変更後に実行）

```bash
pnpm type-check
pnpm lint
pnpm test
```

本番相当の変更では `pnpm build` も実行。詳細は @.specify/memory/constitution.md を参照。

## アーキテクチャ（要点のみ）

| 機能 | 役割 |
|------|------|
| `app-shell` | メニュー、グローバルアクション |
| `folder-navigation` | サイドバー、フォルダ操作 |
| `image-viewer` | 画像表示、キーボード操作 |
| `shared` | DI、Tauri アダプター、共通 UI |

- 機能間の直接インポート禁止。公開 API は各機能の `index.ts` 経由（`@/features/...`）
- Tauri API は `useServices()` 経由。アダプター外での `@tauri-apps/*` 直接呼び出し禁止
- テストは `ServicesProvider` + `src/test/mocks.ts` でモック注入

## 落とし穴（必ず守る）

- 画像ナビゲーションに `useTransition` を使わない
- フォルダ変更時は `ImageViewer` に `key` prop を付ける
- `any` 型を使わない
- 機能間の循環依存を作らない

## 詳細は参照先を読む

作業内容に応じて、必要なファイルを `@` で参照してから進める。

| 知りたいこと | 参照先 |
|-------------|--------|
| 原則・品質ゲート・技術スタック | @.specify/memory/constitution.md |
| 日常開発・コマンド・ブランチ規約・タスク手順 | @.github/copilot-instructions.md |
| Issue 作業開始 | @.github/prompts/issue-start.prompt.md |
| Issue 作業完了・PR | @.github/prompts/issue-finish.prompt.md |
| Spec 駆動開発（SpecKit） | @.github/prompts/speckit.implement.prompt.md |
| 状態管理の方針 | @docs/state-management-analysis.md |
| メニューアクション設計 | @docs/menu-action-architecture.md |
| Tauri 跨層変更（FS 拡張） | @.github/copilot-instructions.md の「FileSystemService の拡張」 |
| 設計の stress-test | @.agents/skills/grill-me/SKILL.md |

## ブランチ（要点）

- PR のマージ先: `feature/core`（`main` への直接 PR 禁止）
- 命名: `{type}/issue-{番号}-{短い説明}`（例: `fix/issue-13-react-security-patch`）
