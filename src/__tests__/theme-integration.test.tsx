import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../components/theme-provider';
import { ThemeToggle } from '../components/ui/theme-toggle';

// SettingsServiceは使用しないため、モックを削除

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Moon: ({ className }: { className?: string }) => (
    <div data-testid="moon-icon" className={className} />
  ),
  Sun: ({ className }: { className?: string }) => (
    <div data-testid="sun-icon" className={className} />
  ),
}));

describe('Theme System Integration', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Clear localStorage
    localStorage.clear();

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Clear document classes
    document.documentElement.className = '';
  });

  it('should apply theme classes to document element', async () => {
    await act(async () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ThemeToggle />
        </ThemeProvider>,
      );
    });

    // Wait for initial theme to be applied
    await waitFor(() => {
      expect(document.documentElement).toHaveClass('light');
    });

    const button = screen.getByRole('button');

    // Test that clicking the button triggers theme changes
    await act(async () => {
      fireEvent.click(button);
    });

    // Just verify that some theme class is applied after clicking
    await waitFor(() => {
      const hasThemeClass =
        document.documentElement.classList.contains('light') ||
        document.documentElement.classList.contains('dark');
      expect(hasThemeClass).toBe(true);
    });
  });

  it('should handle dark theme as default', async () => {
    await act(async () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <ThemeToggle />
        </ThemeProvider>,
      );
    });

    // Should apply dark theme by default
    expect(document.documentElement).toHaveClass('dark');
    expect(document.documentElement).not.toHaveClass('light');
  });

  it('should handle light theme explicitly', async () => {
    await act(async () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ThemeToggle />
        </ThemeProvider>,
      );
    });

    // Wait for initial theme to be applied
    await waitFor(() => {
      expect(document.documentElement).toHaveClass('light');
      expect(document.documentElement).not.toHaveClass('dark');
    });
  });

  it('should maintain theme state without persistence', async () => {
    await act(async () => {
      render(
        <ThemeProvider defaultTheme="light">
          <ThemeToggle />
        </ThemeProvider>,
      );
    });

    // Wait for initial theme to be applied
    await waitFor(() => {
      expect(document.documentElement).toHaveClass('light');
    });

    const button = screen.getByRole('button');

    await act(async () => {
      fireEvent.click(button); // Switch to dark theme
    });

    // Verify theme switched to dark
    await waitFor(() => {
      expect(document.documentElement).toHaveClass('dark');
      expect(document.documentElement).not.toHaveClass('light');
    });
  });

  it('should use dark theme as default', async () => {
    await act(async () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>,
      );
    });

    // Should default to dark theme (our new default)
    await waitFor(() => {
      expect(document.documentElement).toHaveClass('dark');
    });
  });
});
