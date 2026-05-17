# Implementation Plan: React 19セキュリティパッチ適用

**Branch**: `002-react-security-patch` | **Date**: 2025-12-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/docs/specs/002-react-security-patch/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

React 19のセキュリティ脆弱性（CVE-2025-55182: CVSS 10.0、CVE-2025-55184: CVSS 7.5、CVE-2025-55183: CVSS 5.3）に対応するため、React 19.1.1から19.1.4へ段階的にアップグレードする。4つのフェーズ（P1: セキュリティパッチ、P2: React Compiler安定版、P3: テストライブラリ更新、P4: オプション最新版）で構成され、各フェーズ後にGitコミットを行い、ロールバック可能な状態を維持する。全ての品質ゲート（type-check, lint, test, build）を各フェーズで検証し、Tauri v2との互換性を保ちながら既存機能の動作を保証する。

## Technical Context

**Language/Version**: TypeScript 5.6+, React 19 (19.1.1 → 19.1.4)  
**Primary Dependencies**: React 19, React DOM 19, React Compiler (babel-plugin-react-compiler 19.1.0-rc.3 → 1.0.0), Vite 6, Tailwind CSS 4, SWR 2.3, Tauri v2  
**Storage**: N/A（ローカルファイルシステム経由の画像アクセス - アップグレード影響なし）  
**Testing**: Vitest 3.2+ (jsdom), @testing-library/react (16 → 16.3.1), @testing-library/jest-dom 6.6.3+, Storybook 9  
**Target Platform**: Desktop (Linux, Windows, macOS) - Tauriアプリケーション  
**Project Type**: Desktop application（機能ベースアーキテクチャ）  
**Performance Goals**: React Compiler自動最適化維持、UI操作レスポンス <100ms、画像表示 60fps（既存パフォーマンス維持）  
**Constraints**: Tauri v2互換性維持、React Compiler最適化維持（手動メモ化不要）、各フェーズ独立実行可能、ロールバック可能  
**Scale/Scope**: 依存関係更新のみ（5パッケージ: react, react-dom, @types/react, @types/react-dom, babel-plugin-react-compiler, @testing-library/react）、既存コード変更なし

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. 機能ベースアーキテクチャ
✅ **合格**: 依存関係更新のみで、既存の機能アーキテクチャ（app-shell、folder-navigation、image-viewer、shared）に変更なし。新しい機能の追加なし。

### II. 型安全性
✅ **合格**: 型定義パッケージ（@types/react、@types/react-dom）の更新により、TypeScriptの型安全性が維持・強化される。既存コードに変更なし。型チェック（pnpm type-check）は全フェーズで実行。

### III. 品質ゲート
✅ **合格**: 全フェーズ完了後に品質ゲート（pnpm type-check、pnpm lint、pnpm test、pnpm build）を実行。FR-008で明示的に要求。各フェーズでSC-002により100%合格を確認。

### IV. テスト容易性のための依存性注入
✅ **合格**: 既存のDIパターン（ServiceContext、useServices）に変更なし。テストは既存のモック（src/test/mocks.ts）を使用。アップグレードはDIアーキテクチャに影響しない。

### V. テスト戦略
✅ **合格**: 既存のテストスイート（単体テスト、統合テスト、コンポーネントテスト）を維持。@testing-library/react 16.3.1へのマイナー更新により、テスト戦略に影響なし。

**総合判定 (Phase 0前)**: ✅ **全てのゲート合格** - Phase 0研究に進行可能

---

### Post-Phase 1 Re-evaluation

**I. 機能ベースアーキテクチャ**: ✅ 維持  
- package.json の依存関係更新のみ、ソースコード変更なし

**II. 型安全性**: ✅ 維持  
- @types/react@19.2.7 と @types/react-dom 最新版への更新により型安全性向上

**III. 品質ゲート**: ✅ 維持  
- quickstart.md で各フェーズの品質ゲート実行手順を明確化

**IV. 依存性注入**: ✅ 維持  
- 既存の DI パターンに変更なし

**V. テスト戦略**: ✅ 維持  
- @testing-library/react 16.3.1 への更新により、既存のテスト戦略維持

**総合判定 (Phase 1後)**: ✅ **全てのゲート合格** - Phase 2タスク化に進行可能

## Project Structure

### Documentation (this feature)

```text
docs/specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: 本機能は依存関係更新のみで、ソースコード構造に変更なし。package.jsonとpnpm-lock.yamlのみ変更される。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*N/A - 全てのConstitution Checkゲートが合格しているため、複雑性の正当化は不要。*

---

## Phase 0: Research & Risk Analysis

**Status**: ✅ COMPLETE

### Research Document
- [x] `research.md`: セキュリティ脆弱性詳細、React Compiler移行戦略、依存関係互換性マトリックス、Tauri v2互換性、ロールバック戦略、品質ゲート戦略、パフォーマンス検証アプローチ

### Key Findings
1. **セキュリティ脆弱性**: CVE-2025-55182 (CVSS 10.0 RCE)、CVE-2025-55184 (CVSS 7.5 DoS)、CVE-2025-55183 (CVSS 5.3) - React 19.1.4で修正
2. **React Compiler移行**: 19.1.0-rc.3 → 1.0.0への移行は安全（破壊的変更なし）
3. **依存関係互換性**: 6パッケージすべて互換性あり（Tauri v2との競合なし）
4. **ロールバック戦略**: 各フェーズでGitコミット、`git revert`で即座にロールバック可能
5. **品質ゲート**: 各フェーズでtype-check, lint, test, buildを実行
6. **パフォーマンス検証**: React Profilerで測定、±5%以内を基準
7. **タイムライン**: Phase 1（必須）1時間、Phase 2-3（推奨）各30分、Phase 4（オプション）30分

---

## Phase 1: Detailed Design & Contracts

**Status**: ✅ COMPLETE

### Required Artifacts
(Created during Phase 1)

- [x] `data-model.md`: パッケージ依存関係のバージョン遷移状態を定義（Phase 1-4の状態遷移）
- [x] `contracts/package-contracts.md`: 各フェーズでのパッケージバージョン契約と検証要件を定義
- [x] `quickstart.md`: 4フェーズの段階的実行手順とロールバック方法を記述
- [x] Update Agent-Specific Context: copilot-instructions.mdを更新（Active Technologies追加）

### Constitution Re-evaluation Post-Design

Phase 1の設計完了後、constitution gateを再確認：

#### 1. Feature Architecture Gate
- ✅ 依存関係更新のみで、機能ベースアーキテクチャに影響なし
- ✅ app-shell、folder-navigation、image-viewerの構造は維持

#### 2. Type Safety Gate
- ✅ 型定義（@types/react, @types/react-dom）を含む更新計画
- ✅ 各フェーズでtype-checkを実行する契約を定義

#### 3. Quality Gates
- ✅ quickstart.mdで各フェーズごとの品質ゲート実行手順を明記
- ✅ package-contracts.mdで品質ゲート契約を定義

#### 4. DI Pattern Gate
- ✅ FileSystemService、ServiceContextに変更なし
- ✅ 依存性注入パターンは完全に維持

#### 5. Testing Strategy Gate
- ✅ Phase 3でTesting Libraryを更新する計画
- ✅ 各フェーズでテスト実行を必須化

**Result**: All constitution gates remain satisfied after detailed design. ✅

---

## Phase 2: Task Breakdown

**Status**: ⏳ PENDING (次のステップ)

### Next Command
```bash
# /speckit.tasks コマンドを実行してタスク分解を実施
# このコマンドは以下を生成します：
# - tasks.md: 実装タスクの詳細リスト
# - タスクの優先度と依存関係
```

### Prerequisites for Phase 2
- [x] Phase 0 研究完了（research.md）
- [x] Phase 1 設計完了（data-model.md, quickstart.md, contracts/）
- [x] Constitution Check再評価完了

---

## 完了報告

### Phase 0-1 成果物一覧

| ファイル | 目的 | 状態 |
|---------|------|------|
| [research.md](./research.md) | Phase 0研究文書：セキュリティ分析、依存関係調査、リスク評価 | ✅ 完了 |
| [data-model.md](./data-model.md) | データモデル：パッケージバージョン遷移状態定義 | ✅ 完了 |
| [quickstart.md](./quickstart.md) | クイックスタート：4フェーズ実行手順とロールバック方法 | ✅ 完了 |
| [contracts/package-contracts.md](./contracts/package-contracts.md) | パッケージ契約：バージョン要件と検証契約 | ✅ 完了 |
| [.github/copilot-instructions.md](../../.github/copilot-instructions.md) | エージェントコンテキスト更新：Active Technologies追加 | ✅ 完了 |

### Branch Information
- **Branch Name**: `002-react-security-patch`
- **Base Branch**: `main`
- **Spec Directory**: `/home/hk-p/repo/sun-riseup-viewrrr/docs/specs/002-react-security-patch/`

### Next Steps
Phase 1完了により、以下が可能になりました：
1. **タスク分解**: `/speckit.tasks` コマンドで実装タスクを生成
2. **実装開始**: `quickstart.md`に従って段階的実行
3. **品質保証**: 各フェーズで`package-contracts.md`の契約を検証

---

## 補足: speckit.plan ワークフローの完了

本ドキュメントは `.specify/templates/commands/plan.md` に定義された speckit.plan ワークフローに従って作成されました。

**実行フェーズ**:
- ✅ Phase 0: Research（research.md生成）
- ✅ Phase 1: Design & Contracts（data-model.md, quickstart.md, contracts/生成）
- ✅ Agent Context Update（copilot-instructions.md更新）
- ⏳ Phase 2: Task Breakdown（次のステップ: `/speckit.tasks`コマンド実行）

Phase 1までの計画立案は完了しました。次は `/speckit.tasks` コマンドを実行して実装タスクの詳細を生成してください。

