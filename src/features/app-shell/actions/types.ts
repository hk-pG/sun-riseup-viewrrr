import type { AppState } from '@/App';
import type { OpenImageFileResult } from '@/features/folder-navigation/hooks/useOpenImageFile';
import type { FileSystemService } from '@/features/folder-navigation/services/FileSystemService';
import type { AppMenuBarEvent } from '../components/AppMenuBar';

// ============================================================
// Result 型（discriminated union）
// ============================================================

export interface FolderSelectedResult {
  type: 'folder-selected';
  folderPath: string;
  initialImageIndex: number;
}

export interface ThemeToggledResult {
  type: 'theme-toggled';
  theme: 'dark' | 'light';
}

export type ActionResult = FolderSelectedResult | ThemeToggledResult;

// ============================================================
// Handler 型
// ============================================================

export type BoundActionHandler = () => Promise<ActionResult | null>;

export type ActionRegistry = Map<AppMenuBarEvent, BoundActionHandler>;

// ============================================================
// 依存型
// ============================================================

export interface ActionDependencies {
  fss: FileSystemService;
  openImageFile: () => Promise<OpenImageFileResult | null>;
  currentTheme: 'dark' | 'light';
}

export interface ResultApplier {
  startTransition: (callback: () => void) => void;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  setTheme: (theme: 'dark' | 'light') => void;
}

// ============================================================
// 旧型（Phase 3 で削除予定）
// ============================================================

/**
 * @deprecated Result パターン移行後に削除予定。ActionDependencies + ResultApplier に分割された。
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
 * @deprecated Result パターン移行後に削除予定。BoundActionHandler に置換された。
 */
export type ActionHandler = (context: ActionContext) => Promise<void>;
