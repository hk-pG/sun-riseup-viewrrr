import type React from 'react';

import { useEffect } from 'react';
import type {
  ActionType,
  KeyboardMapping,
  KeyboardShortcut,
} from '../types/viewerTypes';

/**
 * 指定したコンテナ要素内でキーボードショートカットを処理するためのReactカスタムフック。
 *
 * このフックは、指定されたcontainerRefに対してkeydownイベントリスナーを登録し、
 * ショートカット定義とキーボードイベントを照合して、該当するアクションをコールバックで通知します。
 *
 * @param keyboardMapping - キーボードショートカットの設定オブジェクト。
 *   - `enabled`: ショートカット有効/無効フラグ
 *   - `shortcuts`: アクション種別ごとのショートカット定義Map
 *   - `onAction`: 一致時に呼ばれるコールバック関数
 * @param containerRef - キーボードイベントを監視するコンテナ要素（HTMLElementやHTMLButtonElement等）へのReactのrefオブジェクト
 *
 * @remarks
 * - keyやmodifier（ctrl/shift/alt/meta）まで含めて完全一致した場合のみアクションが発火します。
 * - preventDefaultが明示的にfalseでなければ、デフォルトのブラウザ動作は抑止されます。
 * - イベントリスナーはコンポーネントのアンマウントやcontainerRefの変更時に自動でクリーンアップされます。
 *
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 * useKeyboardHandler(keyboardMapping, containerRef);
 * ```
 */
export const useKeyboardHandler = (
  keyboardMapping: KeyboardMapping | undefined,
  containerRef: React.RefObject<HTMLElement | HTMLButtonElement | null>,
) => {
  // イベントリスナーの登録・解除（containerRefやkeyboardMappingの変更時に再登録）
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // イベントハンドラをuseEffect内に定義して、最新のkeyboardMappingを参照する
    const onKeyDown = (event: KeyboardEvent) => {
      // キーボードショートカットが無効なら何もしない
      const enabled = keyboardMapping?.enabled ?? false;
      if (!enabled) return;

      const isKeyboardEventMatch = (
        event: KeyboardEvent,
        shortcut: KeyboardShortcut,
      ): boolean => {
        return (
          event.key === shortcut.key &&
          !!event.ctrlKey === !!shortcut.ctrlKey &&
          !!event.shiftKey === !!shortcut.shiftKey &&
          !!event.altKey === !!shortcut.altKey &&
          !!event.metaKey === !!shortcut.metaKey
        );
      };

      const findMatchingAction = (
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
      };

      const matchedAction = findMatchingAction(
        event,
        keyboardMapping?.shortcuts ?? new Map(),
      );

      if (!matchedAction) return;

      const isPreventDefault = keyboardMapping?.shortcuts
        .get(matchedAction)
        ?.find((shortcut) =>
          isKeyboardEventMatch(event, shortcut),
        )?.preventDefault;

      if (isPreventDefault) {
        event.preventDefault();
      }

      keyboardMapping?.onAction(matchedAction, event);
    };

    container.addEventListener('keydown', onKeyDown as EventListener);
    return () => {
      container.removeEventListener('keydown', onKeyDown as EventListener);
    };
  }, [
    containerRef,
    keyboardMapping?.enabled,
    keyboardMapping?.shortcuts,
    keyboardMapping?.onAction,
  ]);
};
