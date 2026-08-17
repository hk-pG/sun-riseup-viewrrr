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

## Cursor Cloud specific instructions

### Language preference (user-facing vs agent-facing)

- Write anything the **user will read** in **Japanese**. This includes GitHub PR titles/bodies,
  review replies intended for the user, and chat messages to the user.
- Agent-facing / internal docs (for example most of this `AGENTS.md`, commit messages that are
  not meant as user-facing prose, code comments following repo convention) may stay in **English**.
  This repo's user-facing commit messages remain Japanese Conventional Commits, as in 基本方針.

This repo is **`sun-riseup-viewrrr`**, a Tauri v2 cross-platform desktop image viewer:
a React 19 + TypeScript + Vite frontend (`src/`) and a Rust backend / Cargo workspace
(`src-tauri/`, with the domain logic in `src-tauri/core_logic`). Standard commands live in
`package.json`, `.github/workflows/ci.yml`, and `README.md` — prefer those as the source of truth.

### Running the app in the cloud VM (non-obvious)

- The full desktop app (`pnpm tauri dev` / `pnpm tauri build`) needs a GUI + WebKitGTK display
  and will not run in the headless cloud VM.
- To run/inspect the real UI here, use **mock mode**: `pnpm dev:mock` (sets `VITE_MOCK=true`,
  serves Vite on `http://localhost:1420`). This stubs the Rust/Tauri backend via
  `src/dev/mockService.ts` so the frontend runs in a plain browser.
- Mock-mode gotcha: only the **first** folder is populated with images; the other generated
  "ダミーフォルダ" (dummy folders) are intentionally empty, and image navigation is limited.
  This is expected mock behavior, not a bug.

### Toolchain notes (non-obvious)

- The Rust build requires a toolchain that supports **edition2024** (Rust >= 1.85) because of a
  transitive `toml` dependency. Neither `.tool-versions` nor CI pins Rust, and older stable
  toolchains (e.g. 1.83) fail with `feature 'edition2024' is required`. The VM snapshot ships a
  recent stable (`rustup default stable`).
- Rust tests need the Linux Tauri system libs (`libwebkit2gtk-4.1-dev`, `libappindicator3-dev`,
  `librsvg2-dev`, `patchelf`); these are preinstalled in the snapshot.
- The `browser` Vitest project (`*.browser.test.tsx`) runs in real headless Chromium via
  Playwright; the Playwright chromium browser is installed by the update script.

### Commands

- Lint: `pnpm lint` (Biome)
- Frontend tests: `pnpm test` (Vitest; jsdom + Playwright/chromium browser projects)
- Rust tests: `cd src-tauri && cargo test --workspace`
- Frontend build: `pnpm build`

### Git hooks

`core.hooksPath` may be overridden by Cursor agent hooks. The repo's own `.githook/pre-commit`
runs `pnpm build`, `pnpm lint`, and `pnpm test` when `src/` changes, and `cargo test --workspace`
when `src-tauri/core_logic` changes.
