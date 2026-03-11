import { useEffect } from 'react';
import { useServices } from '../../../shared/context/ServiceContext';
import { SIDEBAR_CONFIG } from '../constants/sidebarConfig';
import type { FileSystemService } from '../services/FileSystemService';
import type { FolderInfo } from '../types/folderTypes';

/**
 * フォルダの最初の画像パスを取得
 */
async function getFirstImagePath(
  folderPath: string,
  fs: FileSystemService,
): Promise<string | null> {
  try {
    const files = await fs.listImagesInFolder(folderPath);
    return files.length > 0 ? files[0] : null;
  } catch {
    return null;
  }
}

/**
 * 可視領域のサムネイルをバックグラウンドでプリフェッチ
 *
 * UIの初期レンダリング完了後に遅延実行し、Fire-and-Forgetパターンで
 * バックグラウンド処理することでUIブロッキングを防止
 *
 * @param folders - フォルダ一覧
 * @param options - プリフェッチ設定（省略時はSIDEBAR_CONFIGを使用）
 */
export function useThumbnailPrefetch(
  folders: FolderInfo[],
  options?: {
    /** プリフェッチ対象の件数 */
    visibleCount?: number;
    /** プリフェッチ開始までの遅延（ms） */
    delay?: number;
    /** プリフェッチを無効化 */
    disabled?: boolean;
  },
) {
  const fs = useServices();
  const {
    visibleCount = SIDEBAR_CONFIG.INITIAL_VISIBLE_COUNT,
    delay = SIDEBAR_CONFIG.PREFETCH_DELAY_MS,
    disabled = false,
  } = options ?? {};

  useEffect(() => {
    // 無効化されている場合は何もしない
    if (disabled) return;

    // フォルダがない場合はスキップ
    if (folders.length === 0) return;

    // バッチAPI（新旧どちらも）未対応の場合はスキップ
    if (!fs.prefetchFolderThumbnails && !fs.batchCreateThumbnails) return;

    // UIの初期レンダリング完了後にプリフェッチ開始
    const timeoutId = setTimeout(() => {
      // 新API: prefetch_folder_thumbnails（バックエンド一括処理）
      if (fs.prefetchFolderThumbnails) {
        const folderPaths = folders.map((f) => f.path);
        void fs
          .prefetchFolderThumbnails(folderPaths)
          .catch((err) => console.warn('Prefetch failed:', err));
        return;
      }

      // フォールバック: 旧API
      // Fire-and-Forget: async関数を起動するがawaitしない
      void (async () => {
        // 可視領域のフォルダパスを取得
        const visibleFolders = folders
          .slice(0, visibleCount)
          .map((f) => f.path);

        // 各フォルダの最初の画像パスを取得
        const imagePathPromises = visibleFolders.map((folderPath) =>
          getFirstImagePath(folderPath, fs),
        );
        const imagePaths = (await Promise.all(imagePathPromises)).filter(
          (path): path is string => path !== null,
        );

        if (imagePaths.length === 0) return;

        // バッチ生成を実行（優先度付き）
        try {
          await fs.batchCreateThumbnails?.(imagePaths, imagePaths.length);
        } catch (error) {
          console.warn('Batch thumbnail prefetch failed:', error);
        }
      })();
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [folders, fs, visibleCount, delay, disabled]);
}
