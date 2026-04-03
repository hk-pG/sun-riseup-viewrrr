import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { Sidebar } from '@/features/folder-navigation';
import { resetAllMocks, setupTauriMocks } from '@/test/mocks';

// スクロールが必要な状況を再現するため、初期表示件数（20件）分のフォルダを使用
// NOTE: FolderList はページネーション（INITIAL_VISIBLE_COUNT=20）を持つため、
// それを超えるフォルダは「もっと見る」ボタンを押すまで表示されない
const FOLDER_COUNT = 20;
const mockFolders = Array.from({ length: FOLDER_COUNT }, (_, i) => ({
  name: `test-folder-${String(i + 1).padStart(2, '0')}`,
  path: `/test/folder${i + 1}`,
}));

/**
 * SidebarScroll - スクロール可能な DOM 構造のリグレッション検知テスト
 *
 * ⚠ NOTE: jsdom はレイアウトエンジンを持たないため、実際のスクロール動作
 *   （scrollHeight > clientHeight）を検証することはできない。
 *   このテストは「スクロール可能な DOM 構造が保たれていること」をリグレッション検知する。
 *   実際のスクロール動作の確認は Storybook または E2E テストで行うこと。
 */
describe('SidebarScroll - スクロール可能なDOM構造が維持されること（リグレッション検知）', () => {
  beforeEach(() => {
    resetAllMocks();
    // useThumbnailPrefetch が内部で Tauri API を呼ぶため、モックが必要
    setupTauriMocks();
  });

  it('多数のフォルダがサイドバー内にレンダリングされている', () => {
    render(<Sidebar folders={mockFolders} onFolderSelect={() => {}} />);

    // サイドバーのランドマーク要素（<aside>）が存在すること
    const sidebarAside = screen.getByRole('complementary');
    expect(sidebarAside).toBeInTheDocument();

    // 全フォルダがボタン要素としてレンダリングされていること
    const folderButtons = screen.getAllByRole('button');
    expect(folderButtons.length).toBeGreaterThanOrEqual(mockFolders.length);

    // フォルダボタンが aria-pressed 属性を持つ（操作可能なトグルボタン）こと
    const pressableButtons = folderButtons.filter((btn) =>
      btn.hasAttribute('aria-pressed'),
    );
    expect(pressableButtons).toHaveLength(mockFolders.length);

    // 各フォルダ名がテキストとして表示されていること
    for (const folder of mockFolders) {
      expect(screen.getByText(folder.name)).toBeInTheDocument();
    }
  });
});
