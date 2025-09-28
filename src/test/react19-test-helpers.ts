/**
 * React 19 Test Helpers
 * Simple utilities for testing React 19 features
 */

import { act, renderHook } from '@testing-library/react';
import { startTransition } from 'react';

/**
 * Test helper for useTransition
 */
export function testTransition<T>(callback: () => T): Promise<T> {
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
 * Enhanced renderHook with act wrapping
 */
export function renderHookWithAct<Result, Props>(
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
 * Performance measurement helper
 */
export class PerformanceHelper {
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
 * Concurrent update helper
 */
export class ConcurrentHelper {
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
 * Wait for async operations
 */
export function waitForAsync(ms: number = 0): Promise<void> {
  return act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
}
