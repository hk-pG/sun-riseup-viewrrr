import type { FolderEntry } from './folderTypes';

/**
 * FolderEntry 配列をソートするための関数型。
 */
export type FolderSortFunction = (a: FolderEntry, b: FolderEntry) => number;
