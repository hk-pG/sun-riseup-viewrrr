# Implementation Plan: サイドバーとビューアのスクロール動作修正

**Branch**: `003-fix-sidebar-scroll` | **Date**: 2026年1月3日 | **Spec**: [specs/003-fix-sidebar-scroll/spec.md](specs/003-fix-sidebar-scroll/spec.md)
**Input**: Feature specification from `/specs/003-fix-sidebar-scroll/spec.md`

## Summary

サイドバーとビューアエリアの高さを同期させ、通常表示時はビューアにスクロールバーを出さず、サイドバーのみ独立スクロールとする。ズーム時のみビューアにスクロールを許可し、ウィンドウリサイズや画像切替でも一貫したレイアウトを維持する。実装は既存のReact 19 + Tailwindレイアウトを前提に、CSSレイアウト（flex/grid）、`overflow`制御、`min-height: 0`の適用とズーム状態による条件付きスクロールで対応する。

## Technical Context

**Language/Version**: TypeScript 5.6+, React 19, Rust (Tauri v2)  
**Primary Dependencies**: Vite 6, Tailwind CSS 4, SWR（既存利用、今回の変更は主にレイアウト調整）  
**Storage**: なし（ローカルファイル閲覧のみで新規永続化は不要）  
**Testing**: Vitest + @testing-library/react（レイアウト/スクロール挙動の単体・統合テスト）  
**Target Platform**: Tauriデスクトップ（Windows/macOS/Linux）  
**Project Type**: 単一プロジェクト（Tauri + Reactフロントエンド）  
**Performance Goals**: レイアウト再計算・表示切替は体感無遅延（~50ms以内）、スクロール/ズーム時60fpsを維持  
**Constraints**: 画像ナビゲーションで `useTransition` を使わない、`any`禁止、品質ゲート（type-check/lint/test/build）を通過  
**Scale/Scope**: 数百〜千程度のファイル/サムネイルを含むフォルダで快適に動作（スクロールとリサイズで破綻しない）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- 機能ベースアーキテクチャ: 既存 `features/app-shell`, `features/folder-navigation`, `features/image-viewer` を維持し、共有ロジックは `shared/` に限定する → **PASS**
- 型安全性: TypeScript厳格モードと `import type` を順守、`any`禁止 → **PASS**
- 品質ゲート: `pnpm type-check`, `pnpm lint`, `pnpm test`, （必要に応じ `pnpm build`）をコミット前に実行 → **PASS**
- 依存性注入: Tauri APIはアダプター層のみ。今回変更はレイアウト/UIのみで直接呼び出しなし → **PASS**
- 画像ナビゲーションで `useTransition` 禁止: 影響なし（レイアウト調整のみ） → **PASS**

## Project Structure

### Documentation (this feature)

```text
specs/003-fix-sidebar-scroll/
├── plan.md              # このファイル
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 (/speckit.tasks で作成)
```

### Source Code (repository root)

```text
src/
├── App.tsx                 # ルートレイアウト/ハンドラー
├── features/
│   ├── app-shell/          # グローバルシェル/メニュー
│   ├── folder-navigation/  # サイドバー（フォルダ/リスト）
│   └── image-viewer/       # ビューア本体とコントロール
├── shared/                 # 共通UI・コンテキスト・ユーティリティ
└── test/                   # テストセットアップ/モック

specs/                      # 機能別ドキュメント
```

**Structure Decision**: 既存の単一プロジェクト構成（Tauri + React）を継続し、レイアウト調整は `App.tsx` と該当機能（app-shell/folder-navigation/image-viewer）のコンポーネント内で完結させる。新規パッケージやサブプロジェクトの追加は不要。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| なし |  |  |
