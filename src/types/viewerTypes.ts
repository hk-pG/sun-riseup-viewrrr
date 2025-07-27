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
