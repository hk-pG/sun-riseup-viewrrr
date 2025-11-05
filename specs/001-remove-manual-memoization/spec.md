# Feature Specification: React Compiler対応による手動メモ化コードの削除

**Feature Branch**: `001-remove-manual-memoization`  
**Created**: 2025-10-28  
**Status**: Draft  
**Input**: User description: "各所に存在するuseMemo/useCallbackについて、安全に取り外したい。React 19の導入と同時にReact Compilerを有効化したため明示的に記述する必要のない最適化コードを削除し、よりシンプルで直感的なコードを保ちたい"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - フックからの手動メモ化削除 (Priority: P1)

開発者がカスタムフック（`useOpenImageFile`、`useKeyboardHandler`、`useControlsVisibility`）のコードを読む際、React Compilerが自動的に最適化を行うため、`useCallback`による明示的なメモ化が不要であることを理解できる。コードがよりシンプルで直感的になり、保守性が向上する。

**Why this priority**: カスタムフックは再利用性が高く、プロジェクト全体で複数箇所から使用される。これらをシンプルにすることで、コードの可読性と保守性が最も大きく向上する。

**Independent Test**: 対象のフックから`useCallback`を削除し、既存のテストスイートを実行して全てのテストが合格することを確認する。パフォーマンステストで最適化が維持されていることを検証する。

**Acceptance Scenarios**:

1. **Given** `useOpenImageFile`フックが`useCallback`を使用している、**When** 開発者が`useCallback`を削除して通常の関数に変更する、**Then** 既存の全テストが合格し、機能が正常に動作する
2. **Given** `useKeyboardHandler`フックが複数の`useCallback`を使用している、**When** 開発者が全ての`useCallback`を削除する、**Then** キーボード操作が正常に動作し、パフォーマンスが維持される
3. **Given** `useControlsVisibility`フックが`useCallback`を使用している、**When** 開発者が`useCallback`を削除する、**Then** コントロールの表示/非表示ロジックが正常に動作する

---

### User Story 2 - コンポーネントからの手動メモ化削除 (Priority: P2)

開発者が`Sidebar`コンポーネントのコードを読む際、`useMemo`による明示的なメモ化が不要であることを理解し、通常の変数宣言や関数として実装できる。コードの意図がより明確になる。

**Why this priority**: コンポーネントレベルのメモ化削除はフックよりも影響範囲が狭いが、コードの可読性向上には重要。P1の作業後に実施することで、段階的な移行が可能。

**Independent Test**: `Sidebar`コンポーネントから`useMemo`を削除し、既存のテストとStorybookストーリーで動作を確認する。レンダリングパフォーマンスが維持されていることを検証する。

**Acceptance Scenarios**:

1. **Given** `Sidebar`コンポーネントが`handleFolderSelect`を`useMemo`でメモ化している、**When** 開発者が`useMemo`を削除して通常の関数に変更する、**Then** フォルダ選択機能が正常に動作する
2. **Given** `Sidebar`コンポーネントが`content`を`useMemo`でメモ化している、**When** 開発者が`useMemo`を削除する、**Then** サイドバーのコンテンツ表示が正常に動作する

---

### User Story 3 - 削除の安全性検証とドキュメント化 (Priority: P3)

開発者が将来のコード変更時に、手動メモ化が不要であることを理解し、React Compilerに依存した最適化戦略を継続できる。プロジェクトのガイドラインとして文書化される。

**Why this priority**: 長期的な保守性のために重要だが、P1とP2の実装が完了した後に文書化することで、実際の経験に基づいた正確なガイドラインを作成できる。

**Independent Test**: ドキュメントを作成し、新規参加者がReact Compilerの動作とメモ化不要の理由を理解できることを確認する。

**Acceptance Scenarios**:

1. **Given** 全ての手動メモ化が削除されている、**When** 開発者がパフォーマンステストを実行する、**Then** アプリケーションのパフォーマンスが維持または向上している
2. **Given** React Compilerによる最適化方針が確立されている、**When** 新しい開発者がドキュメントを読む、**Then** 手動メモ化が不要な理由とReact Compilerの役割を理解できる

---

### Edge Cases

- 削除後にパフォーマンスが低下した場合、React Compilerの設定や特定のコードパターンに問題がないか確認する必要がある
- 依存配列が複雑な`useCallback`/`useMemo`の場合、削除前に動作の等価性を慎重に検証する必要がある
- テストカバレッジが不十分な箇所では、削除前に追加のテストを作成する必要がある

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: システムは`useOpenImageFile`フックから`useCallback`を削除し、通常の関数として実装しなければならない
- **FR-002**: システムは`useKeyboardHandler`フックから全ての`useCallback`（`isKeyboardEventMatch`、`findMatchingAction`、`handleKeyDown`）を削除しなければならない
- **FR-003**: システムは`useControlsVisibility`フックから全ての`useCallback`（`resetTimeout`、`handleMouseMove`）を削除しなければならない
- **FR-004**: システムは`Sidebar`コンポーネントから全ての`useMemo`（`handleFolderSelect`、`content`）を削除しなければならない
- **FR-005**: 削除後、既存の全ての単体テスト、統合テスト、コンポーネントテストが合格しなければならない
- **FR-006**: 削除後、TypeScriptの型チェック（`pnpm type-check`）が合格しなければならない
- **FR-007**: 削除後、Biomeのlintチェック（`pnpm lint`）が合格しなければならない
- **FR-008**: 削除による変更は、既存のコンポーネントの外部APIに影響を与えてはならない（propインターフェース、エクスポートされた型は不変）

### Assumptions

- React 19とReact Compilerが既にプロジェクトに導入されており、正しく設定されている
- 既存のテストスイートが十分なカバレッジを持ち、リグレッションを検出できる
- React Compilerは標準的な最適化パターン（関数のメモ化、値のキャッシング）を自動的に適用する
- パフォーマンスクリティカルな処理でも、React Compilerの最適化で十分なパフォーマンスが得られる

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 全ての対象ファイル（5ファイル）から`useMemo`/`useCallback`のインポートと使用が削除され、コードの行数が15%以上削減される
- **SC-002**: 既存の全テストスイート（単体テスト、統合テスト、コンポーネントテスト）が100%合格する
- **SC-003**: 品質ゲート（`pnpm type-check`、`pnpm lint`、`pnpm test`）が全て合格する
- **SC-004**: アプリケーションの主要操作（フォルダ選択、画像表示、キーボード操作）のレスポンス時間が削除前と同等かそれ以上である（±5%以内）
- **SC-005**: Storybookで全てのコンポーネントストーリーが正常に表示され、インタラクションが機能する
