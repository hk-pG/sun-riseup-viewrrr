import { ask, message } from '@tauri-apps/plugin-dialog';
import { check } from '@tauri-apps/plugin-updater';
import { useEffect } from 'react';

const UPDATE_CHECK_DELAY_MS = 3000;

/**
 * アプリ起動時に自動でアップデートを確認するフック。
 *
 * - 開発環境（import.meta.env.DEV）ではスキップ
 * - アップデートが見つかった場合はダイアログで確認し、同意があればインストール
 * - エラーはコンソールに記録するのみで、アプリの動作には影響しない
 */
export function useAutoUpdate(): void {
  useEffect(() => {
    // 開発環境ではアップデートチェックをスキップ
    if (import.meta.env.DEV) return;

    const checkForUpdates = async () => {
      try {
        const update = await check();
        if (update === null) {
          console.debug('アップデートはありません');
          return;
        }

        const notesSection = update.body ? `\n\n更新内容:\n${update.body}` : '';
        const shouldInstall = await ask(
          `v${update.version} に更新できます。${notesSection}\n\n今すぐダウンロード・インストールしますか？`,
          {
            title: '新しいバージョンがあります',
            kind: 'info',
          },
        );

        if (!shouldInstall) return;

        await update.downloadAndInstall();

        await message(
          'インストールが完了しました。アプリを再起動してください。',
          {
            title: 'インストール完了',
            kind: 'info',
          },
        );
      } catch (error) {
        // ネットワークエラーや設定ミスなどはコンソールに記録するのみ
        console.error('アップデートチェックに失敗しました:', error);
      }
    };

    // アプリの初期化が完了してからチェックを開始
    const timer = setTimeout(checkForUpdates, UPDATE_CHECK_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);
}
