'use client';

import type { FolderListProps } from '../types/viewerTypes';
import { FolderView } from './FolderView';

export function FolderList({
  folders,
  selectedFolder,
  onFolderSelect,
  onFolderDoubleClick,
  thumbnailSize = 100,
  showImageCount = true,
}: FolderListProps) {
  return (
    <div className="space-y-2">
      {folders.map((folder) => (
        <FolderView
          key={folder.path}
          folder={folder}
          isSelected={selectedFolder?.path === folder.path}
          onClick={onFolderSelect}
          onDoubleClick={onFolderDoubleClick}
          thumbnailSize={thumbnailSize}
          showImageCount={showImageCount}
        />
      ))}
    </div>
  );
}
