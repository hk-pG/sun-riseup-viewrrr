import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockContext } from '../../__tests__/helpers';
import type { ActionContext } from '../../actions/types';
import { useAppActions } from '../useAppActions';

describe('useAppActions', () => {
  let ctx: ActionContext;

  beforeEach(() => {
    ctx = createMockContext();
  });

  it('executeAction invokes the registered handler', async () => {
    vi.mocked(ctx.fss.openDirectoryDialog).mockResolvedValue('/test');

    const { result } = renderHook(() => useAppActions(ctx));

    await result.current.executeAction('open-folder');

    expect(ctx.fss.openDirectoryDialog).toHaveBeenCalledOnce();
    expect(ctx.setAppState).toHaveBeenCalledOnce();
  });

  it('warns on unregistered action id', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useAppActions(ctx));

    // 'exit' is a valid AppMenuBarEvent but not registered in the registry
    await result.current.executeAction('exit');

    expect(warnSpy).toHaveBeenCalledWith('Unhandled menu action: exit');
    warnSpy.mockRestore();
  });

  it('catches handler errors and logs them with console.error', async () => {
    const error = new Error('boom');
    vi.mocked(ctx.fss.openDirectoryDialog).mockRejectedValue(error);

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useAppActions(ctx));
    await result.current.executeAction('open-folder');

    expect(errorSpy).toHaveBeenCalledWith(
      'Menu action failed [open-folder]:',
      error,
    );
    errorSpy.mockRestore();
  });
});
