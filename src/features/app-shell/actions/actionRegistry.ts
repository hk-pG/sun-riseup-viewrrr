import type { AppMenuBarEvent } from '../components/AppMenuBar';
import { openFolderAction } from './openFolderAction';
import { openImageAction } from './openImageAction';
import { toggleThemeAction } from './toggleThemeAction';
import type { ActionHandler } from './types';

/**
 * 全アクションハンドラーを登録する Map を生成。
 */
export function createActionRegistry(): Map<AppMenuBarEvent, ActionHandler> {
  return new Map<AppMenuBarEvent, ActionHandler>([
    ['open-folder', openFolderAction],
    ['open-image', openImageAction],
    ['toggle-theme', toggleThemeAction],
  ]);
}
