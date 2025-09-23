/**
 * React 19 Test Utilities
 * Enhanced testing utilities for React 19 patterns
 */

import { type RenderOptions, render } from '@testing-library/react';
import type { ReactElement } from 'react';
import type { ThemeProvider } from '@/providers/ThemeProvider';

// Enhanced render function with theme provider
const customRender = (
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

// Override render method
export { customRender as render };

// React 19 specific test helpers
export const waitForThemeChange = async () => {
    // Small delay to allow theme changes to propagate
    await new Promise(resolve => setTimeout(resolve, 50));
};

export const mockMatchMedia = async (matches: boolean = false) => {
    const { vi } = await import('vitest');
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
            matches,
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