import { useTransition } from 'react';
import { SIDEBAR_CONFIG } from '../../constants/sidebarConfig';
import type { FolderInfo, SidebarProps } from '../../types/folderTypes';
import { SidebarContent } from './SidebarContent';
import { SidebarHeader } from './SidebarHeader';

/**
 * サイドバーコンポーネント
 *
 * フォルダ一覧を表示する。
 * UIロジックと仮想スクロールロジックを分離し、保守性を向上
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
  style,
}: SidebarProps) {
  // フォルダ選択を非ブロッキングで処理、大量フォルダでもUIの応答性を維持
  const [isPending, startTransition] = useTransition();

  // フォルダ選択ハンドラー：大量フォルダでも応答性を維持（非ブロッキング更新）
  const handleFolderSelect = (folder: FolderInfo) => {
    if (!onFolderSelect) return;
    startTransition(() => {
      onFolderSelect(folder);
    });
  };

  return (
    <aside
      className={`flex min-h-0 flex-col border-sidebar-border bg-sidebar text-sidebar-foreground`}
      style={{ width, ...style }}
    >
      <div className="flex min-h-0 flex-1 flex-col p-2">
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
