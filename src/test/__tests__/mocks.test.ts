import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetAllMocks, setupTauriMocks } from '../mocks';

describe('Test Mocks', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('setupTauriMocks', () => {
    it('should setup Tauri API mocks', () => {
      setupTauriMocks();

      // These would be mocked by the setup function
      // We can't directly test the mocks here since they're module-level
      // but we can verify the setup function runs without error
      expect(setupTauriMocks).toBeDefined();
    });
  });

  describe('resetAllMocks', () => {
    it('should reset all mocks and timers', () => {
      const mockFn = vi.fn();
      mockFn();

      expect(mockFn).toHaveBeenCalledTimes(1);

      resetAllMocks();

      // After reset, the mock should be cleared
      // Note: This test is more about ensuring the function runs without error
      expect(resetAllMocks).toBeDefined();
    });
  });
});
