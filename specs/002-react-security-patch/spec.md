# Feature Specification: React 19セキュリティパッチ適用

**Feature Branch**: `002-react-security-patch`  
**Created**: 2025-12-30  
**Status**: Draft  
**Input**: User description: "React 19のセキュリティ脆弱性（CVE-2025-55182, CVE-2025-55184, CVE-2025-55183）に対応するため、段階的に安全なバージョンへアップグレードしたい"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 重大な脆弱性の即座の解消 (Priority: P1)

開発者が本番環境で稼働するアプリケーションのセキュリティリスクを最小限に抑えるため、React 19.1.1から19.1.4へ最小限のパッチを適用する。このアップグレードにより、リモートコード実行（CVSS 10.0）、サービス拒否（CVSS 7.5）、ソースコード露出（CVSS 5.3）の3つの重大な脆弱性が解消される。

**Why this priority**: CVE-2025-55182のCVSS 10.0は最高レベルの脆弱性であり、即座の対応が必要。React Server Componentsを使用していない本プロジェクトでも、セキュリティベストプラクティスとして修正版への移行は不可欠。

**Independent Test**: React 19.1.4へのアップグレード後、既存の全テスト・型チェック・lintが合格し、Tauriアプリケーションが正常に起動・動作することで検証可能。

**Acceptance Scenarios**:

1. **Given** React 19.1.1が依存関係に含まれている、**When** 開発者がReact 19.1.4とreact-dom 19.1.4にアップグレードする、**Then** package.jsonとpnpm-lock.yamlが更新され、全ての品質ゲート（type-check, lint, test, build）が合格する
2. **Given** 型定義が古いバージョンのまま、**When** 開発者が@types/react@19.2.7と@types/react-dom最新版に更新する、**Then** TypeScriptの型エラーが発生せず、既存コードの型安全性が維持される
3. **Given** アップグレード完了後、**When** 開発者がTauri devモードでアプリケーションを起動する、**Then** アプリケーションが正常に起動し、画像表示・フォルダナビゲーション・キーボード操作の全機能が動作する

---

### User Story 2 - React Compiler安定版への移行 (Priority: P2)

開発者がReact Compiler RC版（19.1.0-rc.3）から安定版（1.0.0）へ移行し、長期的なメンテナンス性とReact 19.1.4との互換性を確保する。自動最適化が正常に動作し、既存の手動メモ化削除（001-remove-manual-memoization）で実現したシンプルなコードが維持される。

**Why this priority**: P1のセキュリティパッチ適用後に実施することで、段階的なリスク管理が可能。React Compilerの安定版は長期サポートが期待でき、RC版よりも本番環境に適している。

**Independent Test**: babel-plugin-react-compiler 1.0.0への更新後、React開発者ツールで自動最適化が動作していることを確認し、パフォーマンステストで最適化の維持を検証可能。

**Acceptance Scenarios**:

1. **Given** babel-plugin-react-compiler 19.1.0-rc.3が使用されている、**When** 開発者が1.0.0にアップグレードする、**Then** ビルドが成功し、React Compilerの最適化が引き続き適用される
2. **Given** React Compiler安定版適用後、**When** 開発者が既存の最適化済みコンポーネント（手動メモ化削除済み）を実行する、**Then** パフォーマンスが維持され、不要な再レンダリングが発生しない
3. **Given** React Compiler 1.0.0がReact 19.1.4と組み合わさっている、**When** 開発者が開発者ツールのプロファイラーで確認する、**Then** コンポーネントの最適化が正常に動作している証拠が確認できる

---

### User Story 3 - テストライブラリの最新化 (Priority: P3)

開発者がテスト環境を最新の安定版に更新し、React 19.1.4との互換性を最大化する。@testing-library/react 16.3.1への更新により、最新のバグフィックスと改善が適用される。

**Why this priority**: P1とP2の成功後に実施することで、テスト環境の安定性を段階的に向上。テストライブラリの更新は既存機能に直接影響しないため、優先度は相対的に低い。

**Independent Test**: @testing-library/react 16.3.1への更新後、全ての既存テストを再実行し、モック動作（src/test/mocks.ts）を含めて100%合格することで検証可能。

**Acceptance Scenarios**:

1. **Given** @testing-library/react 16が使用されている、**When** 開発者が16.3.1に更新する、**Then** 全ての既存テストが合格し、テストの実行時間が維持または改善される
2. **Given** テストライブラリ更新後、**When** 開発者がTauriモックを含むテストを実行する、**Then** src/test/mocks.tsのモック動作が正常に機能し、DIパターンのテストが合格する

---

### User Story 4 - 最新安定版への移行（オプション） (Priority: P4)

開発者がReact 19.2.3への移行を検討し、新機能やさらなる改善の恩恵を受ける。ただし、P1-P3が全て成功し、プロジェクトに余裕がある場合にのみ実施する。

**Why this priority**: オプショナルな機能であり、19.1.4で十分にセキュリティが確保されるため、最低優先度。19.2.3の変更履歴を確認し、プロジェクトに有益な機能がある場合にのみ実施を検討。

**Independent Test**: React 19.2.3への更新後、P1と同様の完全な品質ゲートを実行し、新機能の動作確認を行うことで検証可能。

**Acceptance Scenarios**:

1. **Given** P1-P3が全て成功している、**When** 開発者がReact 19.2.3の変更履歴を確認し有益な機能を発見する、**Then** React 19.2.3へのアップグレードを決定する
2. **Given** React 19.2.3へアップグレード後、**When** 開発者が全ての品質ゲートを実行する、**Then** 全てのテスト・型チェック・lint・ビルドが合格し、アプリケーションが正常に動作する

---

### Edge Cases

- アップグレード中に依存関係の競合が発生した場合、どのようにロールバックするか？
- React Compiler 1.0.0で破壊的変更があった場合、手動メモ化を一時的に復活させる必要があるか？
- テストライブラリ更新後に既存のテストが失敗した場合、テストコードとアプリケーションコードのどちらを優先的に修正するか？
- Tauri v2との互換性問題が発生した場合、Tauriプラグインの更新も必要になるか？
- pnpm-lock.yamlの更新により、他の依存関係が意図せず変更された場合の対処法は？

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: システムはReact 19.1.1から19.1.4（または19.2.3）へアップグレードし、CVE-2025-55182、CVE-2025-55184、CVE-2025-55183の脆弱性を解消しなければならない
- **FR-002**: システムはreact-domを同じバージョン（19.1.4または19.2.3）に更新し、ReactとReact DOMのバージョン整合性を維持しなければならない
- **FR-003**: システムは@types/reactと@types/react-domを最新の互換性のあるバージョンに更新し、TypeScriptの型安全性を維持しなければならない
- **FR-004**: システムはbabel-plugin-react-compilerをRC版（19.1.0-rc.3）から安定版（1.0.0）に更新し、長期的なメンテナンス性を確保しなければならない
- **FR-005**: システムは@testing-library/reactを最新の互換性のあるバージョン（16.3.1）に更新し、テスト環境の安定性を向上させなければならない
- **FR-006**: 各アップグレードフェーズ（Phase 1-4）は独立して実行可能でなければならず、前のフェーズに戻れるようGitコミットで管理されなければならない
- **FR-007**: アップグレード後、既存の全ての機能（画像表示、フォルダナビゲーション、キーボード操作、テーマ切り替え）が正常に動作しなければならない
- **FR-008**: アップグレード後、TypeScriptの型チェック（pnpm type-check）、lint（pnpm lint）、テスト（pnpm test）、ビルド（pnpm build）の全ての品質ゲートが合格しなければならない
- **FR-009**: React Compilerの自動最適化が維持され、既存の手動メモ化削除（001-remove-manual-memoization）で実現したシンプルなコードが引き続き最適化されなければならない
- **FR-010**: Tauri v2との互換性が維持され、デスクトップアプリケーションが正常に起動・動作しなければならない

### Key Entities

- **React依存関係**: react、react-dom、@types/react、@types/react-dom - アプリケーションのコアUI層を構成し、バージョン整合性が必要
- **React Compiler**: babel-plugin-react-compiler - 自動最適化を提供し、手動メモ化を不要にする
- **テストライブラリ**: @testing-library/react、@testing-library/jest-dom - テスト環境を構成し、React 19との互換性が必要
- **品質ゲート**: TypeScript型チェック、Biome lint、Vitestテスト、Viteビルド - アップグレードの成功を検証するツール群
- **パッケージ管理**: package.json、pnpm-lock.yaml - 依存関係のバージョンを管理し、ロールバックを可能にする

### Assumptions

- React 19.1.4と19.2.3は、React 19.1.1からのマイナーアップグレードであり、大きな破壊的変更はないと想定
- React Compiler 1.0.0は、RC版（19.1.0-rc.3）からの安定版リリースであり、自動最適化の動作は基本的に維持されると想定
- @testing-library/react 16.3.1は、バージョン16系のマイナーアップグレードであり、既存のテストコードに影響を与えないと想定
- Tauri v2は、React 19のマイナーバージョン変更に対して互換性を持つと想定
- pnpmパッケージマネージャーは、ロックファイル（pnpm-lock.yaml）を正確に管理し、依存関係の再現性を保証すると想定
- 各フェーズのGitコミットにより、問題発生時には迅速にロールバック可能と想定

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: React 19.1.4（またはオプションで19.2.3）へのアップグレード後、CVE-2025-55182、CVE-2025-55184、CVE-2025-55183の脆弱性が完全に解消され、セキュリティスキャンで検出されない
- **SC-002**: 各アップグレードフェーズ（Phase 1-4）完了後、全ての品質ゲート（type-check, lint, test, build）が100%合格する
- **SC-003**: Tauri devモードでアプリケーションが起動し、画像表示・フォルダナビゲーション・キーボード操作の全機能が正常に動作する
- **SC-004**: React Compiler 1.0.0適用後、開発者ツールのプロファイラーで自動最適化が確認でき、既存の手動メモ化削除済みコードのパフォーマンスが維持される（ベンチマーク±5%以内）
- **SC-005**: 各フェーズ完了後、Gitコミットが作成され、問題発生時に前のフェーズにロールバック可能である
- **SC-006**: アップグレード作業全体が、1フェーズあたり30-60分、全体で2-4時間以内に完了する

