import { useMemo, useTransition } from 'react';
import type { FolderInfo, SidebarProps } from '../types/folderTypes';
import { FolderList } from './FolderList';

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
  // フォルダ選択を非ブロッキングで処理、大量フォルダでもUIの応答性を維持
  const [isPending, startTransition] = useTransition();

  // フォルダ選択ハンドラーを最適化：大量フォルダでも応答性を維持
  const handleFolderSelect = useMemo(() => {
    if (!onFolderSelect) return onFolderSelect;
    return (folder: FolderInfo) => {
      startTransition(() => {
        onFolderSelect(folder);
      });
    };
  }, [onFolderSelect]);

  // コンテンツ表示の最適化：ローディング状態を統合
  const content = useMemo(() => {
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
        onFolderSelect={handleFolderSelect || onFolderSelect}
        onFolderDoubleClick={onFolderDoubleClick}
        thumbnailSize={thumbnailSize}
        showImageCount={showImageCount}
      />
    );
  }, [
    loading,
    isPending,
    folders,
    selectedFolder,
    handleFolderSelect,
    onFolderSelect,
    onFolderDoubleClick,
    thumbnailSize,
    showImageCount,
    emptyMessage,
  ]);

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
