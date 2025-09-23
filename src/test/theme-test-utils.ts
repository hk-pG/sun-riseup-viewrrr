/**
 * Theme Testing Utilities
 * Enhanced testing utilities for theme-aware components
 */

import { type RenderOptions, render } from '@testing-library/react';
import type { ReactElement } from 'react';
import type { ThemeProvider } from '@/providers/ThemeProvider';

// Enhanced render function with theme provider
const renderWithTheme = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'> & {
        withTheme?: boolean;
        defaultTheme?: 'light' | 'dark' | 'system';
    }
) => {
    const { withTheme = true, defaultTheme = 'system', ...renderOptions } = options || {};

    const Wrapper = ({ children }: { children: React.ReactNode }) => {
        if (withTheme) {
            return <ThemeProvider defaultTheme={ defaultTheme }> { children } < /ThemeProvider>;
        }
        return <>{ children } < />;
    };

    return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Re-export everything from testing-library/react
export * from '@testing-library/react';

// Override render method with theme-aware version
export { renderWithTheme as render };

// Theme-specific test helpers
export const waitForThemeChange = async () => {
    // Small delay to allow theme changes to propagate
    await new Promise(resolve => setTimeout(resolve, 50));
};

export const mockSystemTheme = async (prefersDark: boolean = false) => {
    const { vi } = await import('vitest');
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
            matches: query === '(prefers-color-scheme: dark)' ? prefersDark : false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    });
};

// Helper to test theme switching
export const getThemeClass = () => {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
};