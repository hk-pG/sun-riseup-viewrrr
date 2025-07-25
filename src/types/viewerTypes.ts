/**
 * 画像ファイルのファイルシステム上の情報を表す型。
 * - 画像のパスやファイル名、サイズ、更新日時などを保持する。
 * - UIで画像リストやサムネイル表示などに利用される。
 * - ImageSource（表示用リソース型）への変換元となることが多い。
 */
export interface ImageFile {
  path: string;
  name: string;
  size?: number;
  lastModified?: Date;
}

/**
 * フォルダ情報を表す型。
 * - フォルダのパスや名前、サムネイル画像、画像数などを保持する。
 * - サイドバーやフォルダリスト表示などで利用される。
 * - thumbnailImageはImageFile型を参照する。
 */
export interface FolderInfo {
  path: string;
  name: string;
  thumbnailImage?: ImageFile;
  imageCount?: number;
}

/**
 * メニュー項目の情報を表す型。
 * - メニューのID、ラベル、アイコン、ショートカット、サブメニューなどを保持する。
 * - HeaderMenuPropsやMenuDropdownProps、MenuItemPropsなどで利用される。
 */
export interface MenuAction {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  disabled?: boolean;
  submenu?: MenuAction[];
}

/**
 * ヘッダーメニューコンポーネントのprops型。
 * - メニュー項目（MenuAction型）やイベントハンドラなどを受け取る。
 */
export interface HeaderMenuProps {
  title?: string;
  menuActions: MenuAction[];
  onMenuAction: (actionId: string, action: MenuAction) => void;
  onOpenFolder?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * メニューアイテムコンポーネントのprops型。
 * - MenuAction型のactionを受け取る。
 */
export interface MenuItemProps {
  action: MenuAction;
  onAction: (actionId: string, action: MenuAction) => void;
  depth?: number;
}

/**
 * ドロップダウンメニューコンポーネントのprops型。
 * - MenuAction型の配列を受け取る。
 */
export interface MenuDropdownProps {
  actions: MenuAction[];
  onAction: (actionId: string, action: MenuAction) => void;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

/**
 * フォルダ表示コンポーネントのprops型。
 * - FolderInfo型のfolderを受け取る。
 */
export interface FolderViewProps {
  folder: FolderInfo;
  isSelected?: boolean;
  onClick: (folder: FolderInfo) => void;
  onDoubleClick?: (folder: FolderInfo) => void;
  thumbnailSize?: number;
  showImageCount?: boolean;
  className?: string;
}

/**
 * フォルダリストコンポーネントのprops型。
 * - FolderInfo型の配列を受け取る。
 */
export interface FolderListProps {
  folders: FolderInfo[];
  selectedFolder?: FolderInfo;
  onFolderSelect: (folder: FolderInfo) => void;
  onFolderDoubleClick?: (folder: FolderInfo) => void;
  thumbnailSize?: number;
  showImageCount?: boolean;
}

/**
 * サイドバーコンポーネントのprops型。
 * - FolderInfo型の配列を受け取る。
 */
export interface SidebarProps {
  folders: FolderInfo[];
  selectedFolder?: FolderInfo;
  onFolderSelect: (folder: FolderInfo) => void;
  onFolderDoubleClick?: (folder: FolderInfo) => void;
  width?: number;
  thumbnailSize?: number;
  showImageCount?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  style?: React.CSSProperties;
}
