import type { FolderSortFunction } from '../types/folderTypes';

/**
 * Natural sort function for folders that handles Japanese text and numeric values properly
 * Uses localeCompare with Japanese locale and numeric sorting enabled
 */
export const naturalFolderSort: FolderSortFunction = (a, b) => {
  const [aName, bName] = [a.name || '', b.name || ''];

  return aName.localeCompare(bName, 'ja', { numeric: true });
};
