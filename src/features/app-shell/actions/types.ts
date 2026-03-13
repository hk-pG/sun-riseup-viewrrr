import type { AppState } from '@/App';
import type { OpenImageFileResult } from '@/features/folder-navigation/hooks/useOpenImageFile';
import type { FileSystemService } from '@/features/folder-navigation/services/FileSystemService';
import type { AppMenuBarEvent } from '../components/AppMenuBar';

/**
 * アクションハンドラーが受け取るコンテキスト。
 * App コンポーネントが持つ依存を集約したもの。
 */
export interface ActionContext {
  fss: FileSystemService;
  openImageFile: () => Promise<OpenImageFileResult | null>;
  themeApi: {
    theme: 'dark' | 'light';
    setTheme: (theme: 'dark' | 'light') => void;
  };
  startTransition: (callback: () => void) => void;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

/**
 * 個別アクションハンドラーの型。
 */
export type ActionHandler = (context: ActionContext) => Promise<void>;

/**
 * アクション ID → ハンドラー関数の Map 型。
 */
export type ActionRegistry = Map<AppMenuBarEvent, ActionHandler>;
