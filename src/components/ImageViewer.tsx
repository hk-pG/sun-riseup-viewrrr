'use client';

import type { ImageViewerProps, ViewerSettings } from '@/types/viewerTypes';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
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

export const ImageViewer: React.FC<ImageViewerProps> = ({
  images,
  initialIndex = 0,
  settings: userSettings,
  keyboardMapping,
  callbacks,
  loading = false,
  error,
  className = '',
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [settings, setSettings] = useState<ViewerSettings>({
    ...defaultSettings,
    ...userSettings,
  });

  const currentImage = images[currentIndex];

  // コントロールの表示管理
  const { isVisible: controlsVisible, handleMouseMove } = useControlsVisibility(
    settings.showControls,
    settings.autoHideControls,
    settings.controlsTimeout,
  );

  // ナビゲーション関数
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => {
      const newIndex = Math.min(prev + 1, images.length - 1);
      if (newIndex !== prev && callbacks?.onImageChange) {
        callbacks.onImageChange(newIndex, images[newIndex]);
      }
      return newIndex;
    });
  }, [images, callbacks]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => {
      const newIndex = Math.max(prev - 1, 0);
      if (newIndex !== prev && callbacks?.onImageChange) {
        callbacks.onImageChange(newIndex, images[newIndex]);
      }
      return newIndex;
    });
  }, [images, callbacks]);

  const goToFirst = useCallback(() => {
    setCurrentIndex(0);
    if (callbacks?.onImageChange) {
      callbacks.onImageChange(0, images[0]);
    }
  }, [images, callbacks]);

  const goToLast = useCallback(() => {
    const lastIndex = images.length - 1;
    setCurrentIndex(lastIndex);
    if (callbacks?.onImageChange) {
      callbacks.onImageChange(lastIndex, images[lastIndex]);
    }
  }, [images, callbacks]);

  // ズーム・回転関数
  const zoomIn = useCallback(() => {
    setSettings((prev) => {
      const newZoom = Math.min(prev.zoom * 1.2, 5);
      callbacks?.onZoomChange?.(newZoom);
      return { ...prev, zoom: newZoom };
    });
  }, [callbacks]);

  const zoomOut = useCallback(() => {
    setSettings((prev) => {
      const newZoom = Math.max(prev.zoom / 1.2, 0.1);
      callbacks?.onZoomChange?.(newZoom);
      return { ...prev, zoom: newZoom };
    });
  }, [callbacks]);

  const resetZoom = useCallback(() => {
    setSettings((prev) => {
      callbacks?.onZoomChange?.(1);
      return { ...prev, zoom: 1 };
    });
  }, [callbacks]);

  const rotateRight = useCallback(() => {
    setSettings((prev) => {
      const newRotation = prev.rotation + 90;
      callbacks?.onRotationChange?.(newRotation);
      return { ...prev, rotation: newRotation };
    });
  }, [callbacks]);

  const rotateLeft = useCallback(() => {
    setSettings((prev) => {
      const newRotation = prev.rotation - 90;
      callbacks?.onRotationChange?.(newRotation);
      return { ...prev, rotation: newRotation };
    });
  }, [callbacks]);

  const resetRotation = useCallback(() => {
    setSettings((prev) => {
      callbacks?.onRotationChange?.(0);
      return { ...prev, rotation: 0 };
    });
  }, [callbacks]);

  // 設定変更関数
  const toggleControls = useCallback(() => {
    setSettings((prev) => {
      const newSettings = { ...prev, showControls: !prev.showControls };
      callbacks?.onSettingsChange?.(newSettings);
      return newSettings;
    });
  }, [callbacks]);

  const toggleFitMode = useCallback(() => {
    setSettings((prev) => {
      const modes = ['both', 'width', 'height', 'none'] as const;
      const currentIndex = modes.indexOf(prev.fitMode);
      const nextMode = modes[(currentIndex + 1) % modes.length];
      const newSettings = { ...prev, fitMode: nextMode };
      callbacks?.onSettingsChange?.(newSettings);
      return newSettings;
    });
  }, [callbacks]);

  // キーボードマッピングの拡張
  const extendedKeyboardMapping = keyboardMapping
    ? {
        ...keyboardMapping,
        onAction: (action: string, event: KeyboardEvent) => {
          switch (action) {
            case 'nextImage':
              goToNext();
              break;
            case 'previousImage':
              goToPrevious();
              break;
            case 'firstImage':
              goToFirst();
              break;
            case 'lastImage':
              goToLast();
              break;
            case 'zoomIn':
              zoomIn();
              break;
            case 'zoomOut':
              zoomOut();
              break;
            case 'resetZoom':
              resetZoom();
              break;
            case 'rotateRight':
              rotateRight();
              break;
            case 'rotateLeft':
              rotateLeft();
              break;
            case 'resetRotation':
              resetRotation();
              break;
            case 'toggleControls':
              toggleControls();
              break;
            case 'toggleFitMode':
              toggleFitMode();
              break;
            default:
              // カスタムアクションは元のハンドラーに委譲
              keyboardMapping.onAction(action, event);
              callbacks?.onCustomAction?.(action, event);
              break;
          }
        },
      }
    : undefined;

  // キーボードハンドラーの設定
  useKeyboardHandler(extendedKeyboardMapping, containerRef);

  // 外部からの設定変更を反映
  useEffect(() => {
    setSettings((prev) => ({ ...prev, ...userSettings }));
  }, [userSettings]);

  // インデックス変更を反映
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ backgroundColor: settings.backgroundColor, ...style }}
      >
        <div className="text-white text-lg">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ backgroundColor: settings.backgroundColor, ...style }}
      >
        <div className="text-red-400 text-lg">{error}</div>
      </div>
    );
  }

  if (!currentImage || images.length === 0) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ backgroundColor: settings.backgroundColor, ...style }}
      >
        <div className="text-gray-400 text-lg">画像が選択されていません</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={style}
      onMouseMove={handleMouseMove}
    >
      <ImageDisplay
        image={currentImage}
        settings={settings}
        onLoad={() => callbacks?.onImageLoad?.(currentImage)}
        onError={(error) => callbacks?.onImageError?.(error, currentImage)}
        className="w-full h-full"
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
};
