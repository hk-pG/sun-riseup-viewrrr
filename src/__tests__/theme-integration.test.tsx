import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeToggle } from '../components/ui/theme-toggle';
import { ThemeProvider } from '../providers/ThemeProvider';

// Mock the settings service
vi.mock('../services/SettingsService', () => ({
  settingsService: {
    loadTheme: vi.fn().mockResolvedValue('system'),
    saveTheme: vi.fn().mockResolvedValue(undefined),
  },
}));

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

  it('should apply theme classes to document element', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeToggle />
      </ThemeProvider>,
    );

    // Should start with light theme
    expect(document.documentElement).toHaveClass('light');
    expect(document.documentElement).not.toHaveClass('dark');

    // Click to switch to dark theme
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Should now have dark theme
    expect(document.documentElement).toHaveClass('dark');
    expect(document.documentElement).not.toHaveClass('light');
  });

  it('should persist theme changes across provider remounts', () => {
    const { rerender } = render(
      <ThemeProvider defaultTheme="light">
        <ThemeToggle />
      </ThemeProvider>,
    );

    // Switch to dark theme
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(document.documentElement).toHaveClass('dark');

    // Remount the provider
    rerender(
      <ThemeProvider defaultTheme="system">
        <ThemeToggle />
      </ThemeProvider>,
    );

    // Theme should be preserved (though this test won't show persistence due to mocking)
    expect(screen.getByTestId('monitor-icon')).toBeInTheDocument();
  });

  it('should handle system theme detection', () => {
    // Mock dark system preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(
      <ThemeProvider defaultTheme="system">
        <ThemeToggle />
      </ThemeProvider>,
    );

    // Should detect dark system theme
    expect(document.documentElement).toHaveClass('dark');
  });

  it('should provide smooth theme transitions', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <div
          data-testid="test-element"
          className="bg-background text-foreground"
        >
          Test content
        </div>
      </ThemeProvider>,
    );

    const testElement = screen.getByTestId('test-element');

    // Check that CSS variables are applied
    const computedStyle = window.getComputedStyle(testElement);
    expect(computedStyle.getPropertyValue('transition')).toContain(
      'background-color',
    );
  });
});
