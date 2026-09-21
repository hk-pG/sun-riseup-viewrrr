import { useState, useTransition } from 'react';
import type { ImageSource } from '../types/ImageSource';
import type { ActionType, ViewerSettings } from '../types/viewerTypes';

const defaultSettings: ViewerSettings = {
  fitMode: 'both',
  zoom: 1,
  rotation: 0,
  backgroundColor: '#1a1a1a',
  showControls: true,
  autoHideControls: true,
  controlsTimeout: 3000,
};

export function useViewerActions({
  images,
  initialIndex,
  userSettings = {},
}: {
  images: ImageSource[];
  initialIndex: number;
  userSettings?: Partial<ViewerSettings>;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [settings, setSettings] = useState<ViewerSettings>({
    ...defaultSettings,
    ...userSettings,
  });

  // 重い処理（ズーム）を非ブロッキングで実行、軽量操作（画像切り替え）には使用しない
  const [, startTransition] = useTransition();

  const goToNext = () => {
    if (currentIndex >= images.length - 1) return;

    setCurrentIndex((prev) => {
      const newIndex = prev + 1;
      return newIndex;
    });
  };

  const goToPrevious = () => {
    if (currentIndex <= 0) return;

    setCurrentIndex((prev) => {
      const newIndex = prev - 1;
      return newIndex;
    });
  };

  const zoomIn = () => {
    const currentZoom = settings.zoom;
    if (currentZoom >= 5) return;

    startTransition(() => {
      setSettings((prev) => {
        const newZoom = Math.min(prev.zoom * 1.2, 5);
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
        return { ...prev, zoom: newZoom };
      });
    });
  };

  const resetZoom = () => {
    if (settings.zoom === 1) return;

    startTransition(() => {
      setSettings((prev) => {
        return { ...prev, zoom: 1 };
      });
    });
  };

  const dispatch = (action: ActionType) => {
    switch (action) {
      case 'nextImage':
        goToNext();
        break;
      case 'previousImage':
        goToPrevious();
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
      case 'rotateLeft':
        break;
      case 'rotateRight':
        break;
      case 'toggleFullscreen':
        break;
      case 'firstImage':
      case 'lastImage':
        break;
      case 'toggleControls':
        break;
      case 'toggleFitMode':
        break;
      case 'resetRotation':
        break;
    }
  };

  return { dispatch, currentIndex, settings };
}
