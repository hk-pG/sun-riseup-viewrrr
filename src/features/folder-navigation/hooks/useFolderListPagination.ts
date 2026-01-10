import { useCallback, useState } from 'react';
import { SIDEBAR_CONFIG } from '../constants/sidebarConfig';

/**
 * フォルダリストのページネーション管理
 *
 * 大量フォルダ表示時のUIブロッキングを防止するため、
 * 初期表示件数を制限し、追加読み込みで段階的に表示
 *
 * @param totalCount - フォルダの総数
 * @param options - ページネーション設定（省略時はSIDEBAR_CONFIGを使用）
 */
export function useFolderListPagination(
  totalCount: number,
  options?: {
    /** 初期表示件数 */
    initialCount?: number;
    /** 追加読み込み件数 */
    incrementCount?: number;
  },
) {
  const {
    initialCount = SIDEBAR_CONFIG.INITIAL_VISIBLE_COUNT,
    incrementCount = SIDEBAR_CONFIG.LOAD_MORE_INCREMENT,
  } = options ?? {};

  const [visibleCount, setVisibleCount] = useState(initialCount);

  /** 追加読み込み */
  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + incrementCount, totalCount));
  }, [incrementCount, totalCount]);

  /** 全件表示 */
  const showAll = useCallback(() => {
    setVisibleCount(totalCount);
  }, [totalCount]);

  /** 初期状態にリセット */
  const reset = useCallback(() => {
    setVisibleCount(initialCount);
  }, [initialCount]);

  return {
    /** 現在の表示件数 */
    visibleCount,
    /** 追加読み込み可能かどうか */
    hasMore: visibleCount < totalCount,
    /** 残りの件数 */
    remainingCount: Math.max(0, totalCount - visibleCount),
    /** 追加読み込み */
    loadMore,
    /** 全件表示 */
    showAll,
    /** 初期状態にリセット */
    reset,
  };
}
