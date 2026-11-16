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
      className={`text-sidebar-foreground mb-3 px-2 text-sm font-semibold ${className}`}
    >
      {title}
    </h2>
  );
}
