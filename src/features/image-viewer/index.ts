// Image Viewer Feature Exports

export type { ImageFile } from '../folder-navigation/types/folderTypes';
export { ImageDisplay } from './components/ImageDisplay';
// Re-export component props interfaces for convenience
export type { ImageViewerProps } from './components/ImageViewer';
// Components
export { ImageViewer } from './components/ImageViewer';
export { ViewerControls } from './components/ViewerControls';
// Hooks
export { useControlsVisibility } from './hooks/useControlsVisibility';
export { useKeyboardHandler } from './hooks/useKeyboardHandler';
// Keyboard shortcuts
export {
  createCustomKeyboardMapping,
  createDefaultKeyboardMapping,
  findShortcutConflicts,
  getShortcutDescription,
  getShortcutList,
} from './keyboard/keyboardUtils';
export type { ImageContainer } from './types/ImageContainer';
// Types
export type { ImageHandle, ImageSource } from './types/ImageSource';
export type {
  ActionType,
  ImageDisplayProps,
  KeyboardMapping,
  KeyboardShortcut,
  ViewerControlsProps,
  ViewerSettings,
} from './types/viewerTypes';
