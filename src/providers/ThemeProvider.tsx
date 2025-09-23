import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { settingsService } from '../services/SettingsService';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  // Debug theme changes
  useEffect(() => {
    console.log('Theme changed:', theme, '-> resolved:', resolvedTheme);
  }, [theme, resolvedTheme]);

  // Load theme from storage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await settingsService.loadTheme();
        setTheme(savedTheme);
      } catch (error) {
        console.warn('Failed to load theme from storage:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadTheme();
  }, []);

  // Save theme to storage when it changes
  useEffect(() => {
    if (isLoaded) {
      settingsService.saveTheme(theme).catch((error) => {
        console.error('Failed to save theme to storage:', error);
      });
    }
  }, [theme, isLoaded]);

  // System theme detection
  useEffect(() => {
    // React 19 compatible media query handling with fallback for tests
    const updateResolvedTheme = () => {
      if (theme === 'system') {
        // Safe media query check for test environments
        if (typeof window !== 'undefined' && window.matchMedia) {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
        } else {
          // Fallback for test environments
          setResolvedTheme('light');
        }
      } else {
        setResolvedTheme(theme);
      }
    };

    updateResolvedTheme();

    if (
      theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia
    ) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', updateResolvedTheme);
      return () =>
        mediaQuery.removeEventListener('change', updateResolvedTheme);
    }

    return undefined;
  }, [theme]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    console.log('Applying theme to document:', resolvedTheme);
    console.log('Before:', root.className);
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
    console.log('After:', root.className);
  }, [resolvedTheme]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    resolvedTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
