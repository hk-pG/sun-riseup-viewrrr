'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import type { FolderInfo, FolderListProps } from '../../types/folderTypes';
import { FolderView } from '../FolderView';

/**
 * フォルダリストコンポーネント
 * 仮想スクロールを使用
 */
export function FolderList({
  folders,
  selectedFolder,
  onFolderSelect,
  onFolderDoubleClick,
  thumbnailSize = 100,
  showImageCount = true,
}: FolderListProps) {
  const isSelected = (folder: FolderInfo) => {
    return selectedFolder?.path === folder.path;
  };

  const parentRef = useRef<HTMLDivElement>(null);
  const folderViewVirtualizer = useVirtualizer({
    count: folders.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => {
      const width = parentRef.current?.clientWidth ?? 250;
      return Math.round(width * 1.5) + 32;
    },
    overscan: 3,
  });

  return (
    <div
      data-testid="folder-list"
      className="flex min-h-0 flex-1 flex-col overflow-auto"
      ref={parentRef}
    >
      <div
        className="relative w-full"
        style={{ height: `${folderViewVirtualizer.getTotalSize()}px` }}
      >
        {folderViewVirtualizer.getVirtualItems().map((item) => (
          <div
            key={item.key}
            ref={folderViewVirtualizer.measureElement}
            data-index={item.index}
            className="absolute top-0 left-0 w-full"
            style={{
              transform: `translateY(${item.start}px)`,
            }}
          >
            <FolderView
              folder={folders[item.index]}
              isSelected={isSelected(folders[item.index])}
              onClick={onFolderSelect}
              onDoubleClick={onFolderDoubleClick}
              thumbnailSize={thumbnailSize}
              showImageCount={showImageCount}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
