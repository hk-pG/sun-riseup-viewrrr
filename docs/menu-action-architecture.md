# メニューアクション設計ガイド

## 概要

このドキュメントでは、メニューアクションが増加する場合のスケーラブルな設計パターンを提案します。
ボイラープレートを最小限に抑えつつ、テスタビリティと保守性を確保する方法を説明します。

## 設計原則

- **Open/Closed原則**: 新しいアクションの追加が既存コードの変更を必要としない
- **Single Responsibility**: 各アクションは独立した責務を持つ
- **Dependency Injection**: テストとモック化が容易
- **型安全性**: TypeScriptの恩恵を最大限に活用

---

## 推奨アーキテクチャ: Dependency Injection + Command Registry パターン

### メリット

- ✅ ボイラープレート最小
- ✅ テストが容易（モック・スタブ化しやすい）
- ✅ アクションの追加が簡単（Open/Closed原則）
- ✅ 型安全性が高い
- ✅ 外部ライブラリ不要（または軽量なDI）
- ✅ React 19 + React Compilerと相性が良い

---

## 実装ガイド

### 1. アクションコンテキストの定義

アクションが必要とする依存関係を集約したコンテキストを定義します。

```tsx
// features/app-shell/context/AppActionContext.ts
import type { AppState } from '@/App';
import type { FileSystemService } from '@/shared/services';
import type { ThemeAPI } from '@/providers/ThemeProvider';

export interface AppActionContext {
  // 状態更新
  setState: (updater: (prev: AppState) => AppState) => void;
  getState: () => AppState;
  
  // サービス（Dependency Injection）
  fileSystem: FileSystemService;
  theme: ThemeAPI;
  
  // ユーティリティ
  startTransition: (callback: () => void) => void;
  notify?: (message: string) => void; // 将来のトースト通知など
}
```

### 2. アクションの型定義とヘルパー

```tsx
// features/app-shell/actions/types.ts
import type { AppActionContext } from '../context/AppActionContext';

export interface AppAction {
  id: string;
  execute(context: AppActionContext): Promise<void> | void;
  canExecute?(context: AppActionContext): boolean;
  label?: string;
  shortcut?: string;
}

// ヘルパー: 関数ベースでアクションを定義
export function defineAction(
  id: string,
  execute: (context: AppActionContext) => Promise<void> | void,
  options?: {
    canExecute?: (context: AppActionContext) => boolean;
    label?: string;
    shortcut?: string;
  }
): AppAction {
  return {
    id,
    execute,
    canExecute: options?.canExecute,
    label: options?.label,
    shortcut: options?.shortcut,
  };
}
```

### 3. 個別のアクション定義

各アクションは独立したファイルとして定義します。

#### Open Folder Action

```tsx
// features/app-shell/actions/openFolderAction.ts
import { defineAction } from './types';

export const openFolderAction = defineAction(
  'open-folder',
  async (ctx) => {
    const folderPath = await ctx.fileSystem.openDirectoryDialog();
    if (folderPath) {
      ctx.startTransition(() => {
        ctx.setState(() => ({
          currentFolderPath: folderPath,
          initialImageIndex: 0,
        }));
      });
      ctx.notify?.(`Opened folder: ${folderPath}`);
    }
  },
  {
    label: 'Open Folder',
    shortcut: 'Ctrl+O',
  }
);
```

#### Open Image Action

```tsx
// features/app-shell/actions/openImageAction.ts
import { defineAction } from './types';

export const openImageAction = defineAction(
  'open-image',
  async (ctx) => {
    const result = await ctx.fileSystem.openImageFileDialog?.();
    if (result?.folderPath) {
      ctx.startTransition(() => {
        ctx.setState(() => ({
          currentFolderPath: result.folderPath,
          initialImageIndex: result.index,
        }));
      });
    }
  },
  {
    label: 'Open Image',
    shortcut: 'Ctrl+Shift+O',
  }
);
```

#### Toggle Theme Action

```tsx
// features/app-shell/actions/toggleThemeAction.ts
import { defineAction } from './types';

export const toggleThemeAction = defineAction(
  'toggle-theme',
  (ctx) => {
    const { theme, resolvedTheme, setTheme } = ctx.theme;
    const newTheme = theme === 'system'
      ? (resolvedTheme === 'dark' ? 'light' : 'dark')
      : (theme === 'dark' ? 'light' : 'dark');
    setTheme(newTheme);
  },
  {
    label: 'Toggle Theme',
    shortcut: 'Ctrl+Shift+T',
  }
);
```

### 4. アクションレジストリ

全てのアクションを管理するレジストリを作成します。

```tsx
// features/app-shell/actions/registry.ts
import type { AppAction } from './types';
import { openFolderAction } from './openFolderAction';
import { openImageAction } from './openImageAction';
import { toggleThemeAction } from './toggleThemeAction';

export class ActionRegistry {
  private actions = new Map<string, AppAction>();

  constructor(actions: AppAction[] = []) {
    actions.forEach(action => this.register(action));
  }

  register(action: AppAction): void {
    this.actions.set(action.id, action);
  }

  get(id: string): AppAction | undefined {
    return this.actions.get(id);
  }

  getAll(): AppAction[] {
    return Array.from(this.actions.values());
  }

  canExecute(id: string, context: AppActionContext): boolean {
    const action = this.get(id);
    return action?.canExecute?.(context) ?? true;
  }
}

// デフォルトのアクション登録
export const defaultActionRegistry = new ActionRegistry([
  openFolderAction,
  openImageAction,
  toggleThemeAction,
]);
```

### 5. カスタムフック化

アクション実行のためのカスタムフックを作成します。

```tsx
// features/app-shell/hooks/useAppActions.ts
import { useTransition } from 'react';
import type { AppState } from '@/App';
import type { AppActionContext } from '../context/AppActionContext';
import { defaultActionRegistry } from '../actions/registry';
import { useServices } from '@/shared/context/ServiceContext';
import { useTheme } from '@/providers/ThemeProvider';

export function useAppActions(
  appState: AppState,
  setAppState: (updater: (prev: AppState) => AppState) => void,
) {
  const [isPending, startTransition] = useTransition();
  const fileSystem = useServices();
  const theme = useTheme();

  const context: AppActionContext = {
    setState: setAppState,
    getState: () => appState,
    fileSystem,
    theme,
    startTransition,
  };

  const executeAction = async (actionId: string) => {
    const action = defaultActionRegistry.get(actionId);
    if (!action) {
      console.warn(`Action not found: ${actionId}`);
      return;
    }

    if (action.canExecute && !action.canExecute(context)) {
      console.warn(`Action cannot be executed: ${actionId}`);
      return;
    }

    try {
      await action.execute(context);
    } catch (error) {
      console.error(`Action failed: ${actionId}`, error);
      // エラーハンドリング（将来的にはトースト通知など）
    }
  };

  return {
    executeAction,
    isPending,
    registry: defaultActionRegistry,
  };
}
```

### 6. App.tsxでの使用

```tsx
// App.tsx
import { useState } from 'react';
import { useAppActions } from './features/app-shell/hooks/useAppActions';

function App() {
  const [appState, setAppState] = useState<AppState>({
    currentFolderPath: '',
    initialImageIndex: 0,
  });

  const { executeAction, isPending } = useAppActions(appState, setAppState);

  // シンプル！
  const handleMenuAction = (actionId: AppMenuBarEvent) => {
    executeAction(actionId);
  };

  const handleFolderSelect = (folder: FolderInfo) => {
    setAppState(prev => ({
      ...prev,
      currentFolderPath: folder.path,
      initialImageIndex: 0,
    }));
  };

  return (
    <ErrorBoundary>
      <div className="flex h-screen flex-col bg-background">
        <div data-tauri-drag-region className="draggable">
          <AppMenuBar isDraggable={true} onMenuAction={handleMenuAction} />
        </div>

        <div className="flex h-screen bg-background text-foreground">
          <Sidebar
            folders={folderInfo}
            selectedFolder={selectedFolder}
            onFolderSelect={handleFolderSelect}
            width={280}
            loading={isPending}
          />
          <ImageViewer
            key={appState.currentFolderPath}
            folderPath={appState.currentFolderPath}
            initialIndex={appState.initialImageIndex}
            className="flex-1"
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
```

---

## テスト戦略

### アクション単体のテスト

```tsx
// features/app-shell/actions/__tests__/openFolderAction.test.ts
import { describe, it, expect, vi } from 'vitest';
import { openFolderAction } from '../openFolderAction';
import type { AppActionContext } from '../../context/AppActionContext';

describe('openFolderAction', () => {
  it('should update state when folder is selected', async () => {
    const mockContext: AppActionContext = {
      setState: vi.fn(),
      getState: () => ({ currentFolderPath: '', initialImageIndex: 0 }),
      fileSystem: {
        openDirectoryDialog: vi.fn().mockResolvedValue('/test/folder'),
      },
      theme: {} as any,
      startTransition: (cb) => cb(),
      notify: vi.fn(),
    };

    await openFolderAction.execute(mockContext);

    expect(mockContext.setState).toHaveBeenCalledWith(expect.any(Function));
    expect(mockContext.notify).toHaveBeenCalledWith('Opened folder: /test/folder');
  });

  it('should not update state when dialog is cancelled', async () => {
    const mockContext: AppActionContext = {
      setState: vi.fn(),
      getState: () => ({ currentFolderPath: '', initialImageIndex: 0 }),
      fileSystem: {
        openDirectoryDialog: vi.fn().mockResolvedValue(null),
      },
      theme: {} as any,
      startTransition: (cb) => cb(),
    };

    await openFolderAction.execute(mockContext);

    expect(mockContext.setState).not.toHaveBeenCalled();
  });
});
```

### レジストリのテスト

```tsx
// features/app-shell/actions/__tests__/registry.test.ts
import { describe, it, expect } from 'vitest';
import { ActionRegistry } from '../registry';
import { openFolderAction } from '../openFolderAction';

describe('ActionRegistry', () => {
  it('should register and retrieve actions', () => {
    const registry = new ActionRegistry([openFolderAction]);
    
    expect(registry.get('open-folder')).toBe(openFolderAction);
    expect(registry.get('non-existent')).toBeUndefined();
  });

  it('should return all registered actions', () => {
    const registry = new ActionRegistry([openFolderAction]);
    const all = registry.getAll();
    
    expect(all).toHaveLength(1);
    expect(all[0]).toBe(openFolderAction);
  });
});
```

---

## 新しいアクションの追加方法

新しいアクションを追加する場合の手順：

1. **アクションファイルを作成**
   ```tsx
   // features/app-shell/actions/saveProjectAction.ts
   import { defineAction } from './types';

   export const saveProjectAction = defineAction(
     'save-project',
     async (ctx) => {
       const currentPath = ctx.getState().currentFolderPath;
       if (!currentPath) {
         ctx.notify?.('No folder open');
         return;
       }
       
       // 保存ロジック
       await ctx.fileSystem.saveProjectFile?.(currentPath);
       ctx.notify?.('Project saved');
     },
     {
       label: 'Save Project',
       shortcut: 'Ctrl+S',
       canExecute: (ctx) => ctx.getState().currentFolderPath !== '',
     }
   );
   ```

2. **レジストリに登録**
   ```tsx
   // features/app-shell/actions/registry.ts
   import { saveProjectAction } from './saveProjectAction';

   export const defaultActionRegistry = new ActionRegistry([
     openFolderAction,
     openImageAction,
     toggleThemeAction,
     saveProjectAction, // 追加
   ]);
   ```

3. **テストを追加**
   ```tsx
   // features/app-shell/actions/__tests__/saveProjectAction.test.ts
   // テストケースを記述
   ```

**それだけ！** 既存のコードは一切変更不要です。

---

## 外部ライブラリを使う場合の選択肢

状態管理がさらに複雑になった場合の選択肢：

### 1. Zustand + Immer（推奨）

軽量で学習コストが低い状態管理ライブラリ。

```bash
pnpm add zustand immer
```

```tsx
// store/appStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface AppStore {
  currentFolderPath: string;
  initialImageIndex: number;
  
  // アクション
  openFolder: (path: string) => void;
  openImage: (path: string, index: number) => void;
  selectFolder: (path: string) => void;
}

export const useAppStore = create<AppStore>()(
  immer((set) => ({
    currentFolderPath: '',
    initialImageIndex: 0,
    
    openFolder: (path) => set((state) => {
      state.currentFolderPath = path;
      state.initialImageIndex = 0;
    }),
    
    openImage: (path, index) => set((state) => {
      state.currentFolderPath = path;
      state.initialImageIndex = index;
    }),
    
    selectFolder: (path) => set((state) => {
      state.currentFolderPath = path;
      state.initialImageIndex = 0;
    }),
  }))
);
```

### 2. TanStack Query（旧React Query）

サーバー状態とキャッシュが重要な場合に有効。

```bash
pnpm add @tanstack/react-query
```

### 3. Jotai / Recoil

Atomic状態管理が必要な場合に検討。

---

## ディレクトリ構造

推奨されるディレクトリ構造：

```
src/
├── features/
│   └── app-shell/
│       ├── actions/
│       │   ├── __tests__/
│       │   │   ├── openFolderAction.test.ts
│       │   │   ├── openImageAction.test.ts
│       │   │   ├── toggleThemeAction.test.ts
│       │   │   └── registry.test.ts
│       │   ├── types.ts
│       │   ├── openFolderAction.ts
│       │   ├── openImageAction.ts
│       │   ├── toggleThemeAction.ts
│       │   └── registry.ts
│       ├── context/
│       │   └── AppActionContext.ts
│       ├── hooks/
│       │   └── useAppActions.ts
│       └── components/
│           └── AppMenuBar.tsx
└── App.tsx
```

---

## まとめ

### このアーキテクチャの利点

1. **スケーラビリティ**: アクションが100個に増えても破綻しない
2. **テスタビリティ**: 各アクションを独立してテスト可能
3. **保守性**: アクション追加時の変更箇所が明確
4. **型安全性**: TypeScriptの恩恵を最大限に活用
5. **React 19対応**: React Compilerと相性が良い

### 移行ステップ

1. **Phase 1**: Command Registry パターンを導入（外部ライブラリ不要）
2. **Phase 2**: 状態管理が複雑になったらZustandを検討
3. **Phase 3**: サーバー状態が重要になったらTanStack Queryを追加

### 推奨

まずは**Dependency Injection + Command Registry パターン**から始めることを強く推奨します。
外部ライブラリなしで、十分にスケーラブルな設計が実現できます。

---

## 参考資料

- [React 19 Release Notes](https://react.dev/blog/2024/12/05/react-19)
- [Command Pattern - Refactoring Guru](https://refactoring.guru/design-patterns/command)
- [Dependency Injection in React](https://kentcdodds.com/blog/application-state-management-with-react)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)

---

最終更新: 2025-10-23
