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
import type { AppMenuBarProps } from '@/types/viewerTypes';
import { Eye, FileText, FolderOpen, Navigation, Settings } from 'lucide-react';
import type React from 'react';

export const AppMenuBar: React.FC<AppMenuBarProps> = ({
  title = '漫画ビューア',
  onMenuAction,
  className = '',
  style,
}) => {
  return (
    <header
      className={`flex items-center justify-between bg-background border-b px-4 py-2 ${className}`}
      style={style}
    >
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold">{title}</h1>

        <Menubar>
          {/* ファイルメニュー */}
          <MenubarMenu>
            <MenubarTrigger className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              ファイル
            </MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={() => onMenuAction('open-folder')}>
                <FolderOpen className="mr-2 h-4 w-4" />
                フォルダを開く
                <MenubarShortcut>Ctrl+O</MenubarShortcut>
              </MenubarItem>
              <MenubarSub>
                <MenubarSubTrigger>
                  <span className="mr-2">🕒</span>
                  最近開いたフォルダ
                </MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem onClick={() => onMenuAction('recent-1')}>
                    ワンピース 第1巻
                  </MenubarItem>
                  <MenubarItem onClick={() => onMenuAction('recent-2')}>
                    NARUTO -ナルト- 第1巻
                  </MenubarItem>
                  <MenubarItem onClick={() => onMenuAction('recent-3')}>
                    進撃の巨人 第1巻
                  </MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
              <MenubarSeparator />
              <MenubarItem onClick={() => onMenuAction('exit')}>
                終了
                <MenubarShortcut>Alt+F4</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          {/* 表示メニュー */}
          <MenubarMenu>
            <MenubarTrigger className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              表示
            </MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={() => onMenuAction('fullscreen')}>
                フルスクリーン
                <MenubarShortcut>F11</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarSub>
                <MenubarSubTrigger>表示モード</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem onClick={() => onMenuAction('fit-width')}>
                    幅に合わせる
                    <MenubarShortcut>W</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem onClick={() => onMenuAction('fit-height')}>
                    高さに合わせる
                    <MenubarShortcut>H</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem onClick={() => onMenuAction('fit-both')}>
                    画面に合わせる
                    <MenubarShortcut>B</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem onClick={() => onMenuAction('fit-none')}>
                    実際のサイズ
                    <MenubarShortcut>N</MenubarShortcut>
                  </MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
              <MenubarSub>
                <MenubarSubTrigger>ズーム</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem onClick={() => onMenuAction('zoom-in')}>
                    ズームイン
                    <MenubarShortcut>+</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem onClick={() => onMenuAction('zoom-out')}>
                    ズームアウト
                    <MenubarShortcut>-</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem onClick={() => onMenuAction('zoom-reset')}>
                    ズームリセット
                    <MenubarShortcut>0</MenubarShortcut>
                  </MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
              <MenubarSeparator />
              <MenubarItem onClick={() => onMenuAction('toggle-controls')}>
                コントロール表示切り替え
                <MenubarShortcut>C</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          {/* ナビゲーションメニュー */}
          <MenubarMenu>
            <MenubarTrigger className="flex items-center gap-1">
              <Navigation className="h-4 w-4" />
              ナビゲーション
            </MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={() => onMenuAction('next-page')}>
                次のページ
                <MenubarShortcut>→</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={() => onMenuAction('prev-page')}>
                前のページ
                <MenubarShortcut>←</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={() => onMenuAction('first-page')}>
                最初のページ
                <MenubarShortcut>Home</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={() => onMenuAction('last-page')}>
                最後のページ
                <MenubarShortcut>End</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarSub>
                <MenubarSubTrigger>回転</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem onClick={() => onMenuAction('rotate-right')}>
                    右に回転
                    <MenubarShortcut>R</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem onClick={() => onMenuAction('rotate-left')}>
                    左に回転
                    <MenubarShortcut>Shift+R</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem onClick={() => onMenuAction('reset-rotation')}>
                    回転リセット
                    <MenubarShortcut>Ctrl+R</MenubarShortcut>
                  </MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
            </MenubarContent>
          </MenubarMenu>

          {/* 設定メニュー */}
          <MenubarMenu>
            <MenubarTrigger className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              設定
            </MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={() => onMenuAction('preferences')}>
                環境設定
                <MenubarShortcut>Ctrl+,</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={() => onMenuAction('shortcuts')}>
                キーボードショートカット
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={() => onMenuAction('about')}>
                このアプリについて
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
    </header>
  );
};
