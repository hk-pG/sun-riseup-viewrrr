import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { Sidebar } from '@/features/folder-navigation';
import { resetAllMocks, setupTauriMocks } from '@/test/mocks';

// スクロールが必要な状況を再現するため、表示しきれない件数（20件超）を使用
const FOLDERS_NEEDING_SCROLL = 21;
const mockFolders = Array.from({ length: FOLDERS_NEEDING_SCROLL }, (_, i) => ({
  name: `test-folder-${String(i + 1).padStart(2, '0')}`,
  path: `/test/folder${i + 1}`,
}));

/**
 * SidebarScroll - スクロール動作のリグレッション検知テスト
 *
 * ⚠ NOTE: このテストは実装詳細（CSSクラスの存在）を検証するリグレッション検知テストである。
 *   jsdom はレイアウトエンジンを持たないため、実際のスクロール動作（scrollHeight > clientHeight）
 *   を検証することはできない。実際のスクロール動作の確認は Storybook または E2E テストで行うこと。
 *   実装方式を変更する場合（例: Tailwind クラス → inline style）はこのテストも合わせて更新すること。
 */
describe('SidebarScroll - US2: Sidebar container has correct scroll classes', () => {
  beforeEach(() => {
    resetAllMocks();
    // useThumbnailPrefetch が内部で Tauri API を呼ぶため、モックが必要
    setupTauriMocks();
  });

  it('T009/T009b: フォルダが20件超のとき、スクロールを可能にするスタイル条件が満たされている（リグレッション検知）', () => {
    render(<Sidebar folders={mockFolders} onFolderSelect={() => {}} />);
    const sidebarAside = screen.getByRole('complementary');

    expect(sidebarAside).toBeInTheDocument();
    // overflow-y-auto: スクロール許可
    expect(sidebarAside.classList.contains('overflow-y-auto')).toBe(true);
    // min-h-0: Flexbox 子要素のデフォルト min-height: auto を上書きし、overflow が機能するようにする
    expect(sidebarAside.classList.contains('min-h-0')).toBe(true);
  });
});
