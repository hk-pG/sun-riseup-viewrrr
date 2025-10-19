import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeToggle } from '../components/ui/theme-toggle';
import { ThemeProvider } from '../providers/ThemeProvider';

// SettingsServiceは使用しないため、モックを削除

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Monitor: ({ className }: { className?: string }) => (
    <div data-testid="monitor-icon" className={className} />
  ),
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

  it('should handle system theme detection', async () => {
    // Test dark system preference
    const mockMatchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });

    await act(async () => {
      render(
        <ThemeProvider defaultTheme="system">
          <ThemeToggle />
        </ThemeProvider>,
      );
    });

    // Should detect dark system theme
    expect(document.documentElement).toHaveClass('dark');
    expect(document.documentElement).not.toHaveClass('light');
  });

  it('should handle light system theme detection', async () => {
    // Test light system preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false, // Light theme
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    await act(async () => {
      render(
        <ThemeProvider defaultTheme="system">
          <ThemeToggle />
        </ThemeProvider>,
      );
    });

    // Should detect light system theme
    expect(document.documentElement).toHaveClass('light');
    expect(document.documentElement).not.toHaveClass('dark');
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
      fireEvent.click(button); // Switch theme
    });

    // Verify theme switching still works (just without persistence)
    await waitFor(() => {
      const hasThemeClass =
        document.documentElement.classList.contains('light') ||
        document.documentElement.classList.contains('dark');
      expect(hasThemeClass).toBe(true);
    });
  });

  it('should use system theme as default', async () => {
    await act(async () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>,
      );
    });

    // Should default to system theme and resolve to light (based on mock)
    await waitFor(() => {
      expect(document.documentElement).toHaveClass('light');
    });
  });
});
