'use client';

import { useState } from 'react';
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
  // 初期表示を20件に制限して大量フォルダ時のUIブロッキングを防止
  // 参考: 100件の同時レンダリングはTauri IPC × 100を引き起こしメインスレッドをブロック
  const [visibleCount, setVisibleCount] = useState(20);
  const visibleFolders = folders.slice(0, visibleCount);

  const isSelected = (folder: FolderInfo) => {
    return selectedFolder?.path === folder.path;
  };

  const folderItems = visibleFolders.map((folder) => (
    <FolderView
      key={folder.path}
      folder={folder}
      isSelected={isSelected(folder)}
      onClick={onFolderSelect}
      onDoubleClick={onFolderDoubleClick}
      thumbnailSize={thumbnailSize}
      showImageCount={showImageCount}
    />
  ));

  return (
    <div className="space-y-2">
      {folderItems}
      {visibleCount < folders.length && (
        <button
          type="button"
          onClick={() => setVisibleCount((prev) => prev + 20)}
          className="w-full p-2 text-muted-foreground text-sm hover:bg-sidebar-accent"
        >
          さらに読み込む ({folders.length - visibleCount}件)
        </button>
      )}
    </div>
  );
}
