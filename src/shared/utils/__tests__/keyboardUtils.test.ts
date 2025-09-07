import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  ActionType,
  KeyboardShortcut,
} from '../../../features/image-viewer/types/viewerTypes';
import {
  createCustomKeyboardMapping,
  createDefaultKeyboardMapping,
  findShortcutConflicts,
  getShortcutDescription,
  getShortcutList,
} from '../keyboardUtils';

describe('keyboardUtils', () => {
  const mockOnAction = vi.fn();

  beforeEach(() => {
    mockOnAction.mockClear();
  });

  describe('createDefaultKeyboardMapping', () => {
    it('should create a mapping with all expected actions', () => {
      const mapping = createDefaultKeyboardMapping(mockOnAction);

      expect(mapping.onAction).toBe(mockOnAction);
      expect(mapping.enabled).toBe(true);
      expect(mapping.shortcuts).toBeInstanceOf(Map);

      // Check that all expected actions are present
      const expectedActions: ActionType[] = [
        'nextImage',
        'previousImage',
        'firstImage',
        'lastImage',
        'zoomIn',
        'zoomOut',
        'resetZoom',
        'rotateRight',
        'rotateLeft',
        'resetRotation',
        'toggleFullscreen',
        'toggleControls',
        'toggleFitMode',
      ];

      expectedActions.forEach((action) => {
        expect(mapping.shortcuts.has(action)).toBe(true);
      });
    });

    it('should have multiple shortcuts for navigation actions', () => {
      const mapping = createDefaultKeyboardMapping(mockOnAction);

      const nextImageShortcuts = mapping.shortcuts.get('nextImage');
      expect(nextImageShortcuts).toBeDefined();
      expect(nextImageShortcuts?.length).toBeGreaterThan(1);

      const previousImageShortcuts = mapping.shortcuts.get('previousImage');
      expect(previousImageShortcuts).toBeDefined();
      expect(previousImageShortcuts?.length).toBeGreaterThan(1);
    });

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

    it('should include modifier key shortcuts', () => {
      const mapping = createDefaultKeyboardMapping(mockOnAction);

      const zoomInShortcuts = mapping.shortcuts.get('zoomIn');
      expect(zoomInShortcuts).toBeDefined();
      if (!zoomInShortcuts) return;

      const ctrlUpShortcut = zoomInShortcuts.find(
        (s) => s.key === 'ArrowUp' && s.ctrlKey,
      );
      expect(ctrlUpShortcut).toBeDefined();

      const lastImageShortcuts = mapping.shortcuts.get('lastImage');
      expect(lastImageShortcuts).toBeDefined();
      if (!lastImageShortcuts) return;
      const shiftGShortcut = lastImageShortcuts.find(
        (s) => s.key === 'G' && s.shiftKey,
      );
      expect(shiftGShortcut).toBeDefined();
    });
  });

  describe('createCustomKeyboardMapping', () => {
    it('should create mapping with custom shortcuts', () => {
      const customShortcuts = {
        nextImage: [{ key: 'n', description: 'Next' }],
        previousImage: [{ key: 'p', description: 'Previous' }],
      };

      const mapping = createCustomKeyboardMapping(
        customShortcuts,
        mockOnAction,
      );

      expect(mapping.shortcuts.get('nextImage')).toEqual([
        { key: 'n', description: 'Next' },
      ]);
      expect(mapping.shortcuts.get('previousImage')).toEqual([
        { key: 'p', description: 'Previous' },
      ]);
    });

    it('should override default shortcuts with custom ones', () => {
      const defaultMapping = createDefaultKeyboardMapping(mockOnAction);
      const originalNextShortcuts = defaultMapping.shortcuts.get('nextImage');
      expect(originalNextShortcuts).toBeDefined();
      if (!originalNextShortcuts) return;

      const customShortcuts = {
        nextImage: [{ key: 'n', description: 'Custom Next' }],
      };

      const customMapping = createCustomKeyboardMapping(
        customShortcuts,
        mockOnAction,
        defaultMapping,
      );

      const newNextShortcuts = customMapping.shortcuts.get('nextImage');
      expect(newNextShortcuts).toBeDefined();
      if (!newNextShortcuts) return;
      expect(newNextShortcuts).not.toEqual(originalNextShortcuts);
      expect(newNextShortcuts).toEqual([
        { key: 'n', description: 'Custom Next' },
      ]);
    });

    it('should preserve non-overridden shortcuts from base mapping', () => {
      const defaultMapping = createDefaultKeyboardMapping(mockOnAction);
      const originalPrevShortcuts =
        defaultMapping.shortcuts.get('previousImage');
      expect(originalPrevShortcuts).toBeDefined();
      if (!originalPrevShortcuts) return;

      const customShortcuts = {
        nextImage: [{ key: 'n', description: 'Custom Next' }],
      };

      const customMapping = createCustomKeyboardMapping(
        customShortcuts,
        mockOnAction,
        defaultMapping,
      );

      expect(customMapping.shortcuts.get('previousImage')).toEqual(
        originalPrevShortcuts,
      );
    });

    it('should work without base mapping', () => {
      const customShortcuts = {
        nextImage: [{ key: 'n', description: 'Next' }],
      };

      const mapping = createCustomKeyboardMapping(
        customShortcuts,
        mockOnAction,
      );

      expect(mapping.shortcuts.get('nextImage')).toEqual([
        { key: 'n', description: 'Next' },
      ]);
      // Should still have other default shortcuts
      expect(mapping.shortcuts.has('previousImage')).toBe(true);
    });

    it('should handle empty custom shortcuts', () => {
      const mapping = createCustomKeyboardMapping({}, mockOnAction);

      // Should be equivalent to default mapping
      const defaultMapping = createDefaultKeyboardMapping(mockOnAction);
      expect(mapping.shortcuts.size).toBe(defaultMapping.shortcuts.size);
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

    it('should format Ctrl modifier', () => {
      const shortcut: KeyboardShortcut = {
        key: 'c',
        ctrlKey: true,
        description: 'Copy',
      };
      expect(getShortcutDescription(shortcut)).toBe('Ctrl+c');
    });

    it('should format Shift modifier', () => {
      const shortcut: KeyboardShortcut = {
        key: 'G',
        shiftKey: true,
        description: 'Last',
      };
      expect(getShortcutDescription(shortcut)).toBe('Shift+G');
    });

    it('should format Alt modifier', () => {
      const shortcut: KeyboardShortcut = {
        key: 'f',
        altKey: true,
        description: 'Alt F',
      };
      expect(getShortcutDescription(shortcut)).toBe('Alt+f');
    });

    it('should format Meta modifier', () => {
      const shortcut: KeyboardShortcut = {
        key: 'c',
        metaKey: true,
        description: 'Cmd C',
      };
      expect(getShortcutDescription(shortcut)).toBe('Cmd+c');
    });

    it('should format multiple modifiers', () => {
      const shortcut: KeyboardShortcut = {
        key: 'c',
        ctrlKey: true,
        shiftKey: true,
        description: 'Ctrl Shift C',
      };
      expect(getShortcutDescription(shortcut)).toBe('Ctrl+Shift+c');
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
    it('should return list of all shortcuts with descriptions', () => {
      const mapping = createDefaultKeyboardMapping(mockOnAction);
      const shortcutList = getShortcutList(mapping);

      expect(shortcutList).toBeInstanceOf(Array);
      expect(shortcutList.length).toBeGreaterThan(0);

      shortcutList.forEach((item) => {
        expect(item).toHaveProperty('action');
        expect(item).toHaveProperty('shortcuts');
        expect(item).toHaveProperty('descriptions');
        expect(item.shortcuts).toBeInstanceOf(Array);
        expect(item.descriptions).toBeInstanceOf(Array);
        expect(item.shortcuts.length).toBe(item.descriptions.length);
      });
    });

    it('should use custom descriptions when available', () => {
      const customShortcuts = {
        nextImage: [{ key: 'n', description: 'Custom Next Description' }],
      };
      const mapping = createCustomKeyboardMapping(
        customShortcuts,
        mockOnAction,
      );
      const shortcutList = getShortcutList(mapping);

      const nextImageItem = shortcutList.find(
        (item) => item.action === 'nextImage',
      );
      expect(nextImageItem).toBeDefined();
      expect(nextImageItem?.descriptions).toContain('Custom Next Description');
    });

    it('should generate descriptions for shortcuts without custom descriptions', () => {
      const customShortcuts = {
        nextImage: [{ key: 'n' }], // No description provided
      };
      const mapping = createCustomKeyboardMapping(
        customShortcuts,
        mockOnAction,
      );
      const shortcutList = getShortcutList(mapping);

      const nextImageItem = shortcutList.find(
        (item) => item.action === 'nextImage',
      );
      expect(nextImageItem).toBeDefined();
      expect(nextImageItem?.descriptions).toContain('n');
    });
  });

  describe('findShortcutConflicts', () => {
    it('should return empty array when no conflicts exist', () => {
      const mapping = createDefaultKeyboardMapping(mockOnAction);
      const conflicts = findShortcutConflicts(mapping);

      expect(conflicts).toBeInstanceOf(Array);
      expect(conflicts.length).toBe(0);
    });

    it('should detect conflicts when same shortcut is used for different actions', () => {
      const conflictingShortcuts = {
        nextImage: [{ key: 'x', description: 'Next' }],
        previousImage: [{ key: 'x', description: 'Previous' }],
      };
      const mapping = createCustomKeyboardMapping(
        conflictingShortcuts,
        mockOnAction,
      );
      const conflicts = findShortcutConflicts(mapping);

      expect(conflicts.length).toBe(1);
      expect(conflicts[0].shortcut.key).toBe('x');
      expect(conflicts[0].actions).toContain('nextImage');
      expect(conflicts[0].actions).toContain('previousImage');
    });

    it('should detect conflicts with modifier keys', () => {
      const conflictingShortcuts = {
        nextImage: [{ key: 'c', ctrlKey: true, description: 'Next' }],
        previousImage: [{ key: 'c', ctrlKey: true, description: 'Previous' }],
      };
      const mapping = createCustomKeyboardMapping(
        conflictingShortcuts,
        mockOnAction,
      );
      const conflicts = findShortcutConflicts(mapping);

      expect(conflicts.length).toBe(1);
      expect(conflicts[0].shortcut.key).toBe('c');
      expect(conflicts[0].shortcut.ctrlKey).toBe(true);
    });

    it('should not detect conflicts for different modifier combinations', () => {
      const nonConflictingShortcuts = {
        nextImage: [{ key: 'c', ctrlKey: true, description: 'Next' }],
        previousImage: [{ key: 'c', shiftKey: true, description: 'Previous' }],
      };
      const mapping = createCustomKeyboardMapping(
        nonConflictingShortcuts,
        mockOnAction,
      );
      const conflicts = findShortcutConflicts(mapping);

      expect(conflicts.length).toBe(0);
    });

    it('should handle multiple conflicts', () => {
      const multipleConflicts = {
        nextImage: [
          { key: 'x', description: 'Next X' },
          { key: 'y', description: 'Next Y' },
        ],
        previousImage: [
          { key: 'x', description: 'Prev X' },
          { key: 'z', description: 'Prev Z' },
        ],
        zoomIn: [
          { key: 'y', description: 'Zoom Y' },
          { key: 'z', description: 'Zoom Z' },
        ],
      };
      const mapping = createCustomKeyboardMapping(
        multipleConflicts,
        mockOnAction,
      );
      const conflicts = findShortcutConflicts(mapping);

      expect(conflicts.length).toBe(3); // x, y, z conflicts

      const conflictKeys = conflicts.map((c) => c.shortcut.key).sort();
      expect(conflictKeys).toEqual(['x', 'y', 'z']);
    });

    it('should handle conflicts with more than 2 actions', () => {
      const tripleConflict = {
        nextImage: [{ key: 'x', description: 'Next' }],
        previousImage: [{ key: 'x', description: 'Previous' }],
        zoomIn: [{ key: 'x', description: 'Zoom' }],
      };
      const mapping = createCustomKeyboardMapping(tripleConflict, mockOnAction);
      const conflicts = findShortcutConflicts(mapping);

      expect(conflicts.length).toBe(1);
      expect(conflicts[0].actions.length).toBe(3);
      expect(conflicts[0].actions).toContain('nextImage');
      expect(conflicts[0].actions).toContain('previousImage');
      expect(conflicts[0].actions).toContain('zoomIn');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle empty shortcuts gracefully', () => {
      const emptyShortcuts = {
        nextImage: [],
      };
      const mapping = createCustomKeyboardMapping(emptyShortcuts, mockOnAction);

      expect(mapping.shortcuts.get('nextImage')).toEqual([]);
      expect(() => getShortcutList(mapping)).not.toThrow();
      expect(() => findShortcutConflicts(mapping)).not.toThrow();
    });

    it('should handle undefined shortcuts gracefully', () => {
      const undefinedShortcuts = {
        nextImage: undefined,
      };
      const mapping = createCustomKeyboardMapping(
        undefinedShortcuts,
        mockOnAction,
      );

      // Should preserve default shortcuts when undefined is provided
      expect(mapping.shortcuts.has('nextImage')).toBe(true);
    });

    it('should handle special key values', () => {
      const specialKeys = {
        nextImage: [
          { key: 'Enter', description: 'Enter key' },
          { key: 'Escape', description: 'Escape key' },
          { key: 'Tab', description: 'Tab key' },
          { key: 'F1', description: 'Function key' },
        ],
      };
      const mapping = createCustomKeyboardMapping(specialKeys, mockOnAction);

      expect(() => getShortcutList(mapping)).not.toThrow();
      expect(() => findShortcutConflicts(mapping)).not.toThrow();

      const shortcuts = mapping.shortcuts.get('nextImage');
      expect(shortcuts).toBeDefined();
      if (!shortcuts) return;
      expect(shortcuts.map((s) => s.key)).toEqual([
        'Enter',
        'Escape',
        'Tab',
        'F1',
      ]);
    });
  });
});
