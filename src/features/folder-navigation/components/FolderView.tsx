import { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useThumbnail } from '../hooks/useThumbnail';
import type { FolderViewProps } from '../types/folderTypes';

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
      className={`flex w-full cursor-pointer flex-col items-center rounded-lg p-3 transition-colors hover:bg-sidebar-accent ${isSelected ? 'border-2 border-sidebar-primary bg-sidebar-accent' : 'border-2 border-transparent'} ${className} `}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <div
        className="mb-2 flex items-center justify-center overflow-hidden rounded-md bg-muted"
        style={{ width: thumbnailSize, height: thumbnailSize }}
      >
        {(() => {
          if (isLoading) {
            return (
              <div
                data-testid="thumbnail-loading"
                className="h-full w-full animate-pulse bg-muted-foreground/20"
              />
            );
          }

          if (thumbnail && !imgError) {
            return (
              <img
                src={thumbnail.assetUrl}
                alt={`${folder.name}のサムネイル`}
                className="h-full w-full object-cover"
                onError={() => setImgError(true)}
              />
            );
          }

          return (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <span className="text-4xl">📁</span>
            </div>
          );
        })()}
      </div>

      <div className="w-full min-w-0 overflow-hidden px-1 text-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="cursor-help truncate text-sidebar-foreground text-sm leading-tight">
                {folder.name}
              </p>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs break-words">
              {folder.name}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {showImageCount && folder.imageCount !== undefined && (
          <p className="mt-1 text-muted-foreground text-xs">
            {folder.imageCount}枚
          </p>
        )}
      </div>
    </button>
  );
}
