import type { ViewerControlsProps } from '../types/viewerTypes';
import { Button } from './ui/button';

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
  if (!isVisible) return null;

  return (
    <div
      className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white rounded-lg px-4 py-2 flex items-center gap-4 ${className}`}
    >
      <Button
        onClick={onNext}
        disabled={currentIndex >= totalImages - 1}
        variant="secondary"
        className="px-2 py-1 min-w-16"
      >
        ◀ 次
      </Button>
      <span className="text-sm">
        {currentIndex + 1} / {totalImages}
      </span>
      <Button
        onClick={onPrevious}
        disabled={currentIndex <= 0}
        variant="secondary"
        className="px-2 py-1 min-w-16"
      >
        前 ▶
      </Button>

      <div className="w-px h-4 bg-white bg-opacity-30" />

      <Button onClick={onZoomOut} variant="ghost" className="px-2 py-1">
        ー
      </Button>

      <span className="text-sm min-w-12 text-center">
        {Math.round(zoom * 100)}%
      </span>

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
