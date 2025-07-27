import type { FolderSortFunction } from '../types/FolderSortFunction';

/**
 * Natural sort function for folders that handles Japanese text and numeric values properly
 * Uses localeCompare with Japanese locale and numeric sorting enabled
 *
 * @param a - First folder entry to compare
 * @param b - Second folder entry to compare
 * @returns Negative number if a should come before b, positive if after, 0 if equal
 */
export const naturalFolderSort: FolderSortFunction = (a, b) => {
  const [aName, bName] = [a.name || '', b.name || ''];

  const result = aName.localeCompare(bName, 'ja', { numeric: true });

  return result;
};
