'use client';

import type { FileSystemService } from '@/service/FileSystemService';
import type { ImageSource } from '@/types/ImageSource';
import type { ViewerSettings } from '@/types/viewerTypes';
import type { KeyboardMapping } from '@/types/viewerTypes';
import { useCallback, useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import { LocalFolderContainer } from '../containers/LocalFolderContainer';
import { useServices } from '../context/ServiceContext';
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

const fetchImages = async (folderPath: string, fs: FileSystemService) => {
  const container = new LocalFolderContainer(folderPath, fs);
  return await container.listImages();
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
  const fs = useServices();
  const {
    data: images = [],
    isLoading,
    error,
  } = useSWR(
    folderPath ? ['images', folderPath] : null,
    () => fetchImages(folderPath, fs),
    { revalidateOnFocus: false },
  );
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [settings, setSettings] = useState<ViewerSettings>({
    ...defaultSettings,
    ...userSettings,
  });
  const containerRef = useRef<HTMLDivElement>(null);

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

  // キーボードマッピングの拡張
  // 画像数やコールバックの都合でonActionだけ差し替えたい場合は、親でKeyboardMappingを生成して渡す設計にする
  useKeyboardHandler(keyboardMapping, containerRef);

  // 外部からの設定変更を反映
  useEffect(() => {
    setSettings((prev) => ({ ...prev, ...userSettings }));
  }, [userSettings]);

  // インデックス変更を反映
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

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
        <div className="text-red-400 text-lg">{String(error)}</div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ backgroundColor: settings.backgroundColor, ...style }}
      >
        <div className="text-gray-400 text-lg">画像が選択されていません</div>
      </div>
    );
  }

  const currentImage = images[currentIndex];

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
}
