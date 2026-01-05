# Implementation Plan: Rust Backend Thumbnail Optimization

**Branch**: `001-rust-thumbnail-optimization` | **Date**: 2026-01-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-rust-thumbnail-optimization/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Rustバックエンドでサムネイル生成処理を実装し、既存のフロントエンド最適化（スクロール中の画像非表示）との定量的な性能比較を行う。高解像度画像（4000×3000px、5MB）を200×200pxのサムネイルに変換してディスクキャッシュに保存し、WebKitGTKの画像デコード/GPU転送ボトルネックを根本的に解決する。並列処理（rayon）により複数画像を同時処理し、初回ロード時間とスクロール性能を改善する。

## Technical Context

**Language/Version**: 
- Frontend: TypeScript 5.6+, React 19.1.4
- Backend: Rust 1.75+ (Tauri 2.x)

**Primary Dependencies**:
- Frontend: Vite 6, Tailwind CSS 4, SWR 2.3.3, shadcn/ui
- Backend: image (Rust画像処理), rayon (並列処理), sha2 or blake3 (ハッシュ生成)
- Tauri: @tauri-apps/api, @tauri-apps/plugin-fs, @tauri-apps/plugin-dialog

**Storage**: 
- ディスクキャッシュ: `$XDG_CACHE_HOME/sun-riseup-viewrrr/thumbnails/` (Linux) または相当パス (macOS)
- キャッシュファイル: {SHA256(元画像パス)}.jpg (JPEG品質60、最大1GB、LRU削除)

**Testing**: 
- Frontend: Vitest 3.2+, @testing-library/react 16, Storybook 9
- Backend: cargo test
- E2E: Playwright (必要に応じて)

**Target Platform**: 
- Linux (WebKitGTK 2.50.2, Pop!_OS 24.04)
- macOS (WKWebView)

**Project Type**: Desktop application (Tauri) - hybrid architecture

**Performance Goals**:
- スクロールFPS: 60fps維持（100フォルダ、高速スクロール）
- 初回ロード: 可視領域10件を2秒以内、全100件を合理的時間内
- キャッシュヒット: 100ms以内で表示
- CPU使用率: 4コアマシンで平均50%以下（サムネイル生成中）

**Constraints**:
- WebKitGTKの同期画像デコード+GPU転送ボトルネック（5MB画像×100件）
- メモリ: サムネイル生成中のピーク使用量を許容範囲内に抑制
- ディスク: キャッシュ最大1GB、古いキャッシュを自動削除
- クロスプラットフォーム: Linux/macOS両環境で同等性能

**Scale/Scope**:
- 100フォルダ×5MB画像の同時処理
- サムネイル並列生成（最大4スレッド）
- 既存のFileSystemServiceインターフェース拡張
- 既存フロントエンド最適化との比較ベンチマーク

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. 機能ベースアーキテクチャ
✅ **Pass**: 既存の `src/features/folder-navigation/` 配下に統合。新規ファイルは適切なサブディレクトリ（`hooks/`、`types/`、`services/`）に配置。

### II. 型安全性
✅ **Pass**: 
- Rust側: 厳密な型システム（Result<T, E>、Option<T>）を使用
- TypeScript側: strict mode有効、新しいTauriコマンドの型定義を追加

### III. 品質ゲート
✅ **Pass**: コミット前に以下を実行
```bash
pnpm tauri build   # Rustコンパイル含むフルビルド
pnpm type-check    # TypeScript型検証
pnpm lint          # Biome lint
pnpm test          # Vitest + cargo test
```

### IV. 依存性注入
✅ **Pass**: 
- `FileSystemService`インターフェースを拡張（`src/shared/context/ServiceContext.tsx`）
- Tauri実装は`src/shared/adapters/tauriAdapters.ts`に追加
- テストモックは`src/test/mocks.ts`に追加

### V. テスト戦略
✅ **Pass**:
- 単体テスト: Rust側のサムネイル生成ロジック（cargo test）
- 統合テスト: useThumbnailフックとサービスインターフェース（Vitest + モックサービス）
- コンポーネントテスト: FolderView/Sidebarのサムネイル表示（Testing Library）

### 技術スタック制約
✅ **Pass**: 
- 承認されたスタック内（React 19、TypeScript 5.6、Tauri v2、Vite 6、SWR）
- 新規依存: Rust `image`, `rayon`, `sha2`/`blake3` クレート（標準的な選択）

### 開発ワークフロー
✅ **Pass**: 
- 変更前のライブラリ調査を実施
- 段階的実装とコミット
- 問題発生時の詳細報告

**総評**: 全ての憲章要件を満たしています。Phase 0に進行可能。

## Project Structure

### Documentation (this feature)

```text
specs/001-rust-thumbnail-optimization/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── typescript-api-contracts.md  # Tauriコマンド・フックのインターフェース定義
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Tauri Desktop Application Structure
src/                                    # Frontend (TypeScript/React)
├── features/
│   └── folder-navigation/
│       ├── components/
│       │   ├── FolderView.tsx         # [MODIFY] サムネイル表示ロジック更新
│       │   └── Sidebar.tsx            # [MODIFY] 最適化切り替え制御
│       ├── hooks/
│       │   └── useThumbnail.ts        # [MODIFY] 新Tauriコマンド呼び出し
│       └── types/
│           └── folderTypes.ts         # [MODIFY] 型定義追加
├── shared/
│   ├── adapters/
│   │   └── tauriAdapters.ts           # [MODIFY] FileSystemService実装拡張
│   ├── context/
│   │   └── ServiceContext.tsx         # [MODIFY] サービスインターフェース拡張
│   └── types/
│       └── service.ts                 # [MODIFY] サービス型定義追加
└── test/
    └── mocks.ts                        # [MODIFY] モックサービス追加

src-tauri/                              # Backend (Rust)
├── src/
│   ├── commands/
│   │   └── fs.rs                      # [MODIFY] 新コマンド追加: get_or_create_thumbnail
│   └── lib.rs                         # [MODIFY] コマンド登録
└── core_logic/                         # Rust business logic
    ├── Cargo.toml                     # [MODIFY] 依存追加: image, rayon, sha2/blake3
    └── src/
        └── thumbnail.rs               # [NEW] サムネイル生成ロジック
```

**Structure Decision**: Tauriのハイブリッドアーキテクチャに従い、フロントエンドは`src/`（React/TypeScript）、バックエンドは`src-tauri/`（Rust）に分離。機能ベースアーキテクチャを維持し、`folder-navigation`機能配下に変更を集約。コアロジックは`core_logic`クレートに実装し、Tauriコマンドを通じてフロントエンドに公開。

---

## Phase 0: Outline & Research

*To be completed by /speckit.plan command*

## Phase 1: Design & Contracts

*To be completed by /speckit.plan command*
