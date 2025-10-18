'use client';

import { useCallback, useMemo } from 'react';
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
  // 選択状態チェック関数の最適化
  const isSelected = useCallback(
    (folder: FolderInfo) => {
      return selectedFolder?.path === folder.path;
    },
    [selectedFolder?.path],
  );

  // フォルダリストのレンダリング最適化：大量フォルダでも高速表示
  const folderItems = useMemo(() => {
    return folders.map((folder) => (
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
  }, [
    folders,
    isSelected,
    onFolderSelect,
    onFolderDoubleClick,
    thumbnailSize,
    showImageCount,
  ]);

  return <div className="space-y-2">{folderItems}</div>;
}
