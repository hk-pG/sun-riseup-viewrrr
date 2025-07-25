import { Eye, FileText, FolderOpen } from 'lucide-react';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@/components/ui/menubar';

// AppMenuBarで使うイベントIDの型
export type AppMenuBarEvent =
  | 'open-folder'
  | 'open-image'
  | 'exit'
  | 'fullscreen'
  | 'fit-width'
  | 'fit-height'
  | 'fit-both'
  | 'fit-none'
  | 'zoom-in'
  | 'zoom-out'
  | 'zoom-reset'
  | 'toggle-controls'
  | 'next-page'
  | 'prev-page'
  | 'first-page'
  | 'last-page'
  | 'rotate-right'
  | 'rotate-left'
  | 'reset-rotation'
  | 'preferences'
  | 'shortcuts'
  | 'about';

export interface AppMenuBarProps {
  onMenuAction: (actionId: AppMenuBarEvent) => void;
  onOpenFolder?: () => void;
  isDraggable?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// メニューアイテムの型定義
export type MenuItemData = {
  type: 'item' | 'separator' | 'submenu';
  label?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  actionId?: AppMenuBarEvent;
  children?: MenuItemData[];
};

// メニュー構造データ例
const fileMenu: MenuItemData[] = [
  {
    type: 'item',
    label: 'フォルダを開く',
    icon: <FolderOpen className="mr-2 h-4 w-4" />,
    shortcut: 'Ctrl+O',
    actionId: 'open-folder',
  },
  {
    type: 'item',
    label: '画像ファイルを開く',
    icon: <span className="mr-2">🖼</span>,
    shortcut: 'Ctrl+Shift+O',
    actionId: 'open-image',
  },
  { type: 'separator' },
  {
    type: 'item',
    label: '終了',
    shortcut: 'Alt+F4',
    actionId: 'exit',
  },
];

const viewMenu: MenuItemData[] = [
  {
    type: 'item',
    label: 'フルスクリーン',
    shortcut: 'F11',
    actionId: 'fullscreen',
  },
  { type: 'separator' },
  {
    type: 'submenu',
    label: '表示モード',
    children: [
      {
        type: 'item',
        label: '幅に合わせる',
        shortcut: 'W',
        actionId: 'fit-width',
      },
      {
        type: 'item',
        label: '高さに合わせる',
        shortcut: 'H',
        actionId: 'fit-height',
      },
      {
        type: 'item',
        label: '画面に合わせる',
        shortcut: 'B',
        actionId: 'fit-both',
      },
      {
        type: 'item',
        label: '実際のサイズ',
        shortcut: 'N',
        actionId: 'fit-none',
      },
    ],
  },
  {
    type: 'submenu',
    label: 'ズーム',
    children: [
      { type: 'item', label: 'ズームイン', shortcut: '+', actionId: 'zoom-in' },
      {
        type: 'item',
        label: 'ズームアウト',
        shortcut: '-',
        actionId: 'zoom-out',
      },
      {
        type: 'item',
        label: 'ズームリセット',
        shortcut: '0',
        actionId: 'zoom-reset',
      },
    ],
  },
  { type: 'separator' },
  {
    type: 'item',
    label: 'コントロール表示切り替え',
    shortcut: 'C',
    actionId: 'toggle-controls',
  },
];

// 汎用描画関数
function renderMenuItems(
  items: MenuItemData[],
  onMenuAction: (id: AppMenuBarEvent) => void,
) {
  return items.map((item, index) => {
    if (item.type === 'separator') {
      return (
        <MenubarSeparator
          key={`separator-${index}-${item.actionId}`}
          className="bg-gray-200"
        />
      );
    }
    if (item.type === 'submenu' && item.children) {
      return (
        <MenubarSub key={item.label || `submenu-${index}`}>
          <MenubarSubTrigger className="hover:bg-gray-100 focus:bg-gray-100">
            {item.icon}
            {item.label}
          </MenubarSubTrigger>
          <MenubarSubContent className="bg-white border-gray-200 shadow-lg">
            {renderMenuItems(item.children, onMenuAction)}
          </MenubarSubContent>
        </MenubarSub>
      );
    }
    return (
      <MenubarItem
        key={item.actionId || `item-${index}`}
        onClick={() => item.actionId && onMenuAction(item.actionId)}
        className="hover:bg-gray-100 focus:bg-gray-100"
      >
        {item.icon}
        {item.label}
        {item.shortcut && <MenubarShortcut>{item.shortcut}</MenubarShortcut>}
      </MenubarItem>
    );
  });
}

export const AppMenuBar = ({
  onMenuAction,
  onOpenFolder,
  isDraggable = true,
  className = '',
  style,
}: AppMenuBarProps) => {
  return (
    <header
      className={`flex items-center justify-between bg-menubar border-b border-gray-200 px-4 py-2 ${className}`}
      style={style}
      {...(isDraggable ? { 'data-tauri-drag-region': true } : {})}
    >
      <div className="flex items-center gap-4">
        {onOpenFolder && (
          <button
            type="button"
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
            onClick={onOpenFolder}
          >
            フォルダを開く
          </button>
        )}
        <Menubar className="bg-white border-gray-200">
          <MenubarMenu>
            <MenubarTrigger className="flex items-center gap-1 hover:bg-gray-100 focus:bg-gray-100 data-[state=open]:bg-gray-100">
              <FileText className="h-4 w-4" />
              ファイル
            </MenubarTrigger>
            <MenubarContent className="bg-white border-gray-200 shadow-lg">
              {renderMenuItems(fileMenu, onMenuAction)}
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger className="flex items-center gap-1 hover:bg-gray-100 focus:bg-gray-100 data-[state=open]:bg-gray-100">
              <Eye className="h-4 w-4" />
              表示
            </MenubarTrigger>
            <MenubarContent className="bg-white border-gray-200 shadow-lg">
              {renderMenuItems(viewMenu, onMenuAction)}
            </MenubarContent>
          </MenubarMenu>
          {/* ...他のメニューも同様にデータ化して適用可能... */}
        </Menubar>
      </div>
    </header>
  );
};
