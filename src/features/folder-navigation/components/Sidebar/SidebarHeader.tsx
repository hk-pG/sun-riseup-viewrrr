interface SidebarHeaderProps {
  /** タイトルテキスト */
  title?: string;
  /** 追加のクラス名 */
  className?: string;
}

/**
 * サイドバーのヘッダー部分
 * 将来的に検索機能やフィルタ機能を追加する際の拡張ポイント
 */
export function SidebarHeader({
  title = 'フォルダ一覧',
  className = '',
}: SidebarHeaderProps) {
  return (
    <h2
      className={`border-sidebar-border border-b px-2 py-1 font-medium text-sidebar-foreground text-xs ${className}`}
    >
      {title}
    </h2>
  );
}
