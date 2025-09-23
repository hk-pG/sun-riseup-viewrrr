/**
 * Component Testing Utilities
 * General-purpose testing utilities for UI components
 */

import { type RenderOptions, render } from '@testing-library/react';
import type { ReactElement } from 'react';

// Enhanced render function with common providers
const renderWithProviders = (
    ui: ReactElement,
    options?: RenderOptions & {
        // Add other providers as needed
        initialProps?: Record<string, unknown>;
    }
) => {
    const { initialProps, ...renderOptions } = options || {};

    // Wrapper can be extended with other providers (Router, etc.)
    const Wrapper = ({ children }: { children: React.ReactNode }) => {
        return <>{ children } < />;
    };

    return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Re-export everything from testing-library/react
export * from '@testing-library/react';

// Export enhanced render
export { renderWithProviders as render };

// Common test utilities
export const waitForAsync = async (ms: number = 0) => {
    await new Promise(resolve => setTimeout(resolve, ms));
};

// Mock window APIs commonly needed in tests
export const mockWindowAPI = async (api: string, implementation: unknown) => {
    const { vi } = await import('vitest');
    Object.defineProperty(window, api, {
        writable: true,
        value: implementation,
    });
};

// Helper for testing accessibility
export const getByAriaLabel = (container: HTMLElement, label: string) => {
    return container.querySelector(`[aria-label="${label}"]`);
};