import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { waitForUserPerceivedCompletion } from '../../../test/ui-responsiveness-test-utils';
import { ThemeProvider } from '../../theme-provider';
import { ThemeToggle } from '../theme-toggle';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Sun: ({ className }: { className?: string }) => (
    <div data-testid="sun-icon" className={className} />
  ),
  Moon: ({ className }: { className?: string }) => (
    <div data-testid="moon-icon" className={className} />
  ),
}));

describe('ThemeToggle', () => {
  beforeEach(() => {
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

  it('should render with dark theme icon by default', async () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    await waitForUserPerceivedCompletion();
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Switch to light mode',
    );
  });

  it('should cycle between light and dark themes when clicked', async () => {
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeToggle />
      </ThemeProvider>,
    );

    await waitForUserPerceivedCompletion(100);
    const button = screen.getByRole('button');

    // Should start with light theme (sun icon)
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();

    // Click to switch to dark
    fireEvent.click(button);
    await waitForUserPerceivedCompletion(50);
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();

    // Click to switch back to light
    fireEvent.click(button);
    await waitForUserPerceivedCompletion(50);
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
  });
});
