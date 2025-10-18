import { Button } from '@/shared/components/ui/button';
import type { ViewerControlsProps } from '../types/viewerTypes';

export function ViewerControls({
  currentIndex,
  totalImages,
  zoom,
  onPrevious,
  onNext,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  isVisible,
  className = '',
}: ViewerControlsProps) {
  const canGoNext = currentIndex < totalImages - 1;
  const canGoPrevious = currentIndex > 0;
  const displayIndex = currentIndex + 1;
  const zoomPercentage = Math.round(zoom * 100);

  if (!isVisible) return null;

  return (
    <div
      className={`-translate-x-1/2 absolute bottom-4 left-1/2 flex transform items-center gap-4 rounded-lg bg-background/75 px-4 py-2 text-foreground backdrop-blur-sm ${className}`}
    >
      <Button
        onClick={onNext}
        disabled={!canGoNext}
        variant="secondary"
        className="min-w-16 px-2 py-1"
      >
        ◀ 次
      </Button>
      <span className="text-sm">
        {displayIndex} / {totalImages}
      </span>
      <Button
        onClick={onPrevious}
        disabled={!canGoPrevious}
        variant="secondary"
        className="min-w-16 px-2 py-1"
      >
        前 ▶
      </Button>

      <div className="h-4 w-px bg-border" />

      <Button onClick={onZoomOut} variant="ghost" className="px-2 py-1">
        ー
      </Button>

      <span className="min-w-12 text-center text-sm">{zoomPercentage}%</span>

      <Button onClick={onZoomIn} variant="ghost" className="px-2 py-1">
        ＋
      </Button>

      <Button
        onClick={onResetZoom}
        variant="outline"
        className="px-2 py-1 text-sm"
      >
        リセット
      </Button>
    </div>
  );
}
