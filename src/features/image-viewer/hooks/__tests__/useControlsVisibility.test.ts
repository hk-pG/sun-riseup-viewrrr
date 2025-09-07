import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useControlsVisibility } from '../useControlsVisibility';

describe('useControlsVisibility', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('core functionality', () => {
    describe('auto-hide behavior and timeout management', () => {
      it('should initialize with showControls value', () => {
        const { result } = renderHook(() =>
          useControlsVisibility(true, false, 3000),
        );

        expect(result.current.isVisible).toBe(true);
      });

      it('should initialize with showControls false', () => {
        const { result } = renderHook(() =>
          useControlsVisibility(false, false, 3000),
        );

        expect(result.current.isVisible).toBe(false);
      });

      it('should set timeout when autoHide is enabled and showControls is true', () => {
        const { result } = renderHook(() =>
          useControlsVisibility(true, true, 3000),
        );

        expect(result.current.isVisible).toBe(true);

        // Fast-forward time to trigger timeout
        act(() => {
          vi.advanceTimersByTime(3000);
        });

        expect(result.current.isVisible).toBe(false);
      });

      it('should not set timeout when autoHide is disabled', () => {
        const { result } = renderHook(() =>
          useControlsVisibility(true, false, 3000),
        );

        expect(result.current.isVisible).toBe(true);

        // Fast-forward time - should remain visible
        act(() => {
          vi.advanceTimersByTime(3000);
        });

        expect(result.current.isVisible).toBe(true);
      });

      it('should not set timeout when timeout is 0', () => {
        const { result } = renderHook(() =>
          useControlsVisibility(true, true, 0),
        );

        expect(result.current.isVisible).toBe(true);

        // Fast-forward time - should remain visible
        act(() => {
          vi.advanceTimersByTime(5000);
        });

        expect(result.current.isVisible).toBe(true);
      });

      it('should not set timeout when timeout is negative', () => {
        const { result } = renderHook(() =>
          useControlsVisibility(true, true, -1000),
        );

        expect(result.current.isVisible).toBe(true);

        // Fast-forward time - should remain visible
        act(() => {
          vi.advanceTimersByTime(5000);
        });

        expect(result.current.isVisible).toBe(true);
      });

      it('should clear existing timeout when setting new timeout', () => {
        const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

        const { result } = renderHook(() =>
          useControlsVisibility(true, true, 3000),
        );

        // Trigger mouse move to reset timeout
        act(() => {
          result.current.handleMouseMove();
        });

        expect(clearTimeoutSpy).toHaveBeenCalled();
      });
    });

    describe('mouse movement handling and visibility state updates', () => {
      it('should show controls and reset timeout on mouse move when autoHide is enabled', () => {
        const { result } = renderHook(() =>
          useControlsVisibility(false, true, 3000),
        );

        expect(result.current.isVisible).toBe(false);

        // Trigger mouse move
        act(() => {
          result.current.handleMouseMove();
        });

        expect(result.current.isVisible).toBe(true);

        // Verify timeout is set by advancing time
        act(() => {
          vi.advanceTimersByTime(3000);
        });

        expect(result.current.isVisible).toBe(false);
      });

      it('should not change visibility on mouse move when autoHide is disabled', () => {
        const { result } = renderHook(() =>
          useControlsVisibility(false, false, 3000),
        );

        expect(result.current.isVisible).toBe(false);

        // Trigger mouse move
        act(() => {
          result.current.handleMouseMove();
        });

        expect(result.current.isVisible).toBe(false);
      });

      it('should reset timeout on multiple mouse moves', () => {
        const { result } = renderHook(() =>
          useControlsVisibility(true, true, 3000),
        );

        expect(result.current.isVisible).toBe(true);

        // First mouse move
        act(() => {
          result.current.handleMouseMove();
        });

        // Advance time partially
        act(() => {
          vi.advanceTimersByTime(1500);
        });

        expect(result.current.isVisible).toBe(true);

        // Second mouse move should reset timeout
        act(() => {
          result.current.handleMouseMove();
        });

        // Advance time by original partial amount - should still be visible
        act(() => {
          vi.advanceTimersByTime(1500);
        });

        expect(result.current.isVisible).toBe(true);

        // Advance remaining time to complete new timeout
        act(() => {
          vi.advanceTimersByTime(1500);
        });

        expect(result.current.isVisible).toBe(false);
      });
    });

    describe('showControls setting behavior and overrides', () => {
      it('should update visibility when showControls changes from false to true', () => {
        const { result, rerender } = renderHook(
          ({ showControls, autoHide, timeout }) =>
            useControlsVisibility(showControls, autoHide, timeout),
          {
            initialProps: {
              showControls: false,
              autoHide: true,
              timeout: 3000,
            },
          },
        );

        expect(result.current.isVisible).toBe(false);

        rerender({ showControls: true, autoHide: true, timeout: 3000 });

        expect(result.current.isVisible).toBe(true);
      });

      it('should update visibility when showControls changes from true to false', () => {
        const { result, rerender } = renderHook(
          ({ showControls, autoHide, timeout }) =>
            useControlsVisibility(showControls, autoHide, timeout),
          {
            initialProps: { showControls: true, autoHide: true, timeout: 3000 },
          },
        );

        expect(result.current.isVisible).toBe(true);

        rerender({ showControls: false, autoHide: true, timeout: 3000 });

        expect(result.current.isVisible).toBe(false);
      });

      it('should set timeout when showControls becomes true and autoHide is enabled', () => {
        const { result, rerender } = renderHook(
          ({ showControls, autoHide, timeout }) =>
            useControlsVisibility(showControls, autoHide, timeout),
          {
            initialProps: {
              showControls: false,
              autoHide: true,
              timeout: 3000,
            },
          },
        );

        rerender({ showControls: true, autoHide: true, timeout: 3000 });

        expect(result.current.isVisible).toBe(true);

        // Advance time to trigger timeout
        act(() => {
          vi.advanceTimersByTime(3000);
        });

        expect(result.current.isVisible).toBe(false);
      });

      it('should not set timeout when showControls becomes true but autoHide is disabled', () => {
        const { result, rerender } = renderHook(
          ({ showControls, autoHide, timeout }) =>
            useControlsVisibility(showControls, autoHide, timeout),
          {
            initialProps: {
              showControls: false,
              autoHide: false,
              timeout: 3000,
            },
          },
        );

        rerender({ showControls: true, autoHide: false, timeout: 3000 });

        expect(result.current.isVisible).toBe(true);

        // Advance time - should remain visible
        act(() => {
          vi.advanceTimersByTime(3000);
        });

        expect(result.current.isVisible).toBe(true);
      });
    });
  });

  describe('cleanup and settings changes', () => {
    describe('timeout cleanup on component unmount', () => {
      it('should clear timeout when component unmounts', () => {
        const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

        const { result, unmount } = renderHook(() =>
          useControlsVisibility(true, true, 3000),
        );

        expect(result.current.isVisible).toBe(true);

        unmount();

        expect(clearTimeoutSpy).toHaveBeenCalled();
      });

      it('should clear timeout when component unmounts even if no timeout was set', () => {
        vi.spyOn(global, 'clearTimeout');

        const { unmount } = renderHook(() =>
          useControlsVisibility(true, false, 3000),
        );

        unmount();

        // Should not throw error even if no timeout was set
        expect(() => unmount()).not.toThrow();
      });

      it('should prevent timeout execution after unmount', () => {
        const { result, unmount } = renderHook(() =>
          useControlsVisibility(true, true, 3000),
        );

        expect(result.current.isVisible).toBe(true);

        unmount();

        // Advance time after unmount - should not cause errors
        expect(() => {
          act(() => {
            vi.advanceTimersByTime(3000);
          });
        }).not.toThrow();
      });
    });

    describe('settings change handling and behavior updates', () => {
      it('should update timeout when timeout value changes', () => {
        const { result, rerender } = renderHook(
          ({ showControls, autoHide, timeout }) =>
            useControlsVisibility(showControls, autoHide, timeout),
          {
            initialProps: { showControls: true, autoHide: true, timeout: 3000 },
          },
        );

        expect(result.current.isVisible).toBe(true);

        // Change timeout value
        rerender({ showControls: true, autoHide: true, timeout: 1000 });

        // Advance by new timeout value
        act(() => {
          vi.advanceTimersByTime(1000);
        });

        expect(result.current.isVisible).toBe(false);
      });

      it('should handle autoHide changes from true to false (existing timeout still executes)', () => {
        const { result, rerender } = renderHook(
          ({ showControls, autoHide, timeout }) =>
            useControlsVisibility(showControls, autoHide, timeout),
          {
            initialProps: { showControls: true, autoHide: true, timeout: 3000 },
          },
        );

        expect(result.current.isVisible).toBe(true);

        // Change autoHide to false - but existing timeout is not cleared
        rerender({ showControls: true, autoHide: false, timeout: 3000 });

        // The visibility should still be true initially
        expect(result.current.isVisible).toBe(true);

        // The existing timeout will still execute and hide the controls
        // This documents the current behavior (which may be a bug)
        act(() => {
          vi.advanceTimersByTime(3000);
        });

        expect(result.current.isVisible).toBe(false);
      });

      it('should set timeout when autoHide changes from false to true', () => {
        const { result, rerender } = renderHook(
          ({ showControls, autoHide, timeout }) =>
            useControlsVisibility(showControls, autoHide, timeout),
          {
            initialProps: {
              showControls: true,
              autoHide: false,
              timeout: 3000,
            },
          },
        );

        expect(result.current.isVisible).toBe(true);

        rerender({ showControls: true, autoHide: true, timeout: 3000 });

        // Advance time to trigger timeout
        act(() => {
          vi.advanceTimersByTime(3000);
        });

        expect(result.current.isVisible).toBe(false);
      });

      it('should handle multiple setting changes correctly', () => {
        const { result, rerender } = renderHook(
          ({ showControls, autoHide, timeout }) =>
            useControlsVisibility(showControls, autoHide, timeout),
          {
            initialProps: {
              showControls: false,
              autoHide: false,
              timeout: 3000,
            },
          },
        );

        expect(result.current.isVisible).toBe(false);

        // Change showControls to true
        rerender({ showControls: true, autoHide: false, timeout: 3000 });
        expect(result.current.isVisible).toBe(true);

        // Enable autoHide
        rerender({ showControls: true, autoHide: true, timeout: 3000 });
        expect(result.current.isVisible).toBe(true);

        // Change timeout
        rerender({ showControls: true, autoHide: true, timeout: 1000 });

        // Advance by new timeout
        act(() => {
          vi.advanceTimersByTime(1000);
        });

        expect(result.current.isVisible).toBe(false);
      });
    });

    describe('edge cases with rapid setting changes', () => {
      it('should handle rapid showControls changes', () => {
        const { result, rerender } = renderHook(
          ({ showControls, autoHide, timeout }) =>
            useControlsVisibility(showControls, autoHide, timeout),
          {
            initialProps: { showControls: true, autoHide: true, timeout: 3000 },
          },
        );

        expect(result.current.isVisible).toBe(true);

        // Rapid changes
        rerender({ showControls: false, autoHide: true, timeout: 3000 });
        expect(result.current.isVisible).toBe(false);

        rerender({ showControls: true, autoHide: true, timeout: 3000 });
        expect(result.current.isVisible).toBe(true);

        rerender({ showControls: false, autoHide: true, timeout: 3000 });
        expect(result.current.isVisible).toBe(false);

        rerender({ showControls: true, autoHide: true, timeout: 3000 });
        expect(result.current.isVisible).toBe(true);
      });

      it('should handle rapid autoHide changes', () => {
        const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

        const { result, rerender } = renderHook(
          ({ showControls, autoHide, timeout }) =>
            useControlsVisibility(showControls, autoHide, timeout),
          {
            initialProps: { showControls: true, autoHide: true, timeout: 3000 },
          },
        );

        expect(result.current.isVisible).toBe(true);

        // Rapid autoHide changes
        rerender({ showControls: true, autoHide: false, timeout: 3000 });
        rerender({ showControls: true, autoHide: true, timeout: 3000 });
        rerender({ showControls: true, autoHide: false, timeout: 3000 });
        rerender({ showControls: true, autoHide: true, timeout: 3000 });

        expect(clearTimeoutSpy).toHaveBeenCalled();
        expect(result.current.isVisible).toBe(true);
      });

      it('should handle rapid timeout value changes', () => {
        const { result, rerender } = renderHook(
          ({ showControls, autoHide, timeout }) =>
            useControlsVisibility(showControls, autoHide, timeout),
          {
            initialProps: { showControls: true, autoHide: true, timeout: 5000 },
          },
        );

        expect(result.current.isVisible).toBe(true);

        // Rapid timeout changes
        rerender({ showControls: true, autoHide: true, timeout: 1000 });
        rerender({ showControls: true, autoHide: true, timeout: 2000 });
        rerender({ showControls: true, autoHide: true, timeout: 500 });

        // Advance by final timeout value
        act(() => {
          vi.advanceTimersByTime(500);
        });

        expect(result.current.isVisible).toBe(false);
      });

      it('should handle rapid mouse moves during setting changes', () => {
        const { result, rerender } = renderHook(
          ({ showControls, autoHide, timeout }) =>
            useControlsVisibility(showControls, autoHide, timeout),
          {
            initialProps: {
              showControls: false,
              autoHide: true,
              timeout: 3000,
            },
          },
        );

        expect(result.current.isVisible).toBe(false);

        // Mouse move
        act(() => {
          result.current.handleMouseMove();
        });
        expect(result.current.isVisible).toBe(true);

        // Change settings while timeout is active
        rerender({ showControls: true, autoHide: false, timeout: 3000 });

        // Another mouse move
        act(() => {
          result.current.handleMouseMove();
        });

        // Change back to autoHide
        rerender({ showControls: true, autoHide: true, timeout: 1000 });

        // Mouse move again
        act(() => {
          result.current.handleMouseMove();
        });

        expect(result.current.isVisible).toBe(true);

        // Advance by new timeout
        act(() => {
          vi.advanceTimersByTime(1000);
        });

        expect(result.current.isVisible).toBe(false);
      });

      it('should handle setting changes during active timeout', () => {
        const { result, rerender } = renderHook(
          ({ showControls, autoHide, timeout }) =>
            useControlsVisibility(showControls, autoHide, timeout),
          {
            initialProps: { showControls: true, autoHide: true, timeout: 3000 },
          },
        );

        expect(result.current.isVisible).toBe(true);

        // Advance time partially
        act(() => {
          vi.advanceTimersByTime(1500);
        });

        expect(result.current.isVisible).toBe(true);

        // Change timeout while active
        rerender({ showControls: true, autoHide: true, timeout: 1000 });

        // Advance by new timeout value
        act(() => {
          vi.advanceTimersByTime(1000);
        });

        expect(result.current.isVisible).toBe(false);
      });
    });
  });
});
