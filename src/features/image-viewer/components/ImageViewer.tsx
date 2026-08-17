'use client';

import { useEffect, useRef, useState } from 'react';
import type { ImageContainer } from '@/features/image-viewer/types/ImageContainer';
import type { ImageSource } from '@/features/image-viewer/types/ImageSource';
import type {
  KeyboardMapping,
  ViewerSettings,
} from '@/features/image-viewer/types/viewerTypes';
import { useImages } from '@/shared/hooks/data/useImages';
import { useControlsVisibility } from '../hooks/useControlsVisibility';
import { useKeyboardHandler } from '../hooks/useKeyboardHandler';
import { useViewerActions } from '../hooks/useViewerActions';
import { ImageDisplay } from './ImageDisplay';
import { ViewerControls } from './ViewerControls';

/**
 * ImageViewerProps: 画像コンテナまたはフォルダパスを受け取り、その中の画像を表示するビューアのprops
 */
export interface ImageViewerProps {
  container?: ImageContainer;
  initialIndex?: number;
  settings?: Partial<ViewerSettings>;
  keyboardMapping?: KeyboardMapping;
  callbacks?: {
    onImageLoad?: (image: ImageSource) => void;
    onImageError?: (error: Error, image: ImageSource) => void;
  };
  className?: string;
}

export function ImageViewer({
  container,
  initialIndex = 0,
  settings: userSettings,
  keyboardMapping,
  callbacks,
  className = '',
}: ImageViewerProps) {
  const imageSource = container;
  const { images = [], isLoading, error } = useImages(imageSource);
  const [loading, setLoading] = useState(true);

  const { currentIndex, dispatch, settings } = useViewerActions({
    images,
    initialIndex,
    userSettings: userSettings,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const currentImage = images[currentIndex];

  // コントロールの表示管理
  const { isVisible: controlsVisible, handleMouseMove } = useControlsVisibility(
    settings.showControls,
    settings.autoHideControls,
    settings.controlsTimeout,
  );

  // キーボードマッピングの拡張
  // 画像数やコールバックの都合でonActionだけ差し替えたい場合は、親でKeyboardMappingを生成して渡す設計にする
  useKeyboardHandler(keyboardMapping, containerRef);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ backgroundColor: settings.backgroundColor }}
      >
        <div className="text-foreground text-lg">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ backgroundColor: settings.backgroundColor }}
      >
        <div className="text-destructive text-lg">{String(error)}</div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ backgroundColor: settings.backgroundColor }}
      >
        <div className="text-lg text-muted-foreground">
          画像が選択されていません
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      role="application"
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      tabIndex={-1}
    >
      <ImageDisplay
        image={currentImage}
        settings={settings}
        onLoad={() => callbacks?.onImageLoad?.(currentImage)}
        onError={(error) => callbacks?.onImageError?.(error, currentImage)}
        className="h-full w-full pb-24"
        transitionType="fade"
      />

      <ViewerControls
        currentIndex={currentIndex}
        totalImages={images.length}
        zoom={settings.zoom}
        onPrevious={() => dispatch('previousImage')}
        onNext={() => dispatch('nextImage')}
        onZoomIn={() => dispatch('zoomIn')}
        onZoomOut={() => dispatch('zoomOut')}
        onResetZoom={() => dispatch('resetZoom')}
        isVisible={controlsVisible}
      />
    </div>
  );
}
