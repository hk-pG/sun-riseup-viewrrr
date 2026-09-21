import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useViewerActions } from '../useViewerActions';

describe('happy path', () => {
  it('ページのインデックス初期値が0であること', () => {
    // Arrange
    // Act
    const { result } = renderHook(() =>
      useViewerActions({ images: [], initialIndex: 0, userSettings: {} }),
    );
    // Assert
    expect(result.current.currentIndex).toBe(0);
  });

  it('次ページ操作で、インデックスの値が1増えること', () => {
    // Arrange
    const { result } = renderHook(() =>
      useViewerActions({
        images: [
          ...Array.from({ length: 10 }, (_, index) => ({
            id: `image${index}`,
            name: `image${index}`,
            assetUrl: `https://example.com/image${index}.jpg`,
          })),
        ],
        initialIndex: 0,
        userSettings: {},
      }),
    );
    // Act
    act(() => {
      result.current.dispatch('nextImage');
    });
    // Assert
    expect(result.current.currentIndex).toBe(1);
  });
});
