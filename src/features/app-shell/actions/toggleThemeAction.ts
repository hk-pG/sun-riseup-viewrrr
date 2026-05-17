import type { ThemeToggledResult } from './types';

export const toggleThemeAction = (
  currentTheme: 'dark' | 'light',
): ThemeToggledResult => {
  return {
    type: 'theme-toggled',
    theme: currentTheme === 'dark' ? 'light' : 'dark',
  };
};
