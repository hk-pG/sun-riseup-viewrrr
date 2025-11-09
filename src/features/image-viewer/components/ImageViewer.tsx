'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import type { ImageSource } from '@/features/image-viewer/types/ImageSource';
import type {
  KeyboardMapping,
  ViewerSettings,
} from '@/features/image-viewer/types/viewerTypes';
import { useImages } from '@/shared/hooks/data/useImages';
import { useControlsVisibility } from '../hooks/useControlsVisibility';
import { useKeyboardHandler } from '../hooks/useKeyboardHandler';
import { ImageDisplay } from './ImageDisplay';
import { ViewerControls } from './ViewerControls';

/**
 * ImageViewerProps: フォルダパスを受け取り、その中の画像を表示するビューアのprops
 */
export interface ImageViewerProps {
  folderPath: string;
  initialIndex?: number;
  settings?: Partial<ViewerSettings>;
  keyboardMapping?: KeyboardMapping;
  callbacks?: {
    onImageChange?: (index: number, image: ImageSource) => void;
    onZoomChange?: (zoom: number) => void;
    onRotationChange?: (rotation: number) => void;
    onSettingsChange?: (settings: Partial<ViewerSettings>) => void;
    onCustomAction?: (action: string, event: KeyboardEvent) => void;
    onImageLoad?: (image: ImageSource) => void;
    onImageError?: (error: Error, image: ImageSource) => void;
  };
  className?: string;
  style?: React.CSSProperties;
}

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
  folderPath,
  initialIndex = 0,
  settings: userSettings,
  keyboardMapping,
  callbacks,
  className = '',
  style,
}: ImageViewerProps) {
  const mergedSettings = {
    ...defaultSettings,
    ...userSettings,
  };

  const { images = [], isLoading, error } = useImages(folderPath);
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
        style={{ backgroundColor: settings.backgroundColor, ...style }}
      >
        <div className="text-foreground text-lg">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ backgroundColor: settings.backgroundColor, ...style }}
      >
        <div className="text-destructive text-lg">{String(error)}</div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ backgroundColor: settings.backgroundColor, ...style }}
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
      style={style}
      onMouseMove={handleMouseMove}
      tabIndex={-1}
    >
      <ImageDisplay
        image={currentImage}
        settings={settings}
        onLoad={() => callbacks?.onImageLoad?.(currentImage)}
        onError={(error) => callbacks?.onImageError?.(error, currentImage)}
        className="h-full w-full"
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
