'use client';

import { useCallback } from 'react';
import type { FolderInfo, FolderListProps } from '../types/folderTypes';
import { FolderView } from './FolderView';

export function FolderList({
  folders,
  selectedFolder,
  onFolderSelect,
  onFolderDoubleClick,
  thumbnailSize = 100,
  showImageCount = true,
}: FolderListProps) {
  const isSelected = useCallback(
    (folder: FolderInfo) => {
      return selectedFolder?.path === folder.path;
    },
    [selectedFolder?.path],
  );

  return (
    <div className="space-y-2">
      {folders.map((folder) => (
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
    </div>
  );
}
