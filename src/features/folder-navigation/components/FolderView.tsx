import { useState } from 'react';
import type { FolderViewProps } from '../types/folderTypes';
import { useThumbnail } from '../../../components/hooks/useThumbnail';

export function FolderView({
  folder,
  isSelected = false,
  onClick,
  onDoubleClick,
  thumbnailSize = 120,
  showImageCount = true,
  className = '',
}: FolderViewProps) {
  const { thumbnail, isLoading } = useThumbnail(folder.path);
  const [imgError, setImgError] = useState(false);
  const handleClick = () => {
    onClick(folder);
  };

  const handleDoubleClick = () => {
    if (onDoubleClick) {
      onDoubleClick(folder);
    }
  };

  return (
    <button
      type="button"
      className={`
        flex flex-col items-center p-3 cursor-pointer rounded-lg transition-colors
        hover:bg-gray-100 ${isSelected ? 'bg-blue-50 border-2 border-blue-300' : 'border-2 border-transparent'}
        ${className}
      `}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <div
        className="flex items-center justify-center bg-gray-200 rounded-md overflow-hidden mb-2"
        style={{ width: thumbnailSize, height: thumbnailSize }}
      >
        {isLoading ? (
          <div
            data-testid="thumbnail-loading"
            className="animate-pulse bg-gray-300 w-full h-full"
          />
        ) : thumbnail && !imgError ? (
          <img
            src={thumbnail.assetUrl}
            alt={`${folder.name}のサムネイル`}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-400">
            <span className="text-4xl">📁</span>
          </div>
        )}
      </div>

      <div className="text-center w-full">
        <p className="text-sm text-gray-700 break-words leading-tight">
          {folder.name}
        </p>
        {showImageCount && folder.imageCount !== undefined && (
          <p className="text-xs text-gray-500 mt-1">{folder.imageCount}枚</p>
        )}
      </div>
    </button>
  );
}
