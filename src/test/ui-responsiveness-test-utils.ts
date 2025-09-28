/**
 * UI Responsiveness Test Utilities
 * Tools for testing smooth user interactions and performance
 * Ensures the app remains responsive during heavy operations
 */

import { act, renderHook } from '@testing-library/react';
import { startTransition } from 'react';

/**
 * Test helper for non-blocking UI updates
 * Ensures heavy operations don't freeze the interface
 */
export function testNonBlockingUpdate<T>(callback: () => T): Promise<T> {
  return new Promise((resolve, reject) => {
    let result: T;

    act(() => {
      startTransition(() => {
        try {
          result = callback();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
  });
}

/**
 * Test hook behavior with proper state synchronization
 * Prevents test flakiness from async state updates
 */
export function testHookBehavior<Result, Props>(
  hook: (props: Props) => Result,
  initialProps?: Props,
) {
  const result = renderHook(hook, { initialProps });

  return {
    ...result,
    actRerender: (props?: Props) => {
      act(() => {
        result.rerender(props);
      });
    },
    actUnmount: () => {
      act(() => {
        result.unmount();
      });
    },
  };
}

/**
 * User Experience Performance Tracker
 * Measures how fast operations feel to users
 */
export class UserExperienceTracker {
  private measurements: Map<string, number[]> = new Map();

  measure<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();

    if (!this.measurements.has(name)) {
      this.measurements.set(name, []);
    }
    this.measurements.get(name)?.push(end - start);

    return result;
  }

  getAverage(name: string): number {
    const times = this.measurements.get(name) || [];
    return times.length > 0
      ? times.reduce((a, b) => a + b, 0) / times.length
      : 0;
  }

  reset(): void {
    this.measurements.clear();
  }
}

/**
 * Smooth Interaction Coordinator
 * Manages multiple UI updates without blocking user interactions
 */
export class SmoothInteractionCoordinator {
  private updates: Promise<void>[] = [];

  addUpdate(updateFn: () => void): void {
    const promise = new Promise<void>((resolve) => {
      act(() => {
        startTransition(() => {
          updateFn();
          resolve();
        });
      });
    });
    this.updates.push(promise);
  }

  async waitForAll(): Promise<void> {
    await Promise.all(this.updates);
    this.updates = [];
  }
}

/**
 * Wait for user-perceived loading completion
 * Simulates real user waiting for operations to finish
 */
export function waitForUserPerceivedCompletion(ms: number = 0): Promise<void> {
  return act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
}
