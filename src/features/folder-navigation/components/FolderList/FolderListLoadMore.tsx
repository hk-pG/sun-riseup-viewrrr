interface FolderListLoadMoreProps {
  /** 残りの件数 */
  remainingCount: number;
  /** クリック時のコールバック */
  onClick: () => void;
  /** 追加のクラス名 */
  className?: string;
}

/**
 * フォルダリストの追加読み込みボタン
 */
export function FolderListLoadMore({
  remainingCount,
  onClick,
  className = '',
}: FolderListLoadMoreProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-muted-foreground hover:bg-sidebar-accent w-full p-2 text-sm ${className}`}
    >
      さらに読み込む ({remainingCount}件)
    </button>
  );
}
