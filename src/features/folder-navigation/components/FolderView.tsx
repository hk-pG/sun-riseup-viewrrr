import { LucideFolder } from 'lucide-react';
import { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useThumbnail } from '../hooks/useThumbnail';
import type { FolderViewProps } from '../types/folderTypes';

export function FolderView({
  folder,
  isSelected = false,
  onClick,
  onDoubleClick,
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
      aria-pressed={isSelected}
      className={cn(
        'flex w-full cursor-pointer flex-col p-1.5 text-left transition-colors hover:bg-sidebar-accent',
        isSelected && 'bg-sidebar-accent ring-1 ring-sidebar-ring ring-inset',
        className,
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <div className="aspect-[2/3] w-full overflow-hidden bg-muted">
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
                className="h-full w-full object-cover object-top"
                onError={() => setImgError(true)}
              />
            );
          }

          return (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <LucideFolder className="size-8" />
            </div>
          );
        })()}
      </div>

      <div className="w-full min-w-0 px-1 py-1">
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
          <p className="text-muted-foreground text-xs">{folder.imageCount}枚</p>
        )}
      </div>
    </button>
  );
}
