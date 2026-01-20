import type { FolderInfo } from '../../types/folderTypes';
import { FolderList } from '../FolderList';

interface SidebarContentProps {
  /** フォルダ一覧 */
  folders: FolderInfo[];
  /** 選択中のフォルダ */
  selectedFolder?: FolderInfo;
  /** フォルダ選択時のコールバック */
  onFolderSelect?: (folder: FolderInfo) => void;
  /** フォルダダブルクリック時のコールバック */
  onFolderDoubleClick?: (folder: FolderInfo) => void;
  /** サムネイルサイズ（px） */
  thumbnailSize?: number;
  /** 画像数を表示するか */
  showImageCount?: boolean;
  /** ローディング中か */
  loading?: boolean;
  /** 切り替え中か（useTransition） */
  isPending?: boolean;
  /** フォルダがない場合のメッセージ */
  emptyMessage?: string;
}

/**
 * サイドバーのコンテンツ部分
 * ローディング状態、空状態、フォルダリストの表示を管理
 */
export function SidebarContent({
  folders,
  selectedFolder,
  onFolderSelect,
  onFolderDoubleClick,
  thumbnailSize,
  showImageCount,
  loading = false,
  isPending = false,
  emptyMessage = 'フォルダが見つかりません',
}: SidebarContentProps) {
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

  // フォルダがない場合
  if (folders.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center px-4">
        <div className="text-center text-muted-foreground text-sm">
          {emptyMessage}
        </div>
      </div>
    );
  }

  // フォルダリスト表示
  return (
    <FolderList
      folders={folders}
      selectedFolder={selectedFolder}
      onFolderSelect={
        onFolderSelect ??
        (() => {
          /* noop */
        })
      }
      onFolderDoubleClick={onFolderDoubleClick}
      thumbnailSize={thumbnailSize}
      showImageCount={showImageCount}
    />
  );
}
