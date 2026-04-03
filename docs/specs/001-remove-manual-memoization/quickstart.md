# Quickstart: React Compiler対応による手動メモ化削除

**Feature**: 001-remove-manual-memoization  
**Date**: 2025-10-29  
**Estimated Time**: 1-2時間（5ファイル × 15-20分/ファイル）

## 目的

React 19のReact Compilerが導入されたため、`useMemo`/`useCallback`による手動メモ化が不要になりました。このガイドでは、1ファイルずつ安全に手動メモ化を削除する手順を説明します。

---

## 前提条件

- React 19とReact Compilerが有効化されていること
- 既存のテストスイートが存在すること（`pnpm test`で実行可能）
- 品質ゲートツールが利用可能なこと（`pnpm type-check`、`pnpm lint`、`pnpm build`）

---

## 例: useOpenImageFile（1ファイルの完全な手順）

### Step 1: 現在の実装を確認

**ファイル**: `src/features/folder-navigation/hooks/useOpenImageFile.ts`

現在の実装:
```typescript
import { useCallback } from 'react';

export function useOpenImageFile(fs: FileSystemService) {
  const openImageFile = useCallback(async (): Promise<OpenImageFileResult | null> => {
    // ... implementation
  }, [fs]);

  return { openImageFile };
}
```

### Step 2: 既存のテストを実行（変更前の確認）

```bash
# useOpenImageFileのテストを実行
pnpm test useOpenImageFile

# 全テストを実行（オプション）
pnpm test
```

**期待される結果**: 全テスト合格 ✅

### Step 3: 手動メモ化を削除

**変更内容**:
1. `useCallback`のインポートを削除（他で使用していない場合）
2. `useCallback(..., [deps])`を通常のアロー関数に変換

**変更後の実装**:
```typescript
// import { useCallback } from 'react'; ← 削除（他で使用していない場合）
import type { FileSystemService } from '../services/FileSystemService';

export function useOpenImageFile(fs: FileSystemService) {
  // useCallbackを削除し、通常のアロー関数に変更
  const openImageFile = async (): Promise<OpenImageFileResult | null> => {
    try {
      if (!fs.openImageFileDialog) return null;
      const filePath = await fs.openImageFileDialog();
      if (!filePath) return null;
      const folderPath = await fs.getDirName(filePath);
      const images = await fs.listImagesInFolder(folderPath);
      const index = images.findIndex((img: string) => img === filePath);
      return {
        folderPath,
        filePath,
        index: index >= 0 ? index : 0,
      };
    } catch (error) {
      console.error('Failed to open image file:', error);
      return null;
    }
  };

  return { openImageFile };
}
```

**重要**: 
- 関数の本体は**完全に同じ**まま
- 型シグネチャも**変更なし**
- React Compilerが自動的に依存関係を追跡し、必要に応じてメモ化

### Step 4: 品質ゲートを実行

```bash
# TypeScriptの型チェック
pnpm type-check

# Lintチェック
pnpm lint

# テスト実行
pnpm test useOpenImageFile

# （オプション）全テスト実行
pnpm test
```

**期待される結果**: 
- ✅ `type-check`: エラーなし
- ✅ `lint`: 警告なし（未使用のインポートが削除されたことを確認）
- ✅ `test`: 全テスト合格

### Step 5: ビルドとパフォーマンス検証（オプション）

```bash
# 本番ビルドを実行（React Compilerの最適化を確認）
pnpm tauri build

# アプリケーションを起動してパフォーマンスを手動検証
pnpm tauri dev
```

**検証項目**:
- 画像ファイルを開く動作が正常に機能する
- レスポンス時間が変更前と同等（体感で確認）

### Step 6: コミット

```bash
git add src/features/folder-navigation/hooks/useOpenImageFile.ts
git commit -m "refactor: remove useCallback from useOpenImageFile

- React Compiler handles memoization automatically
- No functional changes, all tests passing
- Improves code readability and maintainability"
```

---

## 他のファイルへの適用

同じ手順を以下のファイルに適用します：

### 2. useKeyboardHandler (3つのuseCallback)

**ファイル**: `src/features/image-viewer/hooks/useKeyboardHandler.ts`

**削除対象**:
- `isKeyboardEventMatch` の `useCallback`
- `findMatchingAction` の `useCallback`
- `handleKeyDown` の `useCallback`

**テスト**: `pnpm test useKeyboardHandler`

### 3. useControlsVisibility (2つのuseCallback)

**ファイル**: `src/features/image-viewer/hooks/useControlsVisibility.ts`

**削除対象**:
- `resetTimeout` の `useCallback`
- `handleMouseMove` の `useCallback`

**テスト**: `pnpm test useControlsVisibility`

### 4. Sidebar (2つのuseMemo)

**ファイル**: `src/features/folder-navigation/components/Sidebar.tsx`

**削除対象**:
- `handleFolderSelect` の `useMemo` → 通常の関数に変換
- `content` の `useMemo` → 通常の変数に変換

**変更例**:
```typescript
// Before
const handleFolderSelect = useMemo(
  () => (folderPath: string) => {
    onFolderSelect(folderPath);
  },
  [onFolderSelect]
);

// After
const handleFolderSelect = (folderPath: string) => {
  onFolderSelect(folderPath);
};
```

**テスト**: `pnpm test Sidebar`

---

## トラブルシューティング

### 問題: テストが失敗する

**原因**: 実装を変更してしまった可能性

**解決策**:
1. 関数の本体が元のコードと完全に一致していることを確認
2. 型シグネチャが変わっていないことを確認
3. 依存配列に含まれていた変数がすべて関数内で使用されていることを確認

### 問題: Lintエラー「未使用のインポート」

**原因**: `useCallback`/`useMemo`を削除したが、インポート文が残っている

**解決策**:
```bash
# 自動修正を実行
pnpm lint:apply
```

### 問題: TypeScriptエラー

**原因**: 型シグネチャを誤って変更した

**解決策**:
1. 元のコードと比較して、関数の型が一致していることを確認
2. アロー関数の戻り値の型を明示的に指定

---

## 完了基準

全5ファイルの変更が完了したら、以下を確認：

```bash
# 全ての品質ゲートを実行
pnpm type-check  # ✅ 合格必須
pnpm lint        # ✅ 合格必須
pnpm test        # ✅ 合格必須（100%）
pnpm tauri build # ✅ 合格必須
```

**Success Criteria**:
- SC-001: `useMemo`/`useCallback`のインポートと使用が全て削除 ✅
- SC-002: 既存テストが100%合格 ✅
- SC-003: 品質ゲートが全て合格 ✅
- SC-004: パフォーマンスが維持（手動検証） ✅
- SC-005: Storybookストーリーが正常動作（手動検証） ✅

---

## 次のステップ

Phase 2（`/speckit.tasks`コマンド）で、具体的なタスクリストが生成されます。このquickstartガイドを参照しながら、1タスクずつ実装してください。
