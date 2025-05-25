import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLoggerOnUpdate } from '../useLoggerOnUpdate';

describe('useLoggerOnUpdate', () => {
  const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

  beforeEach(() => {
    consoleLogSpy.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('should log on initial render', () => {
    renderHook(() => useLoggerOnUpdate('initial value'));
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith('Value changed: initial value');
  });

  it('should log when value changes', () => {
    const { rerender } = renderHook(
      (props: { value: string }) => useLoggerOnUpdate(props.value, 'Updated:'),
      {
        initialProps: { value: 'first' },
      },
    );

    // first render
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith('Updated: first');

    // clear the log spy
    consoleLogSpy.mockClear();

    // change the value and rerender
    rerender({ value: 'second' });

    // called cleanup function, and recalled by new value
    expect(consoleLogSpy).toHaveBeenCalledTimes(2);
    expect(consoleLogSpy).toHaveBeenCalledWith('Cleanup function for: first');
    expect(consoleLogSpy).toHaveBeenCalledWith('Updated: second');
  });

  it('should call cleanup function on unmount', () => {
    const { unmount } = renderHook(() => useLoggerOnUpdate('unmountTest'));

    consoleLogSpy.mockClear();

    // unmount the component
    unmount();

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      'Cleanup function for: unmountTest',
    );
  });
});
