import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../../../providers/ThemeProvider';
import { waitForUserPerceivedCompletion } from '../../../test/ui-responsiveness-test-utils';
import { ThemeSelector, ThemeToggle } from '../theme-toggle';

// Mock the settings service
vi.mock('../../../services/SettingsService', () => ({
  settingsService: {
    loadTheme: vi.fn().mockResolvedValue('system'),
    saveTheme: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Sun: ({ className }: { className?: string }) => (
    <div data-testid="sun-icon" className={className} />
  ),
  Moon: ({ className }: { className?: string }) => (
    <div data-testid="moon-icon" className={className} />
  ),
  Monitor: ({ className }: { className?: string }) => (
    <div data-testid="monitor-icon" className={className} />
  ),
}));

describe('ThemeToggle', () => {
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

  it('should render with system theme icon by default', async () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    await waitForUserPerceivedCompletion();
    expect(screen.getByTestId('monitor-icon')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Switch to light mode',
    );
  });

  it('should cycle through themes when clicked', async () => {
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeToggle />
      </ThemeProvider>,
    );

    await waitForUserPerceivedCompletion();
    const button = screen.getByRole('button');

    // Should start with light theme (sun icon)
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();

    // Click to switch to dark
    fireEvent.click(button);
    await waitForUserPerceivedCompletion();
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();

    // Click to switch to system
    fireEvent.click(button);
    await waitForUserPerceivedCompletion();
    expect(screen.getByTestId('monitor-icon')).toBeInTheDocument();

    // Click to switch back to light
    fireEvent.click(button);
    await waitForUserPerceivedCompletion();
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
  });

  it('should have correct aria-labels for each theme', async () => {
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeToggle />
      </ThemeProvider>,
    );

    await waitForUserPerceivedCompletion();
    const button = screen.getByRole('button');

    // Light theme
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');

    // Switch to dark
    fireEvent.click(button);
    await waitForUserPerceivedCompletion();
    expect(button).toHaveAttribute('aria-label', 'Switch to system mode');

    // Switch to system
    fireEvent.click(button);
    await waitForUserPerceivedCompletion();
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
  });
});

describe('ThemeSelector', () => {
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

  it('should render all theme options', async () => {
    render(
      <ThemeProvider>
        <ThemeSelector />
      </ThemeProvider>,
    );

    await waitForUserPerceivedCompletion();
    expect(screen.getByLabelText('Light mode')).toBeInTheDocument();
    expect(screen.getByLabelText('Dark mode')).toBeInTheDocument();
    expect(screen.getByLabelText('System mode')).toBeInTheDocument();
  });

  it('should highlight the current theme', async () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <ThemeSelector />
      </ThemeProvider>,
    );

    await waitForUserPerceivedCompletion();
    const darkButton = screen.getByLabelText('Dark mode');
    const lightButton = screen.getByLabelText('Light mode');
    const systemButton = screen.getByLabelText('System mode');

    // Dark button should be selected (default variant)
    expect(darkButton).toHaveClass('bg-primary');
    expect(lightButton).not.toHaveClass('bg-primary');
    expect(systemButton).not.toHaveClass('bg-primary');
  });

  it('should switch themes when buttons are clicked', async () => {
    render(
      <ThemeProvider defaultTheme="system">
        <ThemeSelector />
      </ThemeProvider>,
    );

    await waitForUserPerceivedCompletion();
    const lightButton = screen.getByLabelText('Light mode');
    const darkButton = screen.getByLabelText('Dark mode');

    // Click light button
    fireEvent.click(lightButton);
    await waitForUserPerceivedCompletion();
    expect(lightButton).toHaveClass('bg-primary');

    // Click dark button
    fireEvent.click(darkButton);
    await waitForUserPerceivedCompletion();
    expect(darkButton).toHaveClass('bg-primary');
    expect(lightButton).not.toHaveClass('bg-primary');
  });
});
