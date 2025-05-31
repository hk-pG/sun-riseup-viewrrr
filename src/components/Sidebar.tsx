import type { SidebarProps } from '@/types/viewerTypes';
import type React from 'react';
import { FolderList } from './FolderList';

export const Sidebar: React.FC<SidebarProps> = ({
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
}) => {
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">読み込み中...</div>
        </div>
      );
    }

    if (folders.length === 0) {
      return (
        <div className="flex items-center justify-center h-32 px-4">
          <div className="text-gray-500 text-center text-sm">
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
      className={`bg-gray-50 border-r border-gray-200 overflow-y-auto ${className}`}
      style={{ width, ...style }}
    >
      <div className="p-2">
        <h2 className="text-sm font-semibold text-gray-700 mb-3 px-2">
          フォルダ一覧
        </h2>
        {renderContent()}
      </div>
    </aside>
  );
};
