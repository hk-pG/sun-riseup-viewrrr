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
export interface AppMenuBarProps {
  title?: string;
  onMenuAction: (actionId: string) => void;
  onOpenFolder?: () => void;
  isDraggable?: boolean;
  className?: string;
  style?: React.CSSProperties;
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

/**
 * 画像ビューアの表示設定を表す型。
 * - ズーム、回転、背景色、コントロール表示などの設定を保持する。
 * - ImageViewerPropsやImageDisplayPropsで利用される。
 */
export interface ViewerSettings {
  fitMode: 'width' | 'height' | 'both' | 'none';
  zoom: number;
  rotation: number;
  backgroundColor: string;
  showControls: boolean;
  autoHideControls: boolean;
  controlsTimeout: number;
}

/**
 * 画像表示コンポーネントのprops型。
 * - ImageFile型のimageとViewerSettings型のsettingsを受け取る。
 */
export interface ImageDisplayProps {
  image: ImageFile;
  settings: ViewerSettings;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * ビューアコントロールバーのprops型。
 * - 現在のインデックスやズーム値、各種操作ハンドラを受け取る。
 */
export interface ViewerControlsProps {
  currentIndex: number;
  totalImages: number;
  zoom: number;
  onPrevious: () => void;
  onNext: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  isVisible: boolean;
  className?: string;
}

/**
 * 画像ビューアのキーボードアクション種別。
 * - KeyboardMappingやKeyboardShortcutと連携する。
 */
export type ActionType =
  | 'nextImage'
  | 'previousImage'
  | 'zoomIn'
  | 'zoomOut'
  | 'resetZoom'
  | 'rotateLeft'
  | 'rotateRight'
  | 'toggleFullscreen'
  | 'firstImage'
  | 'lastImage'
  | 'toggleControls'
  | 'toggleFitMode'
  | 'resetRotation'
  | string;

/**
 * キーボードショートカットの情報を表す型。
 * - KeyboardMappingで利用される。
 */
export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  preventDefault?: boolean;
  description?: string;
}

/**
 * キーボードショートカットのマッピングを表す型。
 * - アクションごとにKeyboardShortcut配列を持つ。
 * - onActionでアクション発火時の処理を定義。
 */
export interface KeyboardMapping {
  shortcuts: Map<ActionType, KeyboardShortcut[]>;
  onAction: (action: ActionType, event: KeyboardEvent) => void;
  enabled?: boolean;
}

/**
 * 画像ビューアのコールバック関数群。
 * - ImageViewerPropsで利用される。
 * - ImageFile型やViewerSettings型と連携する。
 */
export interface ImageViewerCallbacks {
  onImageChange?: (index: number, image: ImageFile) => void;
  onZoomChange?: (zoom: number) => void;
  onRotationChange?: (rotation: number) => void;
  onSettingsChange?: (settings: Partial<ViewerSettings>) => void;
  onCustomAction?: (action: string, event: KeyboardEvent) => void;
  onImageLoad?: (image: ImageFile) => void;
  onImageError?: (error: Error, image: ImageFile) => void;
}
