import { openFolderAction } from './openFolderAction';
import { openImageAction } from './openImageAction';
import { toggleThemeAction } from './toggleThemeAction';
import type { ActionRegistry } from './types';

/**
 * 全アクションハンドラーを登録する Map を生成。
 */
export function createActionRegistry(): ActionRegistry {
  return new Map([
    ['open-folder', openFolderAction],
    ['open-image', openImageAction],
    ['toggle-theme', toggleThemeAction],
  ]);
}
