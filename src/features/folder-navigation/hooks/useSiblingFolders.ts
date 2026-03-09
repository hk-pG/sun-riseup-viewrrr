import { startTransition, useEffect, useState } from 'react';
import { useServices } from '../../../shared/context/ServiceContext';
import type { FileSystemService } from '..';
import { getSiblingFolderEntries } from '../services/getSiblingFolders';

export type FolderEntry = {
  name: string;
  path: string;
};

export async function createFolderEntry(
  dirPath: string,
  fs: FileSystemService,
) {
  return {
    path: dirPath,
    name: await fs.getBaseName(dirPath),
  };
}

/**
 * 指定のフォルダと同階層にあるフォルダを取得し、
 * 各フォルダの最初の画像を使ったサムネイルを取得する
 *
 * @param currentFolderPath - 現在のフォルダのパス
 * @returns - 同階層のフォルダのパスと、各フォルダのサムネイル
 */
export function useSiblingFolders(currentFolderPath: string) {
  // 同階層のフォルダ情報（パス・名前）のリストを保持するstate
  const [entries, setEntries] = useState<FolderEntry[]>([]);
  // エラー状態を保持するstate
  const [error, setError] = useState<Error | null>(null);

  // ファイルシステム関連のサービスを取得
  const fs = useServices();

  useEffect(() => {
    let mounted = true;

    // 指定フォルダと同階層のフォルダ一覧を取得し、各フォルダ名を取得してstateにセットする
    async function load() {
      if (!mounted) return;

      try {
        // エラーをリセット
        setError(null);

        // 各フォルダパスからフォルダ名を取得し、FolderEntry配列を生成
        const entries = await getSiblingFolderEntries(currentFolderPath, fs);

        if (!mounted) return;

        // 非緊急な状態更新
        startTransition(() => {
          setEntries(entries);
        });
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    }

    // 副作用としてデータ取得処理を実行
    load();

    // アンマウント時のクリーンアップ
    return () => {
      mounted = false;
    };
  }, [currentFolderPath, fs]);

  return { entries, error };
}
