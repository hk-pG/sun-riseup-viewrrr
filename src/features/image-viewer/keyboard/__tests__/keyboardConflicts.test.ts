import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  ActionType,
  KeyboardMapping,
  KeyboardShortcut,
} from '../../types/viewerTypes';
import {
  createCustomKeyboardMapping,
  createDefaultKeyboardMapping,
  findShortcutConflicts,
} from '../keyboardUtils';

describe('Keyboard Conflict Detection', () => {
  let mockOnAction =
    vi.fn<(action: ActionType, event: KeyboardEvent) => void>();

  beforeEach(() => {
    mockOnAction = vi.fn<(action: ActionType, event: KeyboardEvent) => void>();
  });

  describe('findShortcutConflicts', () => {
    describe('conflict detection scenarios', () => {
      it('should detect basic key conflicts', () => {
        const mapping: KeyboardMapping = {
          shortcuts: new Map([
            ['nextImage', [{ key: 'n', description: 'Next image' }]],
            ['previousImage', [{ key: 'n', description: 'Previous image' }]],
          ]),
          onAction: mockOnAction,
          enabled: true,
        };

        const conflicts = findShortcutConflicts(mapping);

        expect(conflicts).toHaveLength(1);
        expect(conflicts[0].shortcut.key).toBe('n');
        expect(conflicts[0].actions).toHaveLength(2);
        expect(conflicts[0].actions).toContain('nextImage');
        expect(conflicts[0].actions).toContain('previousImage');
      });

      it('should detect conflicts with identical modifier combinations', () => {
        const mapping: KeyboardMapping = {
          shortcuts: new Map([
            [
              'zoomIn',
              [
                {
                  key: 's',
                  ctrlKey: true,
                  shiftKey: true,
                  description: 'Zoom in',
                },
              ],
            ],
            [
              'zoomOut',
              [
                {
                  key: 's',
                  ctrlKey: true,
                  shiftKey: true,
                  description: 'Zoom out',
                },
              ],
            ],
          ]),
          onAction: mockOnAction,
          enabled: true,
        };

        const conflicts = findShortcutConflicts(mapping);

        expect(conflicts).toHaveLength(1);
        expect(conflicts[0].shortcut.key).toBe('s');
        expect(conflicts[0].shortcut.ctrlKey).toBe(true);
        expect(conflicts[0].shortcut.shiftKey).toBe(true);
        expect(conflicts[0].actions).toEqual(
          expect.arrayContaining(['zoomIn', 'zoomOut']),
        );
      });

      it('should not detect conflicts for different modifier combinations', () => {
        const mapping: KeyboardMapping = {
          shortcuts: new Map([
            ['zoomIn', [{ key: 's', ctrlKey: true, description: 'Ctrl+S' }]],
            ['zoomOut', [{ key: 's', shiftKey: true, description: 'Shift+S' }]],
            ['resetZoom', [{ key: 's', altKey: true, description: 'Alt+S' }]],
            ['rotateLeft', [{ key: 's', metaKey: true, description: 'Cmd+S' }]],
            ['rotateRight', [{ key: 's', description: 'Just S' }]],
          ]),
          onAction: mockOnAction,
          enabled: true,
        };

        const conflicts = findShortcutConflicts(mapping);
        expect(conflicts).toHaveLength(0);
      });

      it('should detect conflicts among multiple shortcuts for same action', () => {
        const mapping: KeyboardMapping = {
          shortcuts: new Map([
            [
              'nextImage',
              [
                { key: 'ArrowRight', description: 'Right arrow' },
                { key: ' ', description: 'Space' },
                { key: 'j', description: 'J key' },
              ],
            ],
            // Conflicts with nextImage's 'j'
            ['toggleControls', [{ key: 'j', description: 'Toggle controls' }]],
          ]),
          onAction: mockOnAction,
          enabled: true,
        };

        const conflicts = findShortcutConflicts(mapping);

        expect(conflicts).toHaveLength(1);
        expect(conflicts[0].shortcut.key).toBe('j');
        expect(conflicts[0].actions).toEqual(
          expect.arrayContaining(['nextImage', 'toggleControls']),
        );
      });

      it('should detect multiple separate conflicts', () => {
        const mapping: KeyboardMapping = {
          shortcuts: new Map([
            ['nextImage', [{ key: 'a', description: 'Next image' }]],
            ['previousImage', [{ key: 'a', description: 'Previous image' }]], // Conflict 1
            ['zoomIn', [{ key: 'b', ctrlKey: true, description: 'Zoom in' }]],
            ['zoomOut', [{ key: 'b', ctrlKey: true, description: 'Zoom out' }]], // Conflict 2
            ['resetZoom', [{ key: 'c', description: 'Reset zoom' }]], // No conflict
          ]),
          onAction: mockOnAction,
          enabled: true,
        };

        const conflicts = findShortcutConflicts(mapping);

        expect(conflicts).toHaveLength(2);

        const aConflict = conflicts.find((c) => c.shortcut.key === 'a');
        const bConflict = conflicts.find((c) => c.shortcut.key === 'b');

        expect(aConflict).toBeDefined();
        expect(aConflict?.actions).toEqual(
          expect.arrayContaining(['nextImage', 'previousImage']),
        );

        expect(bConflict).toBeDefined();
        expect(bConflict?.shortcut.ctrlKey).toBe(true);
        expect(bConflict?.actions).toEqual(
          expect.arrayContaining(['zoomIn', 'zoomOut']),
        );
      });

      it('should detect conflicts when multiple actions have overlapping shortcuts', () => {
        const mapping: KeyboardMapping = {
          shortcuts: new Map([
            [
              'nextImage',
              [
                { key: 'a', description: 'A key' },
                { key: 'b', description: 'B key' },
              ],
            ],
            [
              'previousImage',
              [
                { key: 'b', description: 'B key again' }, // Conflicts with nextImage
                { key: 'c', description: 'C key' },
              ],
            ],
            [
              'zoomIn',
              [
                { key: 'c', description: 'C key again' }, // Conflicts with previousImage
                { key: 'd', description: 'D key' },
              ],
            ],
          ]),
          onAction: mockOnAction,
          enabled: true,
        };

        const conflicts = findShortcutConflicts(mapping);

        expect(conflicts).toHaveLength(2);

        const bConflict = conflicts.find((c) => c.shortcut.key === 'b');
        const cConflict = conflicts.find((c) => c.shortcut.key === 'c');

        expect(bConflict?.actions).toEqual(
          expect.arrayContaining(['nextImage', 'previousImage']),
        );
        expect(cConflict?.actions).toEqual(
          expect.arrayContaining(['previousImage', 'zoomIn']),
        );
      });
    });

    describe('keyboard mapping validation', () => {
      it('should validate default keyboard mapping has no conflicts', () => {
        const defaultMapping = createDefaultKeyboardMapping(mockOnAction);
        const conflicts = findShortcutConflicts(defaultMapping);

        expect(conflicts).toHaveLength(0);
      });

      it('should detect conflicts in custom mappings that override defaults incorrectly', () => {
        const conflictingCustomShortcuts: Partial<
          Record<ActionType, KeyboardShortcut[]>
        > = {
          nextImage: [{ key: 'ArrowRight', description: 'Next' }],
          previousImage: [{ key: 'ArrowRight', description: 'Previous' }], // Same key!
        };

        const customMapping = createCustomKeyboardMapping(
          conflictingCustomShortcuts,
          mockOnAction,
        );
        const conflicts = findShortcutConflicts(customMapping);

        expect(conflicts.length).toBeGreaterThan(0);
        const arrowRightConflict = conflicts.find(
          (c) => c.shortcut.key === 'ArrowRight',
        );
        expect(arrowRightConflict).toBeDefined();
        expect(arrowRightConflict?.actions).toEqual(
          expect.arrayContaining(['nextImage', 'previousImage']),
        );
      });
    });

    describe('error scenarios', () => {
      it('should handle undefined modifier keys correctly', () => {
        const mapping: KeyboardMapping = {
          shortcuts: new Map([
            [
              'nextImage',
              [
                {
                  key: 'a',
                  ctrlKey: undefined,
                  shiftKey: false,
                  altKey: undefined,
                  description: 'Mixed modifiers',
                },
              ],
            ],
            [
              'previousImage',
              [
                {
                  key: 'a',
                  ctrlKey: false,
                  shiftKey: undefined,
                  altKey: false,
                  description: 'Different mixed modifiers',
                },
              ],
            ],
          ]),
          onAction: mockOnAction,
          enabled: true,
        };

        const conflicts = findShortcutConflicts(mapping);

        // Both should be treated as having no modifiers, so they should conflict
        expect(conflicts).toHaveLength(1);
        expect(conflicts[0].shortcut.key).toBe('a');
        expect(conflicts[0].actions).toEqual(
          expect.arrayContaining(['nextImage', 'previousImage']),
        );
      });
    });
  });
});
