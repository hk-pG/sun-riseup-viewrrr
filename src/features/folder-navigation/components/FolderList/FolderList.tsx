'use client';

import { useFolderListPagination } from '../../hooks/useFolderListPagination';
import type { FolderInfo, FolderListProps } from '../../types/folderTypes';
import { FolderView } from '../FolderView';
import { FolderListLoadMore } from './FolderListLoadMore';

/**
 * フォルダリストコンポーネント
 *
 * 大量フォルダ時のUIブロッキングを防止するため、
 * 初期表示件数を制限し、追加読み込みで段階的に表示
 */
export function FolderList({
  folders,
  selectedFolder,
  onFolderSelect,
  onFolderDoubleClick,
  thumbnailSize = 100,
  showImageCount = true,
}: FolderListProps) {
  const { visibleCount, hasMore, remainingCount, loadMore } =
    useFolderListPagination(folders.length);

  const visibleFolders = folders.slice(0, visibleCount);

  const isSelected = (folder: FolderInfo) => {
    return selectedFolder?.path === folder.path;
  };

  return (
    <div className="space-y-2">
      {visibleFolders.map((folder) => (
        <FolderView
          key={folder.path}
          folder={folder}
          isSelected={isSelected(folder)}
          onClick={onFolderSelect}
          onDoubleClick={onFolderDoubleClick}
          thumbnailSize={thumbnailSize}
          showImageCount={showImageCount}
        />
      ))}
      {hasMore && (
        <FolderListLoadMore
          remainingCount={remainingCount}
          onClick={loadMore}
        />
      )}
    </div>
  );
}
