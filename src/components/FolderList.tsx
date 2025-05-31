'use client';

import type React from 'react';
import type { FolderListProps } from '../types/viewerTypes';
import { FolderView } from './FolderView';

export const FolderList: React.FC<FolderListProps> = ({
  folders,
  selectedFolder,
  onFolderSelect,
  onFolderDoubleClick,
  thumbnailSize = 100,
  showImageCount = true,
}) => {
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
};
