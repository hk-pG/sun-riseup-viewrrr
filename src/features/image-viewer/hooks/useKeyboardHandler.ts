import type React from 'react';

import { useCallback, useEffect } from 'react';
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
  containerRef: React.RefObject<HTMLElement | HTMLButtonElement>,
) => {
  // あらかじめ定義したショートカットと押下されたキーイベントが一致するか判定
  const isKeyboardEventMatch = useCallback(
    (event: KeyboardEvent, shortcut: KeyboardShortcut): boolean => {
      // key, 各種modifier(ctrl/shift/alt/meta)が全て一致する場合のみtrue
      return (
        // key
        event.key === shortcut.key &&
        // modifier keys
        !!event.ctrlKey === !!shortcut.ctrlKey &&
        !!event.shiftKey === !!shortcut.shiftKey &&
        !!event.altKey === !!shortcut.altKey &&
        !!event.metaKey === !!shortcut.metaKey
      );
    },
    [],
  );

  // イベントにマッチするアクション名をショートカット定義から検索
  const findMatchingAction = useCallback(
    (
      event: KeyboardEvent,
      shortcuts: Map<ActionType, KeyboardShortcut[]>,
    ): ActionType | null => {
      for (const [action, shortcutList] of shortcuts.entries()) {
        for (const shortcut of shortcutList) {
          if (isKeyboardEventMatch(event, shortcut)) {
            // 最初に一致したアクション名を返す
            return action;
          }
        }
      }
      // 一致しなければnull
      return null;
    },
    [isKeyboardEventMatch],
  );

  // keydownイベントハンドラ本体
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // キーボードショートカットが無効なら何もしない
      if (!keyboardMapping?.enabled) return;

      // マッチするアクションを検索
      const matchedAction = findMatchingAction(
        event,
        keyboardMapping.shortcuts,
      );

      if (!matchedAction) return;

      const isPreventDefault = (
        keyboardMapping: KeyboardMapping,
        matchedAction: string,
      ) => {
        // return keyboardMapping.shortcuts.get(matchedAction)?.[0]?.preventDefault !== false
        // 0番目ではなく、マッチしたショートカットのpreventDefaultを参照するように修正
        return keyboardMapping.shortcuts
          .get(matchedAction)
          ?.find((shortcut) => isKeyboardEventMatch(event, shortcut))
          ?.preventDefault;
      };

      // preventDefaultが明示的にfalseでなければデフォルト動作を抑止
      if (isPreventDefault(keyboardMapping, matchedAction)) {
        event.preventDefault();
      }
      // 対応するアクションをコールバックで通知
      keyboardMapping.onAction(matchedAction, event);
    },
    [keyboardMapping, findMatchingAction],
  );

  // イベントリスナーの登録・解除（containerRefが変わるたびに再登録）
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // keydownイベントをcontainerに登録
    container.addEventListener('keydown', (e) => {
      handleKeyDown(e as KeyboardEvent);
    });
    return () => {
      // クリーンアップ時にイベントリスナーを解除
      container.removeEventListener('keydown', (e) => {
        handleKeyDown(e as KeyboardEvent);
      });
    };
  }, [handleKeyDown, containerRef]);
};
