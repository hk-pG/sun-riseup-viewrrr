// App Shell Feature Exports

// Actions
export type {
  ActionDependencies,
  ActionRegistry,
  ActionResult,
  BoundActionHandler,
  FolderSelectedResult,
  ResultApplier,
  ThemeToggledResult,
} from './actions';
export type {
  AppMenuBarEvent,
  AppMenuBarProps,
  MenuItemData,
} from './components/AppMenuBar';
// Components
export { AppMenuBar } from './components/AppMenuBar';
export { HeaderMenu } from './components/HeaderMenu';
export { KeyboardShortcutHelp } from './components/KeyboardShortcutHelp';
export { MenuDropdown } from './components/MenuDropdown';
export { MenuItem } from './components/MenuItem';
// Hooks
export { useAppActions } from './hooks/useAppActions';
// Keyboard shortcuts
export {
  createCustomKeyboardMapping,
  createDefaultKeyboardMapping,
  findShortcutConflicts,
  getShortcutDescription,
  getShortcutList,
} from '@/shared/utils/keyboardUtils';

// Types
export type {
  HeaderMenuProps,
  MenuAction,
  MenuDropdownProps,
  MenuItemProps,
} from './types/menuTypes';
