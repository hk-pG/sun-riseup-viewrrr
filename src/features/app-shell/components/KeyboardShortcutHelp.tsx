'use client';

import { useState } from 'react';
import {
  getShortcutDescription,
  getShortcutList,
} from '../../../shared/utils/keyboardUtils';
import type {
  KeyboardMapping,
  KeyboardShortcut,
} from '../../image-viewer/types/viewerTypes';

interface KeyboardShortcutHelpProps {
  mapping: KeyboardMapping;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function KeyboardShortcutHelp({
  mapping,
  isOpen,
  onClose,
  className = '',
}: KeyboardShortcutHelpProps) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const shortcutList = getShortcutList(mapping);
  const filteredList = shortcutList.filter(
    (item: { action: string; descriptions: string[] }) =>
      item.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.descriptions.some((desc: string) =>
        desc.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  const actionLabels: Record<string, string> = {
    nextImage: '次の画像',
    previousImage: '前の画像',
    firstImage: '最初の画像',
    lastImage: '最後の画像',
    zoomIn: 'ズームイン',
    zoomOut: 'ズームアウト',
    resetZoom: 'ズームリセット',
    rotateRight: '右回転',
    rotateLeft: '左回転',
    resetRotation: '回転リセット',
    toggleFullscreen: 'フルスクリーン切り替え',
    toggleControls: 'コントロール表示切り替え',
    toggleFitMode: '表示モード切り替え',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div
        className={`mx-4 max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-lg bg-card text-card-foreground shadow-xl ${className}`}
      >
        <div className="border-border border-b p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-card-foreground text-xl">
              キーボードショートカット
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-2xl text-muted-foreground leading-none hover:text-accent-foreground"
              aria-label="閉じる"
            >
              ×
            </button>
          </div>

          <input
            type="text"
            placeholder="ショートカットを検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="max-h-96 overflow-y-auto p-6">
          {filteredList.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {searchTerm
                ? '検索結果が見つかりません'
                : 'ショートカットが設定されていません'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredList.map(
                (item: { action: string; shortcuts: KeyboardShortcut[] }) => (
                  <div
                    key={item.action}
                    className="border-border border-b pb-3 last:border-b-0"
                  >
                    <h3 className="mb-2 font-medium text-card-foreground">
                      {actionLabels[item.action] || item.action}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {item.shortcuts.map((shortcut: KeyboardShortcut) => (
                        <span
                          key={shortcut.key || JSON.stringify(shortcut)}
                          className="inline-flex items-center rounded border bg-secondary px-2 py-1 text-secondary-foreground text-sm"
                        >
                          {getShortcutDescription(shortcut)}
                        </span>
                      ))}
                    </div>
                    {item.shortcuts[0]?.description && (
                      <p className="mt-1 text-gray-500 text-sm">
                        {item.shortcuts[0].description}
                      </p>
                    )}
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        <div className="border-gray-200 border-t bg-gray-50 p-4">
          <p className="text-center text-gray-600 text-sm">
            設定は呼び出し元で変更できます
          </p>
        </div>
      </div>
    </div>
  );
}
