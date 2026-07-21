'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import type {
  ImageViewerProps,
  ViewerSettings,
} from '@/features/image-viewer/types/viewerTypes';
import { useImages } from '@/shared/hooks/data/useImages';
import { useControlsVisibility } from '../hooks/useControlsVisibility';
import { useKeyboardHandler } from '../hooks/useKeyboardHandler';
import { ImageDisplay } from './ImageDisplay';
import { ViewerControls } from './ViewerControls';

const defaultSettings: ViewerSettings = {
  fitMode: 'both',
  zoom: 1,
  rotation: 0,
  backgroundColor: '#1a1a1a',
  showControls: true,
  autoHideControls: true,
  controlsTimeout: 3000,
};

export function ImageViewer({
  container,
  initialIndex = 0,
  settings: userSettings,
  keyboardMapping,
  callbacks,
  className = '',
}: ImageViewerProps) {
  const mergedSettings = {
    ...defaultSettings,
    ...userSettings,
  };

  const imageSource = container;
  const { images = [], isLoading, error } = useImages(imageSource);
  const [loading, setLoading] = useState(true);

  // 重い処理（ズーム）を非ブロッキングで実行、軽量操作（画像切り替え）には使用しない
  const [, startTransition] = useTransition();

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [settings, setSettings] = useState<ViewerSettings>(mergedSettings);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentImage = images[currentIndex];

  // コントロールの表示管理
  const { isVisible: controlsVisible, handleMouseMove } = useControlsVisibility(
    settings.showControls,
    settings.autoHideControls,
    settings.controlsTimeout,
  );

  const goToNext = () => {
    if (currentIndex >= images.length - 1) return;

    setCurrentIndex((prev) => {
      const newIndex = prev + 1;
      callbacks?.onImageChange?.(newIndex, images[newIndex]);
      return newIndex;
    });
  };

  const goToPrevious = () => {
    if (currentIndex <= 0) return;

    setCurrentIndex((prev) => {
      const newIndex = prev - 1;
      callbacks?.onImageChange?.(newIndex, images[newIndex]);
      return newIndex;
    });
  };

  const zoomIn = () => {
    const currentZoom = settings.zoom;
    if (currentZoom >= 5) return;

    startTransition(() => {
      setSettings((prev) => {
        const newZoom = Math.min(prev.zoom * 1.2, 5);
        callbacks?.onZoomChange?.(newZoom);
        return { ...prev, zoom: newZoom };
      });
    });
  };

  const zoomOut = () => {
    const currentZoom = settings.zoom;
    if (currentZoom <= 0.1) return;

    startTransition(() => {
      setSettings((prev) => {
        const newZoom = Math.max(prev.zoom / 1.2, 0.1);
        callbacks?.onZoomChange?.(newZoom);
        return { ...prev, zoom: newZoom };
      });
    });
  };

  const resetZoom = () => {
    if (settings.zoom === 1) return;

    startTransition(() => {
      setSettings((prev) => {
        callbacks?.onZoomChange?.(1);
        return { ...prev, zoom: 1 };
      });
    });
  };

  // キーボードマッピングの拡張
  // 画像数やコールバックの都合でonActionだけ差し替えたい場合は、親でKeyboardMappingを生成して渡す設計にする
  useKeyboardHandler(keyboardMapping, containerRef);

  // 外部からの設定変更を反映
  useEffect(() => {
    setSettings((prev) => ({ ...prev, ...userSettings }));
  }, [userSettings]);

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
        onPrevious={goToPrevious}
        onNext={goToNext}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
        isVisible={controlsVisible}
      />
    </div>
  );
}
