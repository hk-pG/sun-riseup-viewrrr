import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  ActionType,
  KeyboardMapping,
  KeyboardShortcut,
} from '../../../features/image-viewer/types/viewerTypes';
import {
  createCustomKeyboardMapping,
  createDefaultKeyboardMapping,
  findShortcutConflicts,
} from '../keyboardUtils';

describe('Keyboard Conflict Detection', () => {
  let mockOnAction: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnAction = vi.fn();
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
            ['action1', [{ key: 's', ctrlKey: true, description: 'Ctrl+S' }]],
            ['action2', [{ key: 's', shiftKey: true, description: 'Shift+S' }]],
            ['action3', [{ key: 's', altKey: true, description: 'Alt+S' }]],
            ['action4', [{ key: 's', metaKey: true, description: 'Cmd+S' }]],
            ['action5', [{ key: 's', description: 'Just S' }]],
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
            ['customAction', [{ key: 'j', description: 'Custom J' }]], // Conflicts with nextImage's 'j'
          ]),
          onAction: mockOnAction,
          enabled: true,
        };

        const conflicts = findShortcutConflicts(mapping);

        expect(conflicts).toHaveLength(1);
        expect(conflicts[0].shortcut.key).toBe('j');
        expect(conflicts[0].actions).toEqual(
          expect.arrayContaining(['nextImage', 'customAction']),
        );
      });

      it('should detect multiple separate conflicts', () => {
        const mapping: KeyboardMapping = {
          shortcuts: new Map([
            ['action1', [{ key: 'a', description: 'Action 1' }]],
            ['action2', [{ key: 'a', description: 'Action 2' }]], // Conflict 1
            ['action3', [{ key: 'b', ctrlKey: true, description: 'Action 3' }]],
            ['action4', [{ key: 'b', ctrlKey: true, description: 'Action 4' }]], // Conflict 2
            ['action5', [{ key: 'c', description: 'Action 5' }]], // No conflict
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
          expect.arrayContaining(['action1', 'action2']),
        );

        expect(bConflict).toBeDefined();
        expect(bConflict?.shortcut.ctrlKey).toBe(true);
        expect(bConflict?.actions).toEqual(
          expect.arrayContaining(['action3', 'action4']),
        );
      });

      it('should detect conflicts with complex modifier combinations', () => {
        const complexShortcut: KeyboardShortcut = {
          key: 'x',
          ctrlKey: true,
          shiftKey: true,
          altKey: true,
          metaKey: true,
          description: 'Complex shortcut',
        };

        const mapping: KeyboardMapping = {
          shortcuts: new Map([
            ['action1', [complexShortcut]],
            [
              'action2',
              [{ ...complexShortcut, description: 'Another complex' }],
            ],
          ]),
          onAction: mockOnAction,
          enabled: true,
        };

        const conflicts = findShortcutConflicts(mapping);

        expect(conflicts).toHaveLength(1);
        expect(conflicts[0].shortcut.key).toBe('x');
        expect(conflicts[0].shortcut.ctrlKey).toBe(true);
        expect(conflicts[0].shortcut.shiftKey).toBe(true);
        expect(conflicts[0].shortcut.altKey).toBe(true);
        expect(conflicts[0].shortcut.metaKey).toBe(true);
      });
    });

    describe('multiple shortcuts per action', () => {
      it('should handle actions with multiple shortcuts correctly', () => {
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
            [
              'previousImage',
              [
                { key: 'ArrowLeft', description: 'Left arrow' },
                { key: 'k', description: 'K key' },
              ],
            ],
            [
              'zoomIn',
              [
                { key: '+', description: 'Plus' },
                { key: '=', description: 'Equals' },
              ],
            ],
          ]),
          onAction: mockOnAction,
          enabled: true,
        };

        const conflicts = findShortcutConflicts(mapping);
        expect(conflicts).toHaveLength(0);
      });

      it('should detect conflicts when one action has multiple shortcuts and another conflicts with one', () => {
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
            ['customAction', [{ key: ' ', description: 'Custom space' }]], // Conflicts with nextImage space
          ]),
          onAction: mockOnAction,
          enabled: true,
        };

        const conflicts = findShortcutConflicts(mapping);

        expect(conflicts).toHaveLength(1);
        expect(conflicts[0].shortcut.key).toBe(' ');
        expect(conflicts[0].actions).toEqual(
          expect.arrayContaining(['nextImage', 'customAction']),
        );
      });

      it('should detect conflicts when multiple actions have overlapping shortcuts', () => {
        const mapping: KeyboardMapping = {
          shortcuts: new Map([
            [
              'action1',
              [
                { key: 'a', description: 'A key' },
                { key: 'b', description: 'B key' },
              ],
            ],
            [
              'action2',
              [
                { key: 'b', description: 'B key again' }, // Conflicts with action1
                { key: 'c', description: 'C key' },
              ],
            ],
            [
              'action3',
              [
                { key: 'c', description: 'C key again' }, // Conflicts with action2
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
          expect.arrayContaining(['action1', 'action2']),
        );
        expect(cConflict?.actions).toEqual(
          expect.arrayContaining(['action2', 'action3']),
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

      it('should handle empty shortcuts gracefully', () => {
        const emptyMapping: KeyboardMapping = {
          shortcuts: new Map(),
          onAction: mockOnAction,
          enabled: true,
        };

        const conflicts = findShortcutConflicts(emptyMapping);
        expect(conflicts).toHaveLength(0);
      });

      it('should handle single action mappings without conflicts', () => {
        const singleActionMapping: KeyboardMapping = {
          shortcuts: new Map([
            ['onlyAction', [{ key: 'x', description: 'Only action' }]],
          ]),
          onAction: mockOnAction,
          enabled: true,
        };

        const conflicts = findShortcutConflicts(singleActionMapping);
        expect(conflicts).toHaveLength(0);
      });
    });

    describe('error scenarios', () => {
      it('should handle malformed shortcuts gracefully', () => {
        const malformedMapping: KeyboardMapping = {
          shortcuts: new Map([
            ['action1', [{ key: '', description: 'Empty key' }]], // Empty key
            ['action2', [{ key: 'a', description: 'Normal key' }]],
          ]),
          onAction: mockOnAction,
          enabled: true,
        };

        expect(() => {
          const conflicts = findShortcutConflicts(malformedMapping);
          expect(Array.isArray(conflicts)).toBe(true);
        }).not.toThrow();
      });

      it('should handle undefined modifier keys correctly', () => {
        const mapping: KeyboardMapping = {
          shortcuts: new Map([
            [
              'action1',
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
              'action2',
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
          expect.arrayContaining(['action1', 'action2']),
        );
      });

      it('should handle large numbers of conflicting actions', () => {
        const shortcuts = new Map<ActionType, KeyboardShortcut[]>();
        const expectedActions: ActionType[] = [];

        // Create 10 actions all using the same shortcut
        for (let i = 1; i <= 10; i++) {
          const action = `action${i}` as ActionType;
          shortcuts.set(action, [{ key: 'x', description: `Action ${i}` }]);
          expectedActions.push(action);
        }

        const massConflictMapping: KeyboardMapping = {
          shortcuts,
          onAction: mockOnAction,
          enabled: true,
        };

        const conflicts = findShortcutConflicts(massConflictMapping);

        expect(conflicts).toHaveLength(1);
        expect(conflicts[0].shortcut.key).toBe('x');
        expect(conflicts[0].actions).toHaveLength(10);
        expectedActions.forEach((action) => {
          expect(conflicts[0].actions).toContain(action);
        });
      });
    });

    describe('conflict reporting format', () => {
      it('should return conflicts in expected format', () => {
        const mapping: KeyboardMapping = {
          shortcuts: new Map([
            ['action1', [{ key: 'a', ctrlKey: true, description: 'Action 1' }]],
            ['action2', [{ key: 'a', ctrlKey: true, description: 'Action 2' }]],
          ]),
          onAction: mockOnAction,
          enabled: true,
        };

        const conflicts = findShortcutConflicts(mapping);

        expect(conflicts).toHaveLength(1);

        const conflict = conflicts[0];
        expect(conflict).toHaveProperty('shortcut');
        expect(conflict).toHaveProperty('actions');

        expect(typeof conflict.shortcut).toBe('object');
        expect(conflict.shortcut).toHaveProperty('key');
        expect(Array.isArray(conflict.actions)).toBe(true);

        expect(conflict.shortcut.key).toBe('a');
        expect(conflict.shortcut.ctrlKey).toBe(true);
        expect(conflict.actions).toHaveLength(2);
      });

      it('should preserve all shortcut properties in conflict report', () => {
        const complexShortcut: KeyboardShortcut = {
          key: 'z',
          ctrlKey: true,
          shiftKey: true,
          altKey: true,
          metaKey: true,
          preventDefault: false,
          description: 'Complex shortcut',
        };

        const mapping: KeyboardMapping = {
          shortcuts: new Map([
            ['action1', [complexShortcut]],
            [
              'action2',
              [{ ...complexShortcut, description: 'Another complex' }],
            ],
          ]),
          onAction: mockOnAction,
          enabled: true,
        };

        const conflicts = findShortcutConflicts(mapping);
        const conflict = conflicts[0];

        expect(conflict.shortcut.key).toBe('z');
        expect(conflict.shortcut.ctrlKey).toBe(true);
        expect(conflict.shortcut.shiftKey).toBe(true);
        expect(conflict.shortcut.altKey).toBe(true);
        expect(conflict.shortcut.metaKey).toBe(true);
        // Note: preventDefault and description are not part of the conflict detection
      });
    });
  });
});
