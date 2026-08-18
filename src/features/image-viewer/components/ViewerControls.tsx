import type { ViewerControlsProps } from '../types/viewerTypes';

export function ViewerControls({
  currentIndex,
  totalImages,
  isVisible,
  className = '',
}: ViewerControlsProps) {
  if (!isVisible) return null;

  const displayIndex = currentIndex + 1;

  return (
    <div
      className={`pointer-events-none absolute top-2 right-2 rounded-sm bg-black/40 px-2 py-0.5 text-white/90 text-xs tabular-nums ${className}`}
      aria-live="polite"
    >
      {displayIndex} / {totalImages}
    </div>
  );
}
