'use client';

import {
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import type { ImageContainer } from '@/features/image-viewer/types/ImageContainer';
import type { ImageSource } from '@/features/image-viewer/types/ImageSource';
import type {
  ActionType,
  KeyboardMapping,
  ViewerSettings,
} from '@/features/image-viewer/types/viewerTypes';
import { useImages } from '@/shared/hooks/data/useImages';
import {
  createCustomKeyboardMapping,
  createDefaultKeyboardMapping,
} from '@/shared/utils/keyboardUtils';
import { useControlsVisibility } from '../hooks/useControlsVisibility';
import { useKeyboardHandler } from '../hooks/useKeyboardHandler';
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
    onImageChange?: (index: number, image: ImageSource) => void;
    onZoomChange?: (zoom: number) => void;
    onRotationChange?: (rotation: number) => void;
    onSettingsChange?: (settings: Partial<ViewerSettings>) => void;
    onCustomAction?: (action: string, event: KeyboardEvent) => void;
    onImageLoad?: (image: ImageSource) => void;
    onImageError?: (error: Error, image: ImageSource) => void;
  };
  className?: string;
}

const defaultSettings: ViewerSettings = {
  fitMode: 'both',
  zoom: 1,
  rotation: 0,
  backgroundColor: 'var(--viewer-bg, oklch(0.13 0 0))',
  showControls: true,
  autoHideControls: true,
  controlsTimeout: 1200,
};

const stageLabelClass = 'text-lg text-white/55';

export function ImageViewer({
  container,
  initialIndex = 0,
  settings: userSettings,
  keyboardMapping: keyboardMappingProp,
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

  const [, startTransition] = useTransition();

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [settings, setSettings] = useState<ViewerSettings>(mergedSettings);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentImage = images[currentIndex];

  const {
    isVisible: hudVisible,
    handleMouseMove,
    reveal,
  } = useControlsVisibility(
    settings.showControls,
    settings.autoHideControls,
    settings.controlsTimeout,
  );

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev >= images.length - 1) return prev;
      const newIndex = prev + 1;
      callbacks?.onImageChange?.(newIndex, images[newIndex]);
      return newIndex;
    });
    reveal();
  }, [images, callbacks, reveal]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev <= 0) return prev;
      const newIndex = prev - 1;
      callbacks?.onImageChange?.(newIndex, images[newIndex]);
      return newIndex;
    });
    reveal();
  }, [images, callbacks, reveal]);

  const zoomIn = useCallback(() => {
    startTransition(() => {
      setSettings((prev) => {
        if (prev.zoom >= 5) return prev;
        const newZoom = Math.min(prev.zoom * 1.2, 5);
        callbacks?.onZoomChange?.(newZoom);
        return { ...prev, zoom: newZoom };
      });
    });
  }, [callbacks]);

  const zoomOut = useCallback(() => {
    startTransition(() => {
      setSettings((prev) => {
        if (prev.zoom <= 0.1) return prev;
        const newZoom = Math.max(prev.zoom / 1.2, 0.1);
        callbacks?.onZoomChange?.(newZoom);
        return { ...prev, zoom: newZoom };
      });
    });
  }, [callbacks]);

  const resetZoom = useCallback(() => {
    startTransition(() => {
      setSettings((prev) => {
        if (prev.zoom === 1) return prev;
        callbacks?.onZoomChange?.(1);
        return { ...prev, zoom: 1 };
      });
    });
  }, [callbacks]);

  const goToFirst = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev === 0 || images.length === 0) return prev;
      callbacks?.onImageChange?.(0, images[0]);
      return 0;
    });
    reveal();
  }, [images, callbacks, reveal]);

  const goToLast = useCallback(() => {
    setCurrentIndex((prev) => {
      const last = images.length - 1;
      if (last < 0 || prev === last) return prev;
      callbacks?.onImageChange?.(last, images[last]);
      return last;
    });
    reveal();
  }, [images, callbacks, reveal]);

  const handleAction = useCallback(
    (action: ActionType, event: KeyboardEvent) => {
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
        default:
          callbacks?.onCustomAction?.(action, event);
      }
    },
    [
      goToNext,
      goToPrevious,
      goToFirst,
      goToLast,
      zoomIn,
      zoomOut,
      resetZoom,
      callbacks,
    ],
  );

  const builtInMapping = useMemo(() => {
    const base = createDefaultKeyboardMapping(handleAction);
    return createCustomKeyboardMapping(
      {
        nextImage: [
          { key: 'ArrowLeft', description: '次の画像', preventDefault: true },
          {
            key: ' ',
            description: '次の画像（スペース）',
            preventDefault: true,
          },
          { key: 'j', description: '次の画像', preventDefault: true },
        ],
        previousImage: [
          { key: 'ArrowRight', description: '前の画像', preventDefault: true },
          { key: 'k', description: '前の画像', preventDefault: true },
        ],
        zoomIn: [
          { key: '+', description: 'ズームイン', preventDefault: true },
          { key: '=', description: 'ズームイン', preventDefault: true },
        ],
        zoomOut: [
          { key: '-', description: 'ズームアウト', preventDefault: true },
        ],
        resetZoom: [
          { key: '0', description: 'ズームリセット', preventDefault: true },
        ],
      },
      handleAction,
      base,
    );
  }, [handleAction]);

  const keyboardMapping = keyboardMappingProp ?? builtInMapping;

  useKeyboardHandler(keyboardMapping, containerRef);

  const handleStageClick = (event: MouseEvent<HTMLDivElement>) => {
    if (images.length === 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    if (x < rect.width / 2) {
      goToNext();
    } else {
      goToPrevious();
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (event.deltaY > 0) {
        goToNext();
      } else if (event.deltaY < 0) {
        goToPrevious();
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, [goToNext, goToPrevious]);

  useEffect(() => {
    setSettings((prev) => ({ ...prev, ...userSettings }));
  }, [userSettings]);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  let stageBody: ReactNode;
  if (loading) {
    stageBody = <div className={stageLabelClass}>読み込み中...</div>;
  } else if (error) {
    stageBody = <div className="text-destructive text-lg">{String(error)}</div>;
  } else if (images.length === 0 || !currentImage) {
    stageBody = <div className={stageLabelClass}>画像が選択されていません</div>;
  } else {
    stageBody = (
      <>
        <ImageDisplay
          image={currentImage}
          settings={settings}
          onLoad={() => callbacks?.onImageLoad?.(currentImage)}
          onError={(err) => callbacks?.onImageError?.(err, currentImage)}
          className="h-full w-full"
          transitionType="fade"
        />
        <ViewerControls
          currentIndex={currentIndex}
          totalImages={images.length}
          isVisible={hudVisible}
        />
      </>
    );
  }

  return (
    <div
      ref={containerRef}
      role="application"
      className={`relative flex h-full w-full items-center justify-center ${className}`}
      style={{ backgroundColor: settings.backgroundColor }}
      onMouseMove={handleMouseMove}
      onClick={handleStageClick}
      onKeyDown={() => {
        containerRef.current?.focus();
      }}
      tabIndex={-1}
    >
      {stageBody}
    </div>
  );
}
