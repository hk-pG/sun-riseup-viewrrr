# Research: React Compiler対応による手動メモ化削除

**Feature**: 001-remove-manual-memoization  
**Date**: 2025-10-29  
**Status**: Complete

## Research Tasks

### 1. React 19のReact Compilerによる自動最適化

**Task**: React Compilerがどのようにコンポーネントとフックを最適化し、手動メモ化（`useMemo`/`useCallback`）を不要にするかを調査。

**Decision**: React Compilerは以下を自動的に実行する：
- 関数コンポーネント内の計算のメモ化
- コールバック関数の安定した参照の保持
- 依存配列の自動推論と最適化
- 不要な再レンダリングの防止

**Rationale**: 
- React 19のReact Compilerは、開発者が明示的に`useMemo`や`useCallback`を書かなくても、コンパイル時にコードを解析し、必要な最適化を自動的に適用します
- これにより、コードがシンプルになり、依存配列の管理ミスがなくなり、保守性が向上します
- 本プロジェクトでは既にReact 19とReact Compilerが導入されており、手動メモ化は冗長になっています

**Alternatives Considered**:
- **代替案1: 手動メモ化を維持**: React Compilerと並行して手動メモ化を維持する
  - **却下理由**: コードが冗長になり、React Compilerの最適化と競合する可能性がある。保守コストが高い
- **代替案2: 段階的な削除**: 一部の手動メモ化のみを削除する
  - **却下理由**: 一貫性がなく、開発者がどこで手動メモ化が必要かを判断する負担が残る

**References**:
- [React 19 Release Notes](https://react.dev/blog/2024/12/05/react-19)
- [React Compiler Documentation](https://react.dev/learn/react-compiler)

---

### 2. useCallbackの安全な削除パターン

**Task**: `useCallback`で囲まれた関数を通常の関数に変換する際のベストプラクティスと潜在的な問題を調査。

**Decision**: 以下のパターンで安全に削除可能：
```typescript
// Before: useCallbackあり
const openImageFile = useCallback(async (): Promise<Result | null> => {
  // implementation
}, [fs]);

// After: useCallbackなし（React Compilerが自動最適化）
const openImageFile = async (): Promise<Result | null> => {
  // implementation (同じ)
};
```

**Rationale**:
- React Compilerは関数の依存関係を自動的に追跡し、必要に応じてメモ化します
- 外部に公開する関数のシグネチャは変わらないため、呼び出し側のコードに影響はありません
- テストコードも変更不要（関数の動作は同じため）

**Alternatives Considered**:
- **代替案1: アロー関数を通常の関数宣言に変更**: `function openImageFile() {}`
  - **却下理由**: 現在のコードベースではアロー関数を使用しており、一貫性を保つ方が良い
- **代替案2: useCallbackを残し、依存配列のみ削除**: `useCallback(fn)` (配列なし)
  - **却下理由**: React Compilerが有効な場合、`useCallback`自体が不要

**References**:
- [React Hooks API Reference - useCallback](https://react.dev/reference/react/useCallback)
- React Compilerは依存配列を自動推論するため、手動管理が不要

---

### 3. useMemoの安全な削除パターン

**Task**: `useMemo`で囲まれた値や関数を通常の変数/関数に変換する際のベストプラクティスを調査。

**Decision**: 以下のパターンで安全に削除可能：
```typescript
// Before: useMemoあり
const handleFolderSelect = useMemo(
  () => (folderPath: string) => {
    // implementation
  },
  [onFolderSelect]
);

// After: useMemoなし（React Compilerが自動最適化）
const handleFolderSelect = (folderPath: string) => {
  // implementation (同じ)
};
```

**Rationale**:
- `useMemo`で関数を返すパターンは、`useCallback`と同等の動作をします
- React Compilerは計算コストの高い処理を自動的に検出し、メモ化します
- シンプルな関数宣言の方が、コードの意図が明確になります

**Alternatives Considered**:
- **代替案1: useMemoを一部のみ削除**: 計算コストが低いもののみ削除
  - **却下理由**: React Compilerは計算コストを自動的に判断するため、開発者が手動で判断する必要はない
- **代替案2: useMemoをuseCallbackに変換**: 関数を返す場合のみ
  - **却下理由**: React Compilerが有効な場合、どちらも不要

**References**:
- [React Hooks API Reference - useMemo](https://react.dev/reference/react/useMemo)

---

### 4. パフォーマンステスト戦略

**Task**: 手動メモ化削除後にパフォーマンスが維持されていることを検証する方法を調査。

**Decision**: 以下の2段階でパフォーマンスを検証：
1. **既存の単体テスト・統合テスト**: 機能の正確性を検証（Success Criteria SC-002）
2. **手動パフォーマンステスト**: 主要操作のレスポンス時間を測定（Success Criteria SC-004）
   - フォルダ選択の応答時間
   - 画像表示の応答時間
   - キーボード操作の応答時間

**Rationale**:
- React Compilerの最適化は本番ビルド（`pnpm tauri build`）で最も効果を発揮します
- 自動化されたパフォーマンステストは本機能の範囲外ですが、Success Criteriaで手動検証を要求しています
- 既存のテストスイートが合格することで、機能のリグレッションがないことを保証します

**Alternatives Considered**:
- **代替案1: 自動化されたパフォーマンステストの追加**: Playwright等でパフォーマンスを自動測定
  - **却下理由**: 本機能のスコープ外。将来的に検討可能だが、現時点では手動検証で十分
- **代替案2: React DevTools Profilerでの測定**: 開発モードでのプロファイリング
  - **部分採用**: 補完的な検証として有用だが、本番ビルドでの検証が重要

**References**:
- [React DevTools Profiler](https://react.dev/learn/react-developer-tools)
- Success Criteria SC-004: レスポンス時間が±5%以内

---

### 5. テストカバレッジの維持

**Task**: 手動メモ化削除後に既存のテストカバレッジが低下しないことを確認する方法を調査。

**Decision**: 以下のアプローチでテストカバレッジを維持：
1. **既存のテストを変更しない**: 手動メモ化の削除は実装の詳細であり、テストが検証する動作は変わらないため
2. **テスト実行**: `pnpm test`で全テストが合格することを確認
3. **カバレッジレポート**: 必要に応じて`pnpm test --coverage`でカバレッジを確認

**Rationale**:
- 本プロジェクトのテスト戦略（憲章V）は「実装の詳細ではなく、ユーザーの動作をテストする」です
- `useCallback`/`useMemo`の有無は実装の詳細であり、公開APIや動作には影響しません
- 既存のテストが合格すれば、カバレッジは維持されます

**Alternatives Considered**:
- **代替案1: 新しいテストの追加**: React Compilerの動作を検証するテスト
  - **却下理由**: React Compilerの最適化は実装の詳細。外部から観察可能な動作は変わらない
- **代替案2: スナップショットテストの追加**: コンポーネントの出力を検証
  - **却下理由**: 既存のテストで十分。スナップショットテストは脆弱で保守コストが高い

**References**:
- 憲章V: テスト戦略
- `.github/copilot-instructions.md`: テスト容易性のためのDIパターン

---

## Summary

React 19のReact Compilerにより、以下が明確になりました：

1. **手動メモ化は不要**: React Compilerが自動的に最適化を適用
2. **安全な削除パターン**: `useCallback`/`useMemo`を削除し、通常の関数/変数に変換
3. **既存テストで検証可能**: 動作が変わらないため、新しいテストは不要
4. **パフォーマンス維持**: React Compilerの最適化により、パフォーマンスは維持またはほ向上
5. **段階的な削除**: 1ファイルずつ削除し、テストを実行して安全性を確認

次のフェーズ（Phase 1）では、具体的なデータモデルと実装契約を定義します。
