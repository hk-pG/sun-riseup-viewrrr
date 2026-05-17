import type { AppMenuBarEvent } from '../components/AppMenuBar';
import { openFolderAction } from './openFolderAction';
import { openImageAction } from './openImageAction';
import { toggleThemeAction } from './toggleThemeAction';
import type {
  ActionDependencies,
  ActionRegistry,
  BoundActionHandler,
} from './types';

export function createActionRegistry(deps: ActionDependencies): ActionRegistry {
  return new Map<AppMenuBarEvent, BoundActionHandler>([
    ['open-folder', () => openFolderAction(deps.fss)],
    ['open-image', () => openImageAction(deps.openImageFile)],
    // 同期アクションは async ラッパーで BoundActionHandler の Promise 型に適合させる
    ['toggle-theme', async () => toggleThemeAction(deps.currentTheme)],
  ]);
}
