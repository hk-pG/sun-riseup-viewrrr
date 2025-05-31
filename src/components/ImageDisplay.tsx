'use client';

import type React from 'react';
import { useCallback } from 'react';
import type { ImageDisplayProps } from '../types/viewerTypes';

export const ImageDisplay: React.FC<ImageDisplayProps> = ({
  image,
  settings,
  onLoad,
  onError,
  className = '',
  style,
}) => {
  const handleImageLoad = useCallback(() => {
    onLoad?.();
  }, [onLoad]);

  const handleImageError = useCallback(() => {
    onError?.(new Error('画像の読み込みに失敗しました'));
  }, [onError]);

  const getImageStyle = (): React.CSSProperties => {
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
  };

  return (
    <div
      className={`flex items-center justify-center overflow-hidden ${className}`}
      style={{ backgroundColor: settings.backgroundColor, ...style }}
    >
      <img
        src={image.path || '/placeholder.svg'}
        alt={image.name}
        style={getImageStyle()}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className="select-none"
        draggable={false}
      />
    </div>
  );
};
