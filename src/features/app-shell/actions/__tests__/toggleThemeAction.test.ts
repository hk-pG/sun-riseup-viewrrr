import { describe, expect, it } from 'vitest';
import { toggleThemeAction } from '../toggleThemeAction';

describe('toggleThemeAction', () => {
  it('dark → light: ThemeToggledResult を返す', () => {
    const result = toggleThemeAction('dark');

    expect(result).toEqual({
      type: 'theme-toggled',
      theme: 'light',
    });
  });

  it('light → dark: ThemeToggledResult を返す', () => {
    const result = toggleThemeAction('light');

    expect(result).toEqual({
      type: 'theme-toggled',
      theme: 'dark',
    });
  });
});
