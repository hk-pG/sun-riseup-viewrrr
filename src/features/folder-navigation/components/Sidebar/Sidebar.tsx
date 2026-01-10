import { useTransition } from 'react';
import { SIDEBAR_CONFIG } from '../../constants/sidebarConfig';
import { useThumbnailPrefetch } from '../../hooks/useThumbnailPrefetch';
import type { FolderInfo, SidebarProps } from '../../types/folderTypes';
import { SidebarContent } from './SidebarContent';
import { SidebarHeader } from './SidebarHeader';

/**
 * サイドバーコンポーネント
 *
 * フォルダ一覧を表示し、サムネイルのプリフェッチを管理
 * UIロジックとプリフェッチロジックを分離し、保守性を向上
 */
export function Sidebar({
  folders,
  selectedFolder,
  onFolderSelect,
  onFolderDoubleClick,
  width = SIDEBAR_CONFIG.DEFAULT_WIDTH,
  thumbnailSize = SIDEBAR_CONFIG.DEFAULT_THUMBNAIL_SIZE,
  showImageCount = true,
  loading = false,
  emptyMessage = 'フォルダが見つかりません',
  className = '',
  style,
}: SidebarProps) {
  // フォルダ選択を非ブロッキングで処理、大量フォルダでもUIの応答性を維持
  const [isPending, startTransition] = useTransition();

  // サムネイルのバックグラウンドプリフェッチ
  useThumbnailPrefetch(folders);

  // フォルダ選択ハンドラー：大量フォルダでも応答性を維持（非ブロッキング更新）
  const handleFolderSelect = (folder: FolderInfo) => {
    if (!onFolderSelect) return;
    startTransition(() => {
      onFolderSelect(folder);
    });
  };

  return (
    <aside
      className={`overflow-y-auto border-sidebar-border bg-sidebar text-sidebar-foreground ${className}`}
      style={{ width, ...style }}
    >
      <div className="p-2">
        <SidebarHeader />
        <SidebarContent
          folders={folders}
          selectedFolder={selectedFolder}
          onFolderSelect={handleFolderSelect}
          onFolderDoubleClick={onFolderDoubleClick}
          thumbnailSize={thumbnailSize}
          showImageCount={showImageCount}
          loading={loading}
          isPending={isPending}
          emptyMessage={emptyMessage}
        />
      </div>
    </aside>
  );
}
