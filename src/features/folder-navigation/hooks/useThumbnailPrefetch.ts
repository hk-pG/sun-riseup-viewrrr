import { useEffect } from 'react';
import { useServices } from '../../../shared/context/ServiceContext';
import { SIDEBAR_CONFIG } from '../constants/sidebarConfig';
import type { FolderInfo } from '../types/folderTypes';

/**
 * サムネイルをバックグラウンドでプリフェッチ
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
    /** プリフェッチ開始までの遅延（ms） */
    delay?: number;
    /** プリフェッチを無効化 */
    disabled?: boolean;
  },
) {
  const fs = useServices();
  const { delay = SIDEBAR_CONFIG.PREFETCH_DELAY_MS, disabled = false } =
    options ?? {};

  useEffect(() => {
    if (disabled || folders.length === 0) return;

    const timeoutId = setTimeout(() => {
      const folderPaths = folders.map((f) => f.path);
      void fs
        .prefetchFolderThumbnails(folderPaths)
        .catch((err) => console.warn('Prefetch failed:', err));
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [folders, fs, delay, disabled]);
}
