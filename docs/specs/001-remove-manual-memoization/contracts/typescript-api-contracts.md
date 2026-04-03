# API Contracts: React Compiler対応による手動メモ化削除

**Feature**: 001-remove-manual-memoization  
**Date**: 2025-10-29  
**Type**: TypeScript Internal API Contracts

## Overview

本機能は内部リファクタリングのため、外部REST/GraphQL APIは存在しません。以下は、変更対象のフック・コンポーネントのTypeScript型契約です。これらの契約は**変更されず**、後方互換性が保たれます。

---

## 1. useOpenImageFile Hook Contract

**File**: `src/features/folder-navigation/hooks/useOpenImageFile.ts`

```typescript
/**
 * 画像ファイルを選択し、そのフォルダとインデックスを返すフック
 * 
 * @param fs - FileSystemServiceのインスタンス（DI経由）
 * @returns openImageFile関数を含むオブジェクト
 */
export function useOpenImageFile(
  fs: FileSystemService
): {
  openImageFile: () => Promise<OpenImageFileResult | null>;
};

/**
 * 画像ファイル選択の結果
 */
export interface OpenImageFileResult {
  /** 選択された画像が含まれるフォルダパス */
  folderPath: string | null;
  
  /** 選択された画像ファイルのパス */
  filePath: string | null;
  
  /** フォルダ内の画像リストにおけるインデックス（0-based） */
  index: number;
}
```

**Contract Guarantees**:
- `openImageFile`はユーザーがファイルダイアログで画像を選択した場合、`OpenImageFileResult`を返す
- ユーザーがキャンセルした場合、`null`を返す
- `index`は常に0以上の整数（画像が見つからない場合は0）
- エラーが発生した場合、console.errorでログし、`null`を返す

---

## 2. useKeyboardHandler Hook Contract

**File**: `src/features/image-viewer/hooks/useKeyboardHandler.ts`

```typescript
/**
 * キーボードショートカットを処理するフック
 * 
 * @param actions - キーボードアクション定義の配列
 * @returns void（副作用としてイベントリスナーを登録）
 */
export function useKeyboardHandler(actions: KeyboardAction[]): void;

/**
 * キーボードアクション定義
 */
export interface KeyboardAction {
  /** トリガーとなるキー（大文字小文字を区別しない） */
  keys: string[];
  
  /** Ctrlキーが必要か（オプション） */
  ctrlKey?: boolean;
  
  /** Shiftキーが必要か（オプション） */
  shiftKey?: boolean;
  
  /** キーが押されたときに実行するアクション */
  action: () => void;
}
```

**Contract Guarantees**:
- フック呼び出し時に`keydown`イベントリスナーを登録
- アンマウント時にイベントリスナーを自動削除
- `keys`配列の要素は大文字小文字を区別しない（例: "A"と"a"は同じ）
- 複数のアクションが一致する場合、最初に一致したアクションのみを実行

---

## 3. useControlsVisibility Hook Contract

**File**: `src/features/image-viewer/hooks/useControlsVisibility.ts`

```typescript
/**
 * コントロールの表示/非表示を管理するフック
 * 
 * @param hideDelay - 自動的に非表示になるまでの遅延時間（ミリ秒、デフォルト: 3000）
 * @returns isVisibleとresetTimeout関数を含むオブジェクト
 */
export function useControlsVisibility(
  hideDelay?: number
): {
  isVisible: boolean;
  resetTimeout: () => void;
};
```

**Contract Guarantees**:
- 初期状態では`isVisible = true`
- `hideDelay`ミリ秒経過後、自動的に`isVisible = false`に遷移
- `resetTimeout()`を呼び出すと、`isVisible = true`に戻り、タイマーがリセット
- マウス移動時にも自動的にタイマーがリセット（内部実装）
- アンマウント時にタイマーを自動クリーンアップ

---

## 4. Sidebar Component Contract

**File**: `src/features/folder-navigation/components/Sidebar.tsx`

```typescript
/**
 * フォルダ一覧を表示するサイドバーコンポーネント
 * 
 * @param props - SidebarPropsオブジェクト
 * @returns サイドバーのJSX要素
 */
export function Sidebar(props: SidebarProps): JSX.Element;

/**
 * Sidebarコンポーネントのプロップス
 */
export interface SidebarProps {
  /** 現在選択されているフォルダパス（ハイライト表示用） */
  currentFolderPath: string | null;
  
  /** 同階層のフォルダパスの配列 */
  siblingFolders: string[];
  
  /** フォルダが選択されたときのコールバック */
  onFolderSelect: (folderPath: string) => void;
  
  /** 追加のCSSクラス名（オプション） */
  className?: string;
}
```

**Contract Guarantees**:
- `siblingFolders`が空の場合、空状態メッセージを表示
- `currentFolderPath`と一致するフォルダをハイライト表示
- フォルダをクリックすると`onFolderSelect`が呼ばれ、選択されたフォルダパスが渡される
- `className`はルート要素にマージされる

---

## Contract Verification

### Before Refactoring

全ての契約は現在のコードで満たされています：
- TypeScriptの型システムにより、コンパイル時に契約違反が検出される
- 既存のテストスイートで、実行時の動作が契約通りであることを検証済み

### After Refactoring

手動メモ化を削除した後も：
- **型シグネチャは不変**: TypeScriptコンパイラが契約の一致を保証
- **動作は不変**: 既存のテストスイートが合格することで検証
- **後方互換性**: 呼び出し側のコードは変更不要

### Testing Strategy

| Contract | Verification Method | Test Files |
|----------|-------------------|------------|
| useOpenImageFile | Unit tests | `useOpenImageFile.test.ts` |
| useKeyboardHandler | Unit tests | `useKeyboardHandler.test.ts` |
| useControlsVisibility | Unit tests | `useControlsVisibility.test.ts` |
| Sidebar | Component tests | `Sidebar.test.tsx` |
| Integration | Integration tests | `App.test.tsx` |

**結論**: 既存のテストスイートで全ての契約を検証可能。新しいテストは不要。
