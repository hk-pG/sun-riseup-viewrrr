'use client';

import type React from 'react';
import { useState } from 'react';
import {
  getShortcutDescription,
  getShortcutList,
} from '../../utils/keyboardUtils';
import type { KeyboardMapping, KeyboardShortcut } from '../types/viewerTypes';

interface KeyboardShortcutHelpProps {
  mapping: KeyboardMapping;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const KeyboardShortcutHelp: React.FC<KeyboardShortcutHelpProps> = ({
  mapping,
  isOpen,
  onClose,
  className = '',
}) => {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden ${className}`}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              キーボードショートカット
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          {filteredList.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
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
                    className="border-b border-gray-100 pb-3 last:border-b-0"
                  >
                    <h3 className="font-medium text-gray-800 mb-2">
                      {actionLabels[item.action] || item.action}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {item.shortcuts.map((shortcut: KeyboardShortcut) => (
                        <span
                          key={shortcut.key || JSON.stringify(shortcut)}
                          className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded border"
                        >
                          {getShortcutDescription(shortcut)}
                        </span>
                      ))}
                    </div>
                    {item.shortcuts[0]?.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {item.shortcuts[0].description}
                      </p>
                    )}
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            設定は呼び出し元で変更できます
          </p>
        </div>
      </div>
    </div>
  );
};
