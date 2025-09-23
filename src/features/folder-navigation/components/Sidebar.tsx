import type { SidebarProps } from '../types/folderTypes';
import { FolderList } from './FolderList';

export function Sidebar({
  folders,
  selectedFolder,
  onFolderSelect,
  onFolderDoubleClick,
  width = 250,
  thumbnailSize = 100,
  showImageCount = true,
  loading = false,
  emptyMessage = 'フォルダが見つかりません',
  className = '',
  style,
}: SidebarProps) {
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex h-32 items-center justify-center">
          <div className="text-muted-foreground">読み込み中...</div>
        </div>
      );
    }

    if (folders.length === 0) {
      return (
        <div className="flex h-32 items-center justify-center px-4">
          <div className="text-center text-muted-foreground text-sm">
            {emptyMessage}
          </div>
        </div>
      );
    }

    return (
      <FolderList
        folders={folders}
        selectedFolder={selectedFolder}
        onFolderSelect={onFolderSelect}
        onFolderDoubleClick={onFolderDoubleClick}
        thumbnailSize={thumbnailSize}
        showImageCount={showImageCount}
      />
    );
  };

  return (
    <aside
      className={`overflow-y-auto border-sidebar-border border-r bg-sidebar text-sidebar-foreground ${className}`}
      style={{ width, ...style }}
    >
      <div className="p-2">
        <h2 className="mb-3 px-2 font-semibold text-sidebar-foreground text-sm">
          フォルダ一覧
        </h2>
        {renderContent()}
      </div>
    </aside>
  );
}
