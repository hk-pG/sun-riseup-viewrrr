# Tasks: サイドバーとビューアのスクロール動作修正

**Input**: Design documents from `/docs/specs/003-fix-sidebar-scroll/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 現行レイアウト/テスト環境の確認と整備

- [ ] T001 package.json のスクリプトと依存を確認し、plan記載の品質ゲートが利用可能であることを確認（変更不要の場合は記録のみ） in package.json
- [ ] T002 [P] テストユーティリティの現状を確認し、スクロール検証に再利用できる関数を特定してメモ in test/ui-responsiveness-test-utils.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 全ユーザーストーリーで共通利用するテスト補助の整備

- [ ] T003 スクロール状態/overflowを検証するテストヘルパーを追加（要素のcomputed style取得関数など） in test/ui-responsiveness-test-utils.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - ビューア画像の全体表示 (Priority: P1) 🎯 MVP

**Goal**: 通常表示でビューアに縦スクロールバーが出ず、画像がビューア内に収まる

**Independent Test**: 任意画像を開いてウィンドウリサイズ/画像切替を行ってもビューアにスクロールバーが出ないことを確認

### Tests for User Story 1

- [ ] T004 [P] [US1] ビューア通常表示で `overflow` が hidden になりスクロールが無いことを検証するテスト追加 in src/__tests__/ViewerLayout.test.tsx
- [ ] T005 [P] [US1] ウィンドウ幅・高さ変更でスクロールが出ないことを確認するリサイズテスト追加 in src/__tests__/ViewerLayout.test.tsx

### Implementation for User Story 1

- [ ] T006 [US1] ルートレイアウトをヘッダー直下 `flex` 並びにし、サイドバー/ビューア子に `min-h-0` と高さ計算を適用 in src/App.tsx
- [ ] T007 [P] [US1] ビューアラッパーをデフォルト `overflow-hidden` にし、等倍表示でスクロールしないようスタイル調整 in src/features/image-viewer/components/
- [ ] T008 [P] [US1] 画像切替時にビューアスクロール位置をリセットする処理を追加 in src/features/image-viewer/hooks/ or components/

**Checkpoint**: User Story 1 は独立して検証可能

---

## Phase 4: User Story 2 - サイドバーの独立スクロール (Priority: P1)

**Goal**: サイドバーのみが縦スクロールし、ビューアに影響を与えない

**Independent Test**: 多数フォルダを表示しスクロールしてもビューア表示が固定されることを確認

### Tests for User Story 2

- [ ] T009 [P] [US2] サイドバーだけにスクロールバーが出てビューアが固定されることを検証するテスト追加 in src/__tests__/SidebarScroll.test.tsx

### Implementation for User Story 2

- [ ] T010 [US2] サイドバーコンテナに `overflow-y-auto` と `min-h-0` を適用し高さ同期を保証 in src/features/folder-navigation/components/
- [ ] T011 [P] [US2] サイドバーのスクロール位置が画像操作で変化しないことを担保（必要ならキー/状態を分離） in src/features/folder-navigation/hooks/ or containers/

**Checkpoint**: User Story 1 & 2 が独立に成立

---

## Phase 5: User Story 3 - ズーム時のビューアスクロール (Priority: P2)

**Goal**: ズーム時のみビューアがスクロール可能になり、ズームアウトで非表示に戻る

**Independent Test**: ズームインでスクロールバーが出現し、ズームアウトで消え、スクロール位置がリセットされることを確認

### Tests for User Story 3

- [ ] T012 [P] [US3] ズームイン時のみ `overflow-auto` になりスクロールできることを検証するテスト追加 in src/__tests__/ViewerZoomScroll.test.tsx
- [ ] T013 [P] [US3] ズームアウトでスクロールバーが消え位置もリセットされることを検証するテスト追加 in src/__tests__/ViewerZoomScroll.test.tsx

### Implementation for User Story 3

- [ ] T014 [US3] ズーム倍率に応じてビューアラッパーの `overflow` を切り替えるロジックを実装 in src/features/image-viewer/components/ or hooks/
- [ ] T015 [P] [US3] ズーム状態でのスクロール位置リセットを画像切替時に適用 in src/features/image-viewer/hooks/ or components/

**Checkpoint**: User Story 1-3 が独立に成立

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T016 [P] quickstart.md の手順に沿った動作確認結果を追記 in docs/specs/003-fix-sidebar-scroll/quickstart.md
- [ ] T017 ドキュメント（plan/spec）で変更点があれば更新 in docs/specs/003-fix-sidebar-scroll/
- [ ] T018 品質ゲート実行: `pnpm type-check && pnpm lint && pnpm test`（必要に応じ `pnpm build`） in repo root

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 → User Stories (Phase 3/4/5) → Polish (Phase 6)
- User stories優先度: US1 (P1) → US2 (P1) → US3 (P2)
- テストタスクは各ストーリー内で実装前に着手可能（[P]）

## Parallel Opportunities

- [P] 付きタスクはファイル競合がないため並行可（例: T002, T003, T004, T005, T007, T008, T009, T011, T012, T013, T015, T016）
- ストーリー単位では Phase 2 完了後、US1/US2/US3 を別担当で並行可能（ただし優先度順でデモする場合は US1 → US2 → US3）

## Implementation Strategy

- **MVP**: US1 完了で「通常表示でスクロールなし」をデモ可能
- **Incremental**: US2 でサイドバー独立スクロール、US3 でズーム時スクロールを追加
- 各ストーリー完了ごとにテスト実行・デモでリグレッションを確認
