import { type FolderSortFunction, naturalFolderSort } from '../../../shared';
import {
  createFolderEntry,
  type FolderEntry,
} from '../hooks/useSiblingFolders';
import type { FileSystemService } from './FileSystemService';

/**
 * 指定されたフォルダパスの同階層にあるフォルダ一覧を取得し、
 * 現在のフォルダも含めて各フォルダのパスと名前（ベース名）をFolderEntry配列として返す
 *
 * @param currentFolderPath - 現在のフォルダのパス
 * @param fs - ファイルシステムサービス（FileSystemService）
 * @param sortFn - ソート関数（省略時はnaturalFolderSortを使用）
 * @returns FolderEntry[] - 同階層のフォルダ情報（パス・名前）の配列（現在のフォルダを含む、ソート済み）
 *
 * - currentFolderPathが空の場合は空配列を返す
 * - 取得や変換でエラーが発生した場合も空配列を返す
 * - 現在のフォルダの作成に失敗した場合でも、兄弟フォルダは返す
 */
export async function getSiblingFolderEntries(
  currentFolderPath: string,
  fs: FileSystemService,
  sortFn: FolderSortFunction = naturalFolderSort,
): Promise<FolderEntry[]> {
  // パスが未指定の場合は空配列を返す
  if (!currentFolderPath) {
    return [];
  }

  try {
    // 同階層のフォルダパス一覧を取得
    const paths = await fs.getSiblingFolders(currentFolderPath);

    // 各フォルダパスからベース名を取得し、FolderEntry配列を生成
    const entries: FolderEntry[] = await Promise.all(
      paths.map(async (dirPath) => createFolderEntry(dirPath, fs)),
    );

    // 現在のフォルダも追加（エラーが発生しても兄弟フォルダは返す）
    try {
      const currentEntry = await createFolderEntry(currentFolderPath, fs);
      entries.push(currentEntry);
    } catch (currentFolderError) {
      console.error('Error creating current folder entry:', currentFolderError);
    }

    // ソート関数を適用して返す
    return entries.sort(sortFn);
  } catch (error) {
    // 取得や変換でエラーが発生した場合はエラーを出力し、空配列を返す
    console.error('Error fetching folder entries:', error);
    return [];
  }
}
