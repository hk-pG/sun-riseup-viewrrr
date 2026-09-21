'use client';

import { useEffect, useRef, useState } from 'react';
import type { ImageContainer } from '@/features/image-viewer/types/ImageContainer';
import type { ImageSource } from '@/features/image-viewer/types/ImageSource';
import type { ViewerSettings } from '@/features/image-viewer/types/viewerTypes';
import { useImages } from '@/shared/hooks/data/useImages';
import { useControlsVisibility } from '../hooks/useControlsVisibility';
import { useKeyboardHandler } from '../hooks/useKeyboardHandler';
import { useViewerActions } from '../hooks/useViewerActions';
import { createDefaultKeyboardMapping } from '../keyboard/keyboardUtils';
import { ImageDisplay } from './ImageDisplay';
import { ViewerControls } from './ViewerControls';

/**
 * ImageViewerProps: 画像コンテナを受け取り、その中の画像を表示するビューアのprops
 */
export interface ImageViewerProps {
  container?: ImageContainer;
  initialIndex?: number;
  settings?: Partial<ViewerSettings>;
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
  callbacks,
  className = '',
}: ImageViewerProps) {
  const { images = [], isLoading, error } = useImages(container);
  const [loading, setLoading] = useState(true);

  const { currentIndex, dispatch, settings } = useViewerActions({
    images,
    initialIndex,
    userSettings,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const currentImage = images[currentIndex];

  // コントロールの表示管理
  const { isVisible: controlsVisible, handleMouseMove } = useControlsVisibility(
    settings.showControls,
    settings.autoHideControls,
    settings.controlsTimeout,
  );

  const defaultKeyboardMapping = createDefaultKeyboardMapping(
    (action, _event) => {
      dispatch(action);
    },
  );
  // キーボードマッピングの拡張
  // 画像数やコールバックの都合でonActionだけ差し替えたい場合は、親でKeyboardMappingを生成して渡す設計にする
  useKeyboardHandler(defaultKeyboardMapping, containerRef);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  // キーボードショートカットが使えるようにcontainerへfocus
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, []);

  return (
    <div
      ref={containerRef}
      role="application"
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      tabIndex={-1}
      onPointerDown={() => {
        // 再レンダリングを伴わない操作でフォーカスが外れた後、
        // 再度ビューアをクリックした時にフォーカスが当たるようにする
        if (containerRef.current) {
          containerRef.current.focus();
        }
      }}
    >
      {loading ? (
        <div
          className={`flex items-center justify-center ${className}`}
          style={{ backgroundColor: settings.backgroundColor }}
        >
          <div className="text-foreground text-lg">読み込み中...</div>
        </div>
      ) : error ? (
        <div
          className={`flex items-center justify-center ${className}`}
          style={{ backgroundColor: settings.backgroundColor }}
        >
          <div className="text-destructive text-lg">{String(error)}</div>
        </div>
      ) : images.length === 0 ? (
        <div
          className={`flex items-center justify-center ${className}`}
          style={{ backgroundColor: settings.backgroundColor }}
        >
          <div className="text-lg text-muted-foreground">
            画像が選択されていません
          </div>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
