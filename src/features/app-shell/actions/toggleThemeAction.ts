import type { ActionHandler } from './types';

export const toggleThemeAction: ActionHandler = async (ctx) => {
  const { theme: currentTheme, setTheme } = ctx.themeApi;
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(nextTheme);
};
