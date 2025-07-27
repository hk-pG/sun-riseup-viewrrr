import type { ImageFile } from '../../folder-navigation/types/folderTypes';

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
