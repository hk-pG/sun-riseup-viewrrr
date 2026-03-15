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
    ['toggle-theme', async () => toggleThemeAction(deps.currentTheme)],
  ]);
}
