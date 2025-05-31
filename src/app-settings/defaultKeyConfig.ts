import type {
  ActionType,
  KeyboardMapping,
  KeyboardShortcut,
} from '../types/viewerTypes';

// デフォルトのキーボードショートカット設定
export const createDefaultKeyboardMapping = (
  onAction: (action: ActionType, event: KeyboardEvent) => void,
): KeyboardMapping => {
  const shortcuts = new Map<ActionType, KeyboardShortcut[]>([
    [
      'nextImage',
      [
        { key: 'ArrowRight', description: '次の画像' },
        { key: ' ', description: '次の画像（スペース）' },
        { key: 'j', description: '次の画像' },
      ],
    ],
    [
      'previousImage',
      [
        { key: 'ArrowLeft', description: '前の画像' },
        { key: 'k', description: '前の画像' },
      ],
    ],
    [
      'firstImage',
      [
        { key: 'Home', description: '最初の画像' },
        { key: 'g', description: '最初の画像' },
      ],
    ],
    [
      'lastImage',
      [
        { key: 'End', description: '最後の画像' },
        { key: 'G', shiftKey: true, description: '最後の画像' },
      ],
    ],
    [
      'zoomIn',
      [
        { key: '+', description: 'ズームイン' },
        { key: '=', description: 'ズームイン' },
        { key: 'ArrowUp', ctrlKey: true, description: 'ズームイン' },
      ],
    ],
    [
      'zoomOut',
      [
        { key: '-', description: 'ズームアウト' },
        { key: 'ArrowDown', ctrlKey: true, description: 'ズームアウト' },
      ],
    ],
    [
      'resetZoom',
      [
        { key: '0', description: 'ズームリセット' },
        { key: '1', description: 'ズームリセット' },
      ],
    ],
    [
      'rotateRight',
      [
        { key: 'r', description: '右回転' },
        { key: 'ArrowRight', ctrlKey: true, description: '右回転' },
      ],
    ],
    [
      'rotateLeft',
      [
        { key: 'R', shiftKey: true, description: '左回転' },
        { key: 'ArrowLeft', ctrlKey: true, description: '左回転' },
      ],
    ],
    [
      'resetRotation',
      [{ key: 'r', ctrlKey: true, description: '回転リセット' }],
    ],
    [
      'toggleFullscreen',
      [
        { key: 'f', description: 'フルスクリーン切り替え' },
        { key: 'F11', description: 'フルスクリーン切り替え' },
      ],
    ],
    [
      'toggleControls',
      [
        { key: 'c', description: 'コントロール表示切り替え' },
        { key: 'Tab', description: 'コントロール表示切り替え' },
      ],
    ],
    [
      'toggleFitMode',
      [
        { key: 'w', description: '表示モード切り替え' },
        { key: 'Enter', description: '表示モード切り替え' },
      ],
    ],
  ]);

  return {
    shortcuts,
    onAction,
    enabled: true,
  };
};

// カスタムキーボードマッピングを作成するヘルパー
export const createCustomKeyboardMapping = (
  customShortcuts: Partial<Record<ActionType, KeyboardShortcut[]>>,
  onAction: (action: ActionType, event: KeyboardEvent) => void,
  baseMapping?: KeyboardMapping,
): KeyboardMapping => {
  const shortcuts = new Map(
    baseMapping?.shortcuts || createDefaultKeyboardMapping(onAction).shortcuts,
  );

  // カスタムショートカットを追加/上書き
  for (const [action, shortcutList] of Object.entries(customShortcuts)) {
    if (shortcutList) {
      shortcuts.set(action as ActionType, shortcutList);
    }
  }

  return {
    shortcuts,
    onAction,
    enabled: true,
  };
};

// キーボードショートカットの説明を取得
export const getShortcutDescription = (shortcut: KeyboardShortcut): string => {
  const modifiers = [];
  if (shortcut.ctrlKey) modifiers.push('Ctrl');
  if (shortcut.shiftKey) modifiers.push('Shift');
  if (shortcut.altKey) modifiers.push('Alt');
  if (shortcut.metaKey) modifiers.push('Cmd');

  const keyDisplay = shortcut.key === ' ' ? 'Space' : shortcut.key;
  return modifiers.length > 0
    ? `${modifiers.join('+')}+${keyDisplay}`
    : keyDisplay;
};

// キーボードショートカット一覧を取得
export const getShortcutList = (
  mapping: KeyboardMapping,
): Array<{
  action: ActionType;
  shortcuts: KeyboardShortcut[];
  descriptions: string[];
}> => {
  return Array.from(
    mapping.shortcuts.entries() as Iterable<[ActionType, KeyboardShortcut[]]>,
  ).map(([action, shortcuts]) => ({
    action,
    shortcuts,
    descriptions: shortcuts.map(
      (s) => s.description || getShortcutDescription(s),
    ),
  }));
};

// 競合するキーボードショートカットをチェック
export const findShortcutConflicts = (
  mapping: KeyboardMapping,
): Array<{
  shortcut: KeyboardShortcut;
  actions: ActionType[];
}> => {
  const shortcutToActions = new Map<string, ActionType[]>();

  for (const [action, shortcuts] of mapping.shortcuts) {
    for (const shortcut of shortcuts) {
      const key = JSON.stringify({
        key: shortcut.key,
        ctrlKey: !!shortcut.ctrlKey,
        shiftKey: !!shortcut.shiftKey,
        altKey: !!shortcut.altKey,
        metaKey: !!shortcut.metaKey,
      });

      if (!shortcutToActions.has(key)) {
        shortcutToActions.set(key, []);
      }
      shortcutToActions.get(key)?.push(action);
    }
  }

  const conflicts: Array<{
    shortcut: KeyboardShortcut;
    actions: ActionType[];
  }> = [];

  for (const [key, actions] of shortcutToActions) {
    if (actions.length > 1) {
      const shortcut = JSON.parse(key) as KeyboardShortcut;
      conflicts.push({ shortcut, actions });
    }
  }

  return conflicts;
};
