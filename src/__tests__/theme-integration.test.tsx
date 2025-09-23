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
  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks();

    // Reset settings service mocks to default behavior
    const { settingsService } = await import('../services/SettingsService');
    vi.mocked(settingsService.loadTheme).mockResolvedValue('system');
    vi.mocked(settingsService.saveTheme).mockResolvedValue(undefined);

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

    const button = screen.getByRole('button');

    // Click to switch to dark theme (light → dark)
    fireEvent.click(button);
    expect(document.documentElement).toHaveClass('dark');
    expect(document.documentElement).not.toHaveClass('light');

    // Click to switch to system theme (dark → system)
    fireEvent.click(button);
    // System should resolve to light (since matchMedia.matches = false)
    expect(document.documentElement).toHaveClass('light');
    expect(document.documentElement).not.toHaveClass('dark');

    // Click to switch back to light theme (system → light)
    fireEvent.click(button);
    expect(document.documentElement).toHaveClass('light');
    expect(document.documentElement).not.toHaveClass('dark');
  });

  it('should handle system theme detection', () => {
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

    render(
      <ThemeProvider defaultTheme="system">
        <ThemeToggle />
      </ThemeProvider>,
    );

    // Should detect dark system theme
    expect(document.documentElement).toHaveClass('dark');
    expect(document.documentElement).not.toHaveClass('light');
  });

  it('should handle light system theme detection', () => {
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

    render(
      <ThemeProvider defaultTheme="system">
        <ThemeToggle />
      </ThemeProvider>,
    );

    // Should detect light system theme
    expect(document.documentElement).toHaveClass('light');
    expect(document.documentElement).not.toHaveClass('dark');
  });

  it('should persist theme settings', async () => {
    const { settingsService } = await import('../services/SettingsService');

    render(
      <ThemeProvider defaultTheme="light">
        <ThemeToggle />
      </ThemeProvider>,
    );

    // Wait for initial theme loading to complete
    await vi.waitFor(() => {
      expect(settingsService.loadTheme).toHaveBeenCalled();
    });

    const button = screen.getByRole('button');
    fireEvent.click(button); // Switch to dark

    // Wait for theme to be saved
    await vi.waitFor(() => {
      expect(settingsService.saveTheme).toHaveBeenCalledWith('dark');
    });
  });

  it('should load initial theme from settings', async () => {
    const { settingsService } = await import('../services/SettingsService');

    // Reset the mock and set it to return 'dark'
    vi.mocked(settingsService.loadTheme).mockReset();
    vi.mocked(settingsService.loadTheme).mockResolvedValueOnce('dark');

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    // Wait for async theme loading and DOM update
    await vi.waitFor(() => {
      expect(document.documentElement).toHaveClass('dark');
    });

    expect(settingsService.loadTheme).toHaveBeenCalled();
  });
});
