# Data Model: React Compiler対応による手動メモ化削除

**Feature**: 001-remove-manual-memoization  
**Date**: 2025-10-29  
**Status**: Complete

## Overview

本機能は既存のコードのリファクタリングであり、新しいデータモデルや状態は導入しません。以下は、変更対象のフック・コンポーネントの既存インターフェースと、削除される内部実装の詳細です。

---

## Entities

### 1. useOpenImageFile (Hook)

**場所**: `src/features/folder-navigation/hooks/useOpenImageFile.ts`

**公開インターフェース** (変更なし):
```typescript
export interface OpenImageFileResult {
  folderPath: string | null;
  filePath: string | null;
  index: number;
}

export function useOpenImageFile(fs: FileSystemService): {
  openImageFile: () => Promise<OpenImageFileResult | null>;
}
```

**内部実装の変更**:
- **Before**: `openImageFile`関数を`useCallback`でメモ化、依存配列`[fs]`
- **After**: `openImageFile`を通常のアロー関数として定義（React Compilerが自動最適化）

**検証ルール**:
- `openImageFile`は非同期関数で、`OpenImageFileResult | null`を返す
- `filePath`がnullの場合、nullを返す
- `index`は画像リスト内のファイルのインデックス（見つからない場合は0）

**状態遷移**: なし（ステートレスなフック）

---

### 2. useKeyboardHandler (Hook)

**場所**: `src/features/image-viewer/hooks/useKeyboardHandler.ts`

**公開インターフェース** (変更なし):
```typescript
export interface KeyboardAction {
  keys: string[];
  ctrlKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
}

export function useKeyboardHandler(actions: KeyboardAction[]): void;
```

**内部実装の変更**:
- **Before**: `isKeyboardEventMatch`、`findMatchingAction`、`handleKeyDown`を`useCallback`でメモ化
- **After**: これらの関数を通常のアロー関数として定義（React Compilerが自動最適化）

**検証ルール**:
- `isKeyboardEventMatch`: キーボードイベントとアクション定義が一致するかをチェック
- `findMatchingAction`: アクション配列から一致するアクションを検索
- `handleKeyDown`: キーボードイベントをリッスンし、一致するアクションを実行

**状態遷移**: なし（イベントリスナーの登録/解除のみ）

---

### 3. useControlsVisibility (Hook)

**場所**: `src/features/image-viewer/hooks/useControlsVisibility.ts`

**公開インターフェース** (変更なし):
```typescript
export function useControlsVisibility(
  hideDelay?: number
): {
  isVisible: boolean;
  resetTimeout: () => void;
};
```

**内部実装の変更**:
- **Before**: `resetTimeout`、`handleMouseMove`を`useCallback`でメモ化
- **After**: これらの関数を通常のアロー関数として定義（React Compilerが自動最適化）

**検証ルール**:
- `isVisible`: コントロールの表示状態（boolean）
- `resetTimeout`: タイムアウトをリセットしてコントロールを表示
- `handleMouseMove`: マウス移動時にタイムアウトをリセット

**状態遷移**:
```
初期状態: isVisible = true
→ hideDelay経過 → isVisible = false
→ マウス移動/resetTimeout → isVisible = true
```

---

### 4. Sidebar (Component)

**場所**: `src/features/folder-navigation/components/Sidebar.tsx`

**公開インターフェース (Props)** (変更なし):
```typescript
export interface SidebarProps {
  currentFolderPath: string | null;
  siblingFolders: string[];
  onFolderSelect: (folderPath: string) => void;
  className?: string;
}

export function Sidebar(props: SidebarProps): JSX.Element;
```

**内部実装の変更**:
- **Before**: `handleFolderSelect`、`content`を`useMemo`でメモ化
- **After**: これらを通常の変数/関数として定義（React Compilerが自動最適化）

**検証ルール**:
- `handleFolderSelect`: `onFolderSelect` propをラップし、フォルダパスを渡す
- `content`: サイドバーのコンテンツ（フォルダリストまたは空状態）を生成

**状態遷移**: なし（ステートレスなコンポーネント - propsのみに依存）

---

## Relationships

本機能は既存のインターフェースを変更しないため、以下の関係は維持されます：

```
App.tsx (Consumer)
  └── useOpenImageFile (Hook)
        └── FileSystemService (Dependency)

ImageViewer (Consumer)
  ├── useKeyboardHandler (Hook)
  │     └── KeyboardAction[] (Input)
  └── useControlsVisibility (Hook)

App.tsx (Consumer)
  └── Sidebar (Component)
        └── SidebarProps (Input)
```

**重要**: 全ての公開インターフェースは不変のため、呼び出し側のコードは変更不要です。

---

## Validation Summary

| Entity | Public API Changed? | Internal Implementation Changed? | Tests Required? |
|--------|---------------------|----------------------------------|-----------------|
| useOpenImageFile | No | Yes (useCallback削除) | Existing tests |
| useKeyboardHandler | No | Yes (useCallback削除) | Existing tests |
| useControlsVisibility | No | Yes (useCallback削除) | Existing tests |
| Sidebar | No | Yes (useMemo削除) | Existing tests |

**結論**: 全ての変更は内部実装のみで、既存のテストスイートで検証可能です。新しいテストやデータモデルは不要です。
