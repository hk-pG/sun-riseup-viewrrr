import { ArrowBigLeft, ArrowBigRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { ViewerControlsProps } from '../types/viewerTypes';

export function ViewerControls({
  currentIndex,
  totalImages,
  onPrevious,
  onNext,
  isVisible,
  className = '',
}: ViewerControlsProps) {
  const canGoNext = currentIndex < totalImages - 1;
  const canGoPrevious = currentIndex > 0;
  const displayIndex = currentIndex + 1;

  if (!isVisible) return null;

  return (
    <div
      className={`absolute bottom-4 left-1/2 flex -translate-x-1/2 transform items-center gap-4 rounded-lg bg-background/75 px-4 py-2 text-foreground backdrop-blur-sm ${className}`}
    >
      <Button
        onClick={onNext}
        disabled={!canGoNext}
        variant="secondary"
        className="min-w-16 px-2 py-1"
      >
        <ArrowBigLeft />
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
        <ArrowBigRight />
      </Button>

      <div className="h-4 w-px bg-border" />
    </div>
  );
}
