// App Shell Feature Exports

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

// Settings
export {
  createCustomKeyboardMapping,
  createDefaultKeyboardMapping,
  findShortcutConflicts,
  getShortcutDescription,
  getShortcutList,
} from './settings/defaultKeyConfig';
export {
  createCustomKeyboardMapping as createCustomKeyboardMappingFromUtils,
  createDefaultKeyboardMapping as createDefaultKeyboardMappingFromUtils,
  findShortcutConflicts as findShortcutConflictsFromUtils,
  getShortcutDescription as getShortcutDescriptionFromUtils,
  getShortcutList as getShortcutListFromUtils,
} from './settings/keyUtils';

// Types
export type {
  HeaderMenuProps,
  MenuAction,
  MenuDropdownProps,
  MenuItemProps,
} from './types/menuTypes';
