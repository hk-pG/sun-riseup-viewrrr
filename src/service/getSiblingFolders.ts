import type { FolderEntry } from '../hooks/useFolderNavigator';
import type { FileSystemService } from './FileSystemService';

/**
 * 指定されたフォルダパスの同階層にあるフォルダ一覧を取得し、
 * 各フォルダのパスと名前（ベース名）をFolderEntry配列として返す
 *
 * @param currentFolderPath - 現在のフォルダのパス
 * @param fs - ファイルシステムサービス（FileSystemService）
 * @returns FolderEntry[] - 同階層のフォルダ情報（パス・名前）の配列
 *
 * - currentFolderPathが空の場合は空配列を返す
 * - 取得や変換でエラーが発生した場合も空配列を返す
 */
export async function getSiblingFolderEntries(
  currentFolderPath: string,
  fs: FileSystemService,
): Promise<FolderEntry[]> {
  // パスが未指定の場合は空配列を返す
  if (!currentFolderPath) {
    return [];
  }

  try {
    // 同階層のフォルダパス一覧を取得
    const paths = await fs.getSiblingFolders(currentFolderPath);

    // フォルダが存在しない場合は空配列を返す
    if (paths.length === 0) {
      return [];
    }

    // 各フォルダパスからベース名を取得し、FolderEntry配列を生成
    const entries: FolderEntry[] = await Promise.all(
      paths.map(async (path) => ({
        path,
        name: await fs.getBaseName(path),
      })),
    );

    return entries;
  } catch (error) {
    // 取得や変換でエラーが発生した場合はエラーを出力し、空配列を返す
    console.error('Error fetching folder entries:', error);
    return [];
  }
}
