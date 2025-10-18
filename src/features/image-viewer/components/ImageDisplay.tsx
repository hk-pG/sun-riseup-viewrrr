'use client';

import { useCallback, useMemo } from 'react';
import type { ImageSource } from '../types/ImageSource';
import type { ViewerSettings } from '../types/viewerTypes';

export interface ImageDisplayProps {
  image: ImageSource;
  settings: ViewerSettings;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  style?: React.CSSProperties;
  transitionType?: 'fade' | 'none';
}

export function ImageDisplay({
  image,
  settings,
  onLoad,
  onError,
  className = '',
  style,
  transitionType = 'fade',
}: ImageDisplayProps) {
  const handleImageLoad = useCallback(() => {
    onLoad?.();
  }, [onLoad]);

  const handleImageError = useCallback(() => {
    onError?.(new Error('画像の読み込みに失敗しました'));
  }, [onError]);

  // 画像スタイルの計算
  const imageStyle = useMemo((): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      transform: `rotate(${settings.rotation}deg) scale(${settings.zoom})`,
      transformOrigin: 'center',
      transition: 'transform 0.2s ease-in-out',
    };

    switch (settings.fitMode) {
      case 'width':
        return { ...baseStyle, width: '100%', height: 'auto' };
      case 'height':
        return { ...baseStyle, height: '100%', width: 'auto' };
      case 'both':
        return { ...baseStyle, maxWidth: '100%', maxHeight: '100%' };
      default:
        return baseStyle;
    }
  }, [settings.rotation, settings.zoom, settings.fitMode]);

  return (
    <div
      className={`flex items-center justify-center overflow-hidden ${className}`}
      style={{ backgroundColor: settings.backgroundColor, ...style }}
    >
      <img
        src={image.assetUrl || '/placeholder.svg'}
        alt={image.name}
        style={imageStyle}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`select-none ${transitionType === 'fade' ? 'image-fade' : ''}`}
        draggable={false}
      />
    </div>
  );
}
