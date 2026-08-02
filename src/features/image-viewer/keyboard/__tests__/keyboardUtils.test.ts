import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { KeyboardShortcut } from '../../types/viewerTypes';
import {
  createCustomKeyboardMapping,
  createDefaultKeyboardMapping,
  getShortcutDescription,
  getShortcutList,
} from '../keyboardUtils';

describe('keyboardUtils', () => {
  const mockOnAction = vi.fn();

  beforeEach(() => {
    mockOnAction.mockClear();
  });

  describe('createDefaultKeyboardMapping', () => {
    it('should include expected shortcuts for nextImage', () => {
      const mapping = createDefaultKeyboardMapping(mockOnAction);
      const shortcuts = mapping.shortcuts.get('nextImage');
      expect(shortcuts).toBeDefined();
      if (!shortcuts) return;

      const keys = shortcuts.map((s) => s.key);
      expect(keys).toContain('ArrowRight');
      expect(keys).toContain(' ');
      expect(keys).toContain('j');
    });

    it('should include expected shortcuts for previousImage', () => {
      const mapping = createDefaultKeyboardMapping(mockOnAction);
      const shortcuts = mapping.shortcuts.get('previousImage');
      expect(shortcuts).toBeDefined();
      if (!shortcuts) return;

      const keys = shortcuts.map((s) => s.key);
      expect(keys).toContain('ArrowLeft');
      expect(keys).toContain('k');
    });
  });

  describe('createCustomKeyboardMapping', () => {
    it('should override default shortcuts with custom ones', () => {
      const defaultMapping = createDefaultKeyboardMapping(mockOnAction);
      const customMapping = createCustomKeyboardMapping(
        { nextImage: [{ key: 'n', description: 'Custom Next' }] },
        mockOnAction,
        defaultMapping,
      );

      expect(customMapping.shortcuts.get('nextImage')).toEqual([
        { key: 'n', description: 'Custom Next' },
      ]);
    });

    it('should preserve non-overridden shortcuts from base mapping', () => {
      const defaultMapping = createDefaultKeyboardMapping(mockOnAction);
      const originalPrevShortcuts =
        defaultMapping.shortcuts.get('previousImage');

      const customMapping = createCustomKeyboardMapping(
        { nextImage: [{ key: 'n', description: 'Custom Next' }] },
        mockOnAction,
        defaultMapping,
      );

      expect(customMapping.shortcuts.get('previousImage')).toEqual(
        originalPrevShortcuts,
      );
    });

    it('should work without base mapping', () => {
      const mapping = createCustomKeyboardMapping(
        { nextImage: [{ key: 'n', description: 'Next' }] },
        mockOnAction,
      );

      expect(mapping.shortcuts.get('nextImage')).toEqual([
        { key: 'n', description: 'Next' },
      ]);
      expect(mapping.shortcuts.has('previousImage')).toBe(true);
    });

    it('should handle empty custom shortcuts', () => {
      const mapping = createCustomKeyboardMapping({}, mockOnAction);
      const defaultMapping = createDefaultKeyboardMapping(mockOnAction);
      expect(mapping.shortcuts.size).toBe(defaultMapping.shortcuts.size);
    });

    it('should ignore undefined shortcut entries', () => {
      const mapping = createCustomKeyboardMapping(
        { nextImage: undefined },
        mockOnAction,
      );

      expect(mapping.shortcuts.has('nextImage')).toBe(true);
    });

    it('should allow empty array to clear an action', () => {
      const mapping = createCustomKeyboardMapping(
        { nextImage: [] },
        mockOnAction,
      );

      expect(mapping.shortcuts.get('nextImage')).toEqual([]);
    });
  });

  describe('getShortcutDescription', () => {
    it('should return key for simple shortcuts', () => {
      const shortcut: KeyboardShortcut = { key: 'j', description: 'Next' };
      expect(getShortcutDescription(shortcut)).toBe('j');
    });

    it('should handle space key specially', () => {
      const shortcut: KeyboardShortcut = { key: ' ', description: 'Next' };
      expect(getShortcutDescription(shortcut)).toBe('Space');
    });

    it('should format all modifiers together', () => {
      const shortcut: KeyboardShortcut = {
        key: 'x',
        ctrlKey: true,
        shiftKey: true,
        altKey: true,
        metaKey: true,
        description: 'All modifiers',
      };
      expect(getShortcutDescription(shortcut)).toBe('Ctrl+Shift+Alt+Cmd+x');
    });
  });

  describe('getShortcutList', () => {
    it('should use custom descriptions when available', () => {
      const mapping = createCustomKeyboardMapping(
        { nextImage: [{ key: 'n', description: 'Custom Next Description' }] },
        mockOnAction,
      );
      const shortcutList = getShortcutList(mapping);

      const nextImageItem = shortcutList.find(
        (item) => item.action === 'nextImage',
      );
      expect(nextImageItem?.descriptions).toContain('Custom Next Description');
    });

    it('should generate descriptions for shortcuts without custom descriptions', () => {
      const mapping = createCustomKeyboardMapping(
        { nextImage: [{ key: 'n' }] },
        mockOnAction,
      );
      const shortcutList = getShortcutList(mapping);

      const nextImageItem = shortcutList.find(
        (item) => item.action === 'nextImage',
      );
      expect(nextImageItem?.descriptions).toContain('n');
    });
  });
});
