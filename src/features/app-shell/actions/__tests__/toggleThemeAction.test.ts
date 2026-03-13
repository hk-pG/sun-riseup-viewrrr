import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockContext } from '../../__tests__/helpers';
import { toggleThemeAction } from '../toggleThemeAction';
import type { ActionContext } from '../types';

describe('toggleThemeAction', () => {
  let ctx: ActionContext;

  beforeEach(() => {
    ctx = createMockContext();
  });

  it('switches from dark to light', async () => {
    ctx = createMockContext({ themeApi: { theme: 'dark', setTheme: vi.fn() } });

    await toggleThemeAction(ctx);

    expect(ctx.themeApi.setTheme).toHaveBeenCalledWith('light');
  });

  it('switches from light to dark', async () => {
    ctx = createMockContext({
      themeApi: { theme: 'light', setTheme: vi.fn() },
    });

    await toggleThemeAction(ctx);

    expect(ctx.themeApi.setTheme).toHaveBeenCalledWith('dark');
  });
});
