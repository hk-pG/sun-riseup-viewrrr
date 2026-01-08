import { useEffect, useTransition } from 'react';
import { useServices } from '../../../shared/context/ServiceContext';
import type { FolderInfo, SidebarProps } from '../types/folderTypes';
import { FolderList } from './FolderList';

/**
 * 可視領域のフォルダパスを取得（簡易実装）
 * TODO: 実際の可視領域を検出する場合はIntersection Observer APIを使用
 */
function getVisibleFolderPaths(
  folders: FolderInfo[],
  visibleCount: number,
): string[] {
  return folders.slice(0, visibleCount).map((f) => f.path);
}

/**
 * フォルダの最初の画像パスを取得
 */
async function getFirstImagePath(
  folderPath: string,
  fs: ReturnType<typeof useServices>,
): Promise<string | null> {
  try {
    const files = await fs.listImagesInFolder(folderPath);
    return files.length > 0 ? files[0] : null;
  } catch {
    return null;
  }
}

export function Sidebar({
  folders,
  selectedFolder,
  onFolderSelect,
  onFolderDoubleClick,
  width = 250,
  thumbnailSize = 100,
  showImageCount = true,
  loading = false,
  emptyMessage = 'フォルダが見つかりません',
  className = '',
  style,
}: SidebarProps) {
  const fs = useServices();
  // フォルダ選択を非ブロッキングで処理、大量フォルダでもUIの応答性を維持
  const [isPending, startTransition] = useTransition();

  // バッチプリフェッチ: 可視領域のサムネイルを優先生成
  useEffect(() => {
    if (folders.length === 0 || !fs.batchCreateThumbnails) return;

    const prefetchThumbnails = async () => {
      const visibleFolders = getVisibleFolderPaths(folders, 10);

      // 各フォルダの最初の画像パスを取得
      const imagePathPromises = visibleFolders.map((folderPath) =>
        getFirstImagePath(folderPath, fs),
      );
      const imagePaths = (await Promise.all(imagePathPromises)).filter(
        (path): path is string => path !== null,
      );

      if (imagePaths.length === 0) return;

      // バッチ生成を実行（優先度付き）
      try {
        await fs.batchCreateThumbnails?.(imagePaths, imagePaths.length);
      } catch (error) {
        console.warn('Batch thumbnail prefetch failed:', error);
      }
    };

    prefetchThumbnails();
  }, [folders, fs]);

  // フォルダ選択ハンドラー：大量フォルダでも応答性を維持（非ブロッキング更新）
  const handleFolderSelect = (folder: FolderInfo) => {
    if (!onFolderSelect) return;
    startTransition(() => {
      onFolderSelect(folder);
    });
  };

  // コンテンツ表示（ローディング状態を統合）
  const content = (() => {
    // 初期読み込みまたはフォルダ選択処理中の表示
    if (loading || isPending) {
      return (
        <div className="flex h-32 items-center justify-center">
          <div className="text-muted-foreground">
            {loading ? '読み込み中...' : 'フォルダを切り替え中...'}
          </div>
        </div>
      );
    }

    if (folders.length === 0) {
      return (
        <div className="flex h-32 items-center justify-center px-4">
          <div className="text-center text-muted-foreground text-sm">
            {emptyMessage}
          </div>
        </div>
      );
    }

    return (
      <FolderList
        folders={folders}
        selectedFolder={selectedFolder}
        onFolderSelect={handleFolderSelect}
        onFolderDoubleClick={onFolderDoubleClick}
        thumbnailSize={thumbnailSize}
        showImageCount={showImageCount}
      />
    );
  })();

  return (
    <aside
      className={`overflow-y-auto border-sidebar-border bg-sidebar text-sidebar-foreground ${className}`}
      style={{ width, ...style }}
    >
      <div className="p-2">
        <h2 className="mb-3 px-2 font-semibold text-sidebar-foreground text-sm">
          フォルダ一覧
        </h2>
        {content}
      </div>
    </aside>
  );
}
