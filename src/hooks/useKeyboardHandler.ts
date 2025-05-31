'use client';

import type React from 'react';

import { useCallback, useEffect } from 'react';
import type {
  ActionType,
  KeyboardMapping,
  KeyboardShortcut,
} from '../types/viewerTypes';

export const useKeyboardHandler = (
  keyboardMapping: KeyboardMapping | undefined,
  containerRef: React.RefObject<HTMLElement>,
) => {
  const findMatchingAction = useCallback(
    (
      event: KeyboardEvent,
      shortcuts: Map<ActionType, KeyboardShortcut[]>,
    ): ActionType | null => {
      for (const [action, shortcutList] of shortcuts.entries()) {
        for (const shortcut of shortcutList) {
          if (isKeyboardEventMatch(event, shortcut)) {
            return action;
          }
        }
      }
      return null;
    },
    [],
  );

  const isKeyboardEventMatch = useCallback(
    (event: KeyboardEvent, shortcut: KeyboardShortcut): boolean => {
      return (
        event.key === shortcut.key &&
        !!event.ctrlKey === !!shortcut.ctrlKey &&
        !!event.shiftKey === !!shortcut.shiftKey &&
        !!event.altKey === !!shortcut.altKey &&
        !!event.metaKey === !!shortcut.metaKey
      );
    },
    [],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!keyboardMapping?.enabled) return;

      const matchedAction = findMatchingAction(
        event,
        keyboardMapping.shortcuts,
      );
      if (matchedAction) {
        if (
          keyboardMapping.shortcuts.get(matchedAction)?.[0]?.preventDefault !==
          false
        ) {
          event.preventDefault();
        }
        keyboardMapping.onAction(matchedAction, event);
      }
    },
    [keyboardMapping, findMatchingAction],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, containerRef]);
};
