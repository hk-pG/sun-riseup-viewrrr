import { vi } from 'vitest';
import { createMockFileSystemService } from '@/test/mocks';
import type { ActionDependencies, ResultApplier } from '../actions/types';

export function createMockDeps(
  overrides?: Partial<ActionDependencies>,
): ActionDependencies {
  return {
    fss: createMockFileSystemService(),
    openImageFile: vi.fn().mockResolvedValue(null),
    currentTheme: 'dark',
    ...overrides,
  };
}

export function createMockApplier(
  overrides?: Partial<ResultApplier>,
): ResultApplier {
  return {
    startTransition: vi.fn((cb: () => void) => cb()),
    setAppState: vi.fn(),
    setTheme: vi.fn(),
    ...overrides,
  };
}
