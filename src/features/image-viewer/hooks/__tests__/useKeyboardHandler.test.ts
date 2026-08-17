import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  ActionType,
  KeyboardMapping,
  KeyboardShortcut,
} from '../../types/viewerTypes';
import { useKeyboardHandler } from '../useKeyboardHandler';

describe('useKeyboardHandler', () => {
  let mockContainer: HTMLDivElement;
  let mockContainerRef: React.RefObject<HTMLDivElement>;
  let mockOnAction =
    vi.fn<(action: ActionType, event: KeyboardEvent) => void>();
  let mockKeyboardMapping: KeyboardMapping;

  beforeEach(() => {
    mockContainer = document.createElement('div');
    mockContainerRef = { current: mockContainer };
    mockOnAction = vi.fn<(action: ActionType, event: KeyboardEvent) => void>();

    mockKeyboardMapping = {
      shortcuts: new Map([
        [
          'nextImage',
          [
            {
              key: 'ArrowRight',
              description: 'Next image',
              preventDefault: true,
            },
          ],
        ],
        [
          'previousImage',
          [
            {
              key: 'ArrowLeft',
              description: 'Previous image',
              preventDefault: true,
            },
          ],
        ],
        [
          'zoomIn',
          [
            {
              key: '+',
              ctrlKey: true,
              description: 'Zoom in',
              preventDefault: true,
            },
          ],
        ],
        [
          'toggleControls',
          [
            {
              key: 'c',
              preventDefault: false,
              description: 'Toggle controls',
            },
          ],
        ],
      ]),
      onAction: mockOnAction,
      enabled: true,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('keyboard event matching', () => {
    it('should match simple key events correctly', () => {
      renderHook(() =>
        useKeyboardHandler(mockKeyboardMapping, mockContainerRef),
      );

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      mockContainer.dispatchEvent(event);

      expect(mockOnAction).toHaveBeenCalledWith('nextImage', event);
    });

    it('should match key events with modifiers correctly', () => {
      renderHook(() =>
        useKeyboardHandler(mockKeyboardMapping, mockContainerRef),
      );

      const event = new KeyboardEvent('keydown', {
        key: '+',
        ctrlKey: true,
      });
      mockContainer.dispatchEvent(event);

      expect(mockOnAction).toHaveBeenCalledWith('zoomIn', event);
    });

    it('should not match when modifiers do not match', () => {
      renderHook(() =>
        useKeyboardHandler(mockKeyboardMapping, mockContainerRef),
      );

      const event = new KeyboardEvent('keydown', {
        key: '+',
        shiftKey: true, // Wrong modifier
      });
      mockContainer.dispatchEvent(event);

      expect(mockOnAction).not.toHaveBeenCalled();
    });

    it('should not match when key mapping is disabled', () => {
      const disabledMapping: KeyboardMapping = {
        ...mockKeyboardMapping,
        enabled: false,
      };

      renderHook(() => useKeyboardHandler(disabledMapping, mockContainerRef));

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      mockContainer.dispatchEvent(event);

      expect(mockOnAction).not.toHaveBeenCalled();
    });
  });

  describe('preventDefault behavior', () => {
    it('should call preventDefault by default', () => {
      renderHook(() =>
        useKeyboardHandler(mockKeyboardMapping, mockContainerRef),
      );

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      mockContainer.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(mockOnAction).toHaveBeenCalledWith('nextImage', event);
    });

    it('should not call preventDefault when explicitly set to false', () => {
      renderHook(() =>
        useKeyboardHandler(mockKeyboardMapping, mockContainerRef),
      );

      const event = new KeyboardEvent('keydown', { key: 'c' });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      mockContainer.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
      expect(mockOnAction).toHaveBeenCalledWith('toggleControls', event);
    });
  });

  describe('preventDefault behavior with multiple shortcuts for same action', () => {
    it('should call preventDefault based on the matched shortcut', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 'ArrowRight',
          description: 'Next with arrow',
          preventDefault: true,
        },
        { key: ' ', description: 'Next with space', preventDefault: false },
        { key: 'j', description: 'Next with j', preventDefault: true },
      ];

      const mappingWithMultiple: KeyboardMapping = {
        shortcuts: new Map([['nextImage', shortcuts]]),
        onAction: mockOnAction,
        enabled: true,
      };

      renderHook(() =>
        useKeyboardHandler(mappingWithMultiple, mockContainerRef),
      );

      // Test first shortcut
      const event1 = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      const preventDefaultSpy = vi.spyOn(event1, 'preventDefault');
      mockContainer.dispatchEvent(event1);
      expect(mockOnAction).toHaveBeenCalledWith('nextImage', event1);
      expect(preventDefaultSpy).toHaveBeenCalled();

      mockOnAction.mockClear();

      // Test second shortcut
      const event2 = new KeyboardEvent('keydown', { key: ' ' });
      const preventDefaultSpy2 = vi.spyOn(event2, 'preventDefault');
      mockContainer.dispatchEvent(event2);
      expect(mockOnAction).toHaveBeenCalledWith('nextImage', event2);
      // preventDefault should not be called for space key
      expect(preventDefaultSpy2).not.toHaveBeenCalled();

      mockOnAction.mockClear();

      // Test third shortcut
      const event3 = new KeyboardEvent('keydown', { key: 'j' });
      const preventDefaultSpy3 = vi.spyOn(event3, 'preventDefault');
      mockContainer.dispatchEvent(event3);
      expect(mockOnAction).toHaveBeenCalledWith('nextImage', event3);
      expect(preventDefaultSpy3).toHaveBeenCalled();
    });
  });

  describe('event listener management', () => {
    it('should add event listener when container is available', () => {
      const addEventListenerSpy = vi.spyOn(mockContainer, 'addEventListener');

      renderHook(() =>
        useKeyboardHandler(mockKeyboardMapping, mockContainerRef),
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function),
      );
    });

    it('should not add event listener when container is null', () => {
      const nullRef: React.RefObject<HTMLElement | null> = { current: null };

      renderHook(() => useKeyboardHandler(mockKeyboardMapping, nullRef));

      // No error should be thrown and no event listener should be added
      expect(() => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        document.dispatchEvent(event);
      }).not.toThrow();
    });

    it('should remove event listener on cleanup', () => {
      const removeEventListenerSpy = vi.spyOn(
        mockContainer,
        'removeEventListener',
      );

      const { unmount } = renderHook(() =>
        useKeyboardHandler(mockKeyboardMapping, mockContainerRef),
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function),
      );
    });

    it('should update event listener when keyboard mapping changes', () => {
      const addEventListenerSpy = vi.spyOn(mockContainer, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(
        mockContainer,
        'removeEventListener',
      );

      const { rerender } = renderHook(
        ({ mapping }) => useKeyboardHandler(mapping, mockContainerRef),
        { initialProps: { mapping: mockKeyboardMapping } },
      );

      expect(addEventListenerSpy).toHaveBeenCalledTimes(1);

      // Update the mapping
      const newMapping: KeyboardMapping = {
        ...mockKeyboardMapping,
        shortcuts: new Map([
          ['resetZoom', [{ key: 'n', description: 'Reset zoom' }]],
        ]),
      };

      rerender({ mapping: newMapping });

      // Should remove old listener and add new one
      expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);
      expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
    });

    it('should update event listener when container ref changes', () => {
      const addEventListenerSpy = vi.spyOn(mockContainer, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(
        mockContainer,
        'removeEventListener',
      );

      const { rerender } = renderHook(
        ({ containerRef }) =>
          useKeyboardHandler(mockKeyboardMapping, containerRef),
        { initialProps: { containerRef: mockContainerRef } },
      );

      expect(addEventListenerSpy).toHaveBeenCalledTimes(1);

      // Create new container and ref
      const newContainer = document.createElement('div');
      const newContainerRef = { current: newContainer };
      const newAddEventListenerSpy = vi.spyOn(newContainer, 'addEventListener');

      rerender({ containerRef: newContainerRef });

      // Should remove old listener and add new one
      expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);
      expect(newAddEventListenerSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('action execution', () => {
    it('should not execute action for unmatched keys', () => {
      renderHook(() =>
        useKeyboardHandler(mockKeyboardMapping, mockContainerRef),
      );

      const event = new KeyboardEvent('keydown', { key: 'UnmappedKey' });
      mockContainer.dispatchEvent(event);

      expect(mockOnAction).not.toHaveBeenCalled();
    });

    it('should handle undefined keyboard mapping gracefully', () => {
      renderHook(() => useKeyboardHandler(undefined, mockContainerRef));

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });

      expect(() => {
        mockContainer.dispatchEvent(event);
      }).not.toThrow();

      expect(mockOnAction).not.toHaveBeenCalled();
    });
  });
});
