# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

React 19のReact Compiler導入により、`useMemo`/`useCallback`による手動メモ化が不要になりました。本機能では、`useOpenImageFile`、`useKeyboardHandler`、`useControlsVisibility`の3フック、および`Sidebar`コンポーネントから手動メモ化を削除し、コードをシンプル化します。既存のテストスイートで動作を保証し、パフォーマンスが維持されることを検証します。

## Technical Context

**Language/Version**: TypeScript 5.6+, React 19  
**Primary Dependencies**: React 19 (React Compiler有効), Vite 6, Tailwind CSS 4, SWR, Tauri v2  
**Storage**: N/A（ローカルファイルシステム経由の画像アクセス）  
**Testing**: Vitest 3.2+ (jsdom), @testing-library/react 16, Storybook 9  
**Target Platform**: Desktop (Linux, Windows, macOS) - Tauriアプリケーション  
**Project Type**: Desktop application（機能ベースアーキテクチャ）  
**Performance Goals**: UI操作のレスポンス時間 <100ms、画像表示60fps  
**Constraints**: React Compilerによる自動最適化前提、手動メモ化削除後もパフォーマンス維持（±5%以内）  
**Scale/Scope**: 5ファイル対象（3フック + 1コンポーネント）、既存テストカバレッジ維持

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. 機能ベースアーキテクチャ
✅ **合格**: 変更は既存の機能（`folder-navigation`、`image-viewer`、`app-shell`）内で完結。新しい機能の追加なし。

### II. 型安全性
✅ **合格**: 手動メモ化削除は型シグネチャを変更しない。TypeScriptの厳格モードは維持。`useCallback`削除後も関数の型は不変。

### III. 品質ゲート
✅ **合格**: 全ての変更後に`pnpm type-check`、`pnpm lint`、`pnpm test`、`pnpm build`を実行。Success Criteria SC-003で明示的に要求。

### IV. テスト容易性のための依存性注入
✅ **合格**: 既存のDIパターンを維持。`FileSystemService`インターフェースは変更なし。テストは既存のモックサービスを使用。

### V. テスト戦略
✅ **合格**: 既存のテストスイート（単体テスト、統合テスト）を使用してリグレッション検出。Success Criteria SC-002で100%テスト合格を要求。

**総合判定 (Phase 0後)**: ✅ **全てのゲート合格** - Phase 0研究に進行可能

---

### Post-Phase 1 Re-evaluation

**I. 機能ベースアーキテクチャ**: ✅ 維持  
- `data-model.md`で確認: 全ての変更は既存の機能境界内で完結
- 新しいエクスポートや機能間の依存関係は追加されていない

**II. 型安全性**: ✅ 維持  
- `contracts/typescript-api-contracts.md`で確認: 全ての公開型シグネチャは不変
- TypeScriptコンパイラが契約の一致を保証

**III. 品質ゲート**: ✅ 維持  
- `quickstart.md`で各ステップごとに品質ゲート実行を要求
- 自動化されたゲート（`pnpm test`等）で継続的に検証

**IV. テスト容易性のための依存性注入**: ✅ 維持  
- DIパターンは変更されていない
- `data-model.md`で確認: `FileSystemService`等のインターフェースは不変

**V. テスト戦略**: ✅ 維持  
- `research.md`のテスト戦略で確認: 既存テストで十分（新規テスト不要）
- 実装の詳細ではなく動作をテスト（憲章V準拠）

**Phase 1後の総合判定**: ✅ **全てのゲート合格** - Phase 2 (tasks生成) に進行可能

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── features/
│   ├── folder-navigation/
│   │   ├── hooks/
│   │   │   ├── useOpenImageFile.ts          # 対象: useCallback削除
│   │   │   └── __tests__/
│   │   │       └── useOpenImageFile.test.ts  # 既存テストで検証
│   │   ├── components/
│   │   │   ├── Sidebar.tsx                   # 対象: useMemo削除
│   │   │   └── __tests__/
│   │   │       └── Sidebar.test.tsx          # 既存テストで検証
│   │   └── index.ts
│   ├── image-viewer/
│   │   ├── hooks/
│   │   │   ├── useKeyboardHandler.ts         # 対象: useCallback削除
│   │   │   ├── useControlsVisibility.ts      # 対象: useCallback削除
│   │   │   └── __tests__/
│   │   │       ├── useKeyboardHandler.test.ts
│   │   │       └── useControlsVisibility.test.ts
│   │   └── index.ts
│   └── app-shell/
└── __tests__/
    └── App.test.tsx                          # 統合テスト
```

**Structure Decision**: 既存の機能ベースアーキテクチャを維持。変更は5ファイルに限定され、各機能内で完結。テストは既存の`__tests__/`ディレクトリに存在し、リグレッション検出に使用。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
