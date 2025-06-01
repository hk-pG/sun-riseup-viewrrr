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
  if (!isVisible) return null;

  return (
    <div
      className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white rounded-lg px-4 py-2 flex items-center gap-4 ${className}`}
    >
      <button
        type="button"
        onClick={onPrevious}
        disabled={currentIndex <= 0}
        className="px-2 py-1 rounded hover:bg-white hover:bg-opacity-20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ◀ 前
      </button>

      <span className="text-sm">
        {currentIndex + 1} / {totalImages}
      </span>

      <button
        type="button"
        onClick={onNext}
        disabled={currentIndex >= totalImages - 1}
        className="px-2 py-1 rounded hover:bg-white hover:bg-opacity-20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        次 ▶
      </button>

      <div className="w-px h-4 bg-white bg-opacity-30" />

      <button
        type="button"
        onClick={onZoomOut}
        className="px-2 py-1 rounded hover:bg-white hover:bg-opacity-20"
      >
        ー
      </button>

      <span className="text-sm min-w-12 text-center">
        {Math.round(zoom * 100)}%
      </span>

      <button
        type="button"
        onClick={onZoomIn}
        className="px-2 py-1 rounded hover:bg-white hover:bg-opacity-20"
      >
        ＋
      </button>

      <button
        type="button"
        onClick={onResetZoom}
        className="px-2 py-1 rounded hover:bg-white hover:bg-opacity-20 text-sm"
      >
        リセット
      </button>
    </div>
  );
}
