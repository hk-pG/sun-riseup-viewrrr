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
