import type React from 'react';
// 共通の型定義
export interface ImageFile {
  path: string;
  name: string;
  size?: number;
  lastModified?: Date;
}

export interface FolderInfo {
  path: string;
  name: string;
  thumbnailImage?: ImageFile;
  imageCount?: number;
}

// ヘッダメニューの型定義
export interface MenuAction {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  disabled?: boolean;
  submenu?: MenuAction[];
}

export interface HeaderMenuProps {
  title?: string;
  menuActions: MenuAction[];
  onMenuAction: (actionId: string, action: MenuAction) => void;
  onOpenFolder?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

// メニュー関連の分離された型
export interface MenuItemProps {
  action: MenuAction;
  onAction: (actionId: string, action: MenuAction) => void;
  depth?: number;
}

export interface MenuDropdownProps {
  actions: MenuAction[];
  onAction: (actionId: string, action: MenuAction) => void;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

// サイドバーの型定義
export interface FolderViewProps {
  folder: FolderInfo;
  isSelected?: boolean;
  onClick: (folder: FolderInfo) => void;
  onDoubleClick?: (folder: FolderInfo) => void;
  thumbnailSize?: number;
  showImageCount?: boolean;
  className?: string;
}

export interface FolderListProps {
  folders: FolderInfo[];
  selectedFolder?: FolderInfo;
  onFolderSelect: (folder: FolderInfo) => void;
  onFolderDoubleClick?: (folder: FolderInfo) => void;
  thumbnailSize?: number;
  showImageCount?: boolean;
}

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

// 画像ビューア関連の型定義
export interface ViewerSettings {
  fitMode: 'width' | 'height' | 'both' | 'none';
  zoom: number;
  rotation: number;
  backgroundColor: string;
  showControls: boolean;
  autoHideControls: boolean;
  controlsTimeout: number;
}

export interface ImageDisplayProps {
  image: ImageFile;
  settings: ViewerSettings;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  style?: React.CSSProperties;
}

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

// キーボードショートカット関連の型定義
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

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  preventDefault?: boolean;
  description?: string;
}

export interface KeyboardMapping {
  shortcuts: Map<ActionType, KeyboardShortcut[]>;
  onAction: (action: ActionType, event: KeyboardEvent) => void;
  enabled?: boolean;
}

// ImageViewerの簡素化された型定義
export interface ImageViewerCallbacks {
  onImageChange?: (index: number, image: ImageFile) => void;
  onZoomChange?: (zoom: number) => void;
  onRotationChange?: (rotation: number) => void;
  onSettingsChange?: (settings: Partial<ViewerSettings>) => void;
  onCustomAction?: (action: string, event: KeyboardEvent) => void;
  onImageLoad?: (image: ImageFile) => void;
  onImageError?: (error: Error, image: ImageFile) => void;
}

export interface ImageViewerProps {
  images: ImageFile[];
  initialIndex?: number;
  settings?: Partial<ViewerSettings>;
  keyboardMapping?: KeyboardMapping;
  callbacks?: ImageViewerCallbacks;
  loading?: boolean;
  error?: string;
  className?: string;
  style?: React.CSSProperties;
}
