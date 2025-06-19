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
import { Eye, FileText, FolderOpen, Navigation, Settings } from 'lucide-react';

// AppMenuBarで使うイベントIDの型
export type AppMenuBarEvent =
  | 'open-folder'
  | 'recent-1'
  | 'recent-2'
  | 'recent-3'
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
  title?: string;
  onMenuAction: (actionId: AppMenuBarEvent) => void;
  onOpenFolder?: () => void;
  isDraggable?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const AppMenuBar = ({
  title = '漫画ビューア',
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
        <h1
          {...(isDraggable ? { 'data-tauri-drag-region': true } : {})}
          className="text-lg font-semibold text-gray-800"
        >
          {title}
        </h1>

        {onOpenFolder && (
          <button
            type="button"
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
            onClick={onOpenFolder}
          >
            📁 フォルダを開く
          </button>
        )}

        <Menubar className="bg-white border-gray-200">
          {/* ファイルメニュー */}
          <MenubarMenu>
            <MenubarTrigger className="flex items-center gap-1 hover:bg-gray-100 focus:bg-gray-100 data-[state=open]:bg-gray-100">
              <FileText className="h-4 w-4" />
              ファイル
            </MenubarTrigger>
            <MenubarContent className="bg-white border-gray-200 shadow-lg">
              <MenubarItem
                onClick={() => onMenuAction('open-folder')}
                className="hover:bg-gray-100 focus:bg-gray-100"
              >
                <FolderOpen className="mr-2 h-4 w-4" />
                フォルダを開く
                <MenubarShortcut>Ctrl+O</MenubarShortcut>
              </MenubarItem>
              <MenubarSub>
                <MenubarSubTrigger className="hover:bg-gray-100 focus:bg-gray-100">
                  <span className="mr-2">🕒</span>
                  最近開いたフォルダ
                </MenubarSubTrigger>
                <MenubarSubContent className="bg-white border-gray-200 shadow-lg">
                  <MenubarItem
                    onClick={() => onMenuAction('recent-1')}
                    className="hover:bg-gray-100 focus:bg-gray-100"
                  >
                    ワンピース 第1巻
                  </MenubarItem>
                  <MenubarItem
                    onClick={() => onMenuAction('recent-2')}
                    className="hover:bg-gray-100 focus:bg-gray-100"
                  >
                    NARUTO -ナルト- 第1巻
                  </MenubarItem>
                  <MenubarItem
                    onClick={() => onMenuAction('recent-3')}
                    className="hover:bg-gray-100 focus:bg-gray-100"
                  >
                    進撃の巨人 第1巻
                  </MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
              <MenubarSeparator className="bg-gray-200" />
              <MenubarItem
                onClick={() => onMenuAction('exit')}
                className="hover:bg-gray-100 focus:bg-gray-100"
              >
                終了
                <MenubarShortcut>Alt+F4</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          {/* 表示メニュー */}
          <MenubarMenu>
            <MenubarTrigger className="flex items-center gap-1 hover:bg-gray-100 focus:bg-gray-100 data-[state=open]:bg-gray-100">
              <Eye className="h-4 w-4" />
              表示
            </MenubarTrigger>
            <MenubarContent className="bg-white border-gray-200 shadow-lg">
              <MenubarItem
                onClick={() => onMenuAction('fullscreen')}
                className="hover:bg-gray-100 focus:bg-gray-100"
              >
                フルスクリーン
                <MenubarShortcut>F11</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator className="bg-gray-200" />
              <MenubarSub>
                <MenubarSubTrigger className="hover:bg-gray-100 focus:bg-gray-100">
                  表示モード
                </MenubarSubTrigger>
                <MenubarSubContent className="bg-white border-gray-200 shadow-lg">
                  <MenubarItem
                    onClick={() => onMenuAction('fit-width')}
                    className="hover:bg-gray-100 focus:bg-gray-100"
                  >
                    幅に合わせる
                    <MenubarShortcut>W</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem
                    onClick={() => onMenuAction('fit-height')}
                    className="hover:bg-gray-100 focus:bg-gray-100"
                  >
                    高さに合わせる
                    <MenubarShortcut>H</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem
                    onClick={() => onMenuAction('fit-both')}
                    className="hover:bg-gray-100 focus:bg-gray-100"
                  >
                    画面に合わせる
                    <MenubarShortcut>B</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem
                    onClick={() => onMenuAction('fit-none')}
                    className="hover:bg-gray-100 focus:bg-gray-100"
                  >
                    実際のサイズ
                    <MenubarShortcut>N</MenubarShortcut>
                  </MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
              <MenubarSub>
                <MenubarSubTrigger className="hover:bg-gray-100 focus:bg-gray-100">
                  ズーム
                </MenubarSubTrigger>
                <MenubarSubContent className="bg-white border-gray-200 shadow-lg">
                  <MenubarItem
                    onClick={() => onMenuAction('zoom-in')}
                    className="hover:bg-gray-100 focus:bg-gray-100"
                  >
                    ズームイン
                    <MenubarShortcut>+</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem
                    onClick={() => onMenuAction('zoom-out')}
                    className="hover:bg-gray-100 focus:bg-gray-100"
                  >
                    ズームアウト
                    <MenubarShortcut>-</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem
                    onClick={() => onMenuAction('zoom-reset')}
                    className="hover:bg-gray-100 focus:bg-gray-100"
                  >
                    ズームリセット
                    <MenubarShortcut>0</MenubarShortcut>
                  </MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
              <MenubarSeparator className="bg-gray-200" />
              <MenubarItem
                onClick={() => onMenuAction('toggle-controls')}
                className="hover:bg-gray-100 focus:bg-gray-100"
              >
                コントロール表示切り替え
                <MenubarShortcut>C</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          {/* ナビゲーションメニュー */}
          <MenubarMenu>
            <MenubarTrigger className="flex items-center gap-1 hover:bg-gray-100 focus:bg-gray-100 data-[state=open]:bg-gray-100">
              <Navigation className="h-4 w-4" />
              ナビゲーション
            </MenubarTrigger>
            <MenubarContent className="bg-white border-gray-200 shadow-lg">
              <MenubarItem
                onClick={() => onMenuAction('next-page')}
                className="hover:bg-gray-100 focus:bg-gray-100"
              >
                次のページ
                <MenubarShortcut>→</MenubarShortcut>
              </MenubarItem>
              <MenubarItem
                onClick={() => onMenuAction('prev-page')}
                className="hover:bg-gray-100 focus:bg-gray-100"
              >
                前のページ
                <MenubarShortcut>←</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator className="bg-gray-200" />
              <MenubarItem
                onClick={() => onMenuAction('first-page')}
                className="hover:bg-gray-100 focus:bg-gray-100"
              >
                最初のページ
                <MenubarShortcut>Home</MenubarShortcut>
              </MenubarItem>
              <MenubarItem
                onClick={() => onMenuAction('last-page')}
                className="hover:bg-gray-100 focus:bg-gray-100"
              >
                最後のページ
                <MenubarShortcut>End</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator className="bg-gray-200" />
              <MenubarSub>
                <MenubarSubTrigger className="hover:bg-gray-100 focus:bg-gray-100">
                  回転
                </MenubarSubTrigger>
                <MenubarSubContent className="bg-white border-gray-200 shadow-lg">
                  <MenubarItem
                    onClick={() => onMenuAction('rotate-right')}
                    className="hover:bg-gray-100 focus:bg-gray-100"
                  >
                    右に回転
                    <MenubarShortcut>R</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem
                    onClick={() => onMenuAction('rotate-left')}
                    className="hover:bg-gray-100 focus:bg-gray-100"
                  >
                    左に回転
                    <MenubarShortcut>Shift+R</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem
                    onClick={() => onMenuAction('reset-rotation')}
                    className="hover:bg-gray-100 focus:bg-gray-100"
                  >
                    回転リセット
                    <MenubarShortcut>Ctrl+R</MenubarShortcut>
                  </MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
            </MenubarContent>
          </MenubarMenu>

          {/* 設定メニュー */}
          <MenubarMenu>
            <MenubarTrigger className="flex items-center gap-1 hover:bg-gray-100 focus:bg-gray-100 data-[state=open]:bg-gray-100">
              <Settings className="h-4 w-4" />
              設定
            </MenubarTrigger>
            <MenubarContent className="bg-white border-gray-200 shadow-lg">
              <MenubarItem
                onClick={() => onMenuAction('preferences')}
                className="hover:bg-gray-100 focus:bg-gray-100"
              >
                環境設定
                <MenubarShortcut>Ctrl+,</MenubarShortcut>
              </MenubarItem>
              <MenubarItem
                onClick={() => onMenuAction('shortcuts')}
                className="hover:bg-gray-100 focus:bg-gray-100"
              >
                キーボードショートカット
              </MenubarItem>
              <MenubarSeparator className="bg-gray-200" />
              <MenubarItem
                onClick={() => onMenuAction('about')}
                className="hover:bg-gray-100 focus:bg-gray-100"
              >
                このアプリについて
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
    </header>
  );
};
