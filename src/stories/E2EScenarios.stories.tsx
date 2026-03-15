import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import App from '@/App';
import { ThemeProvider } from '@/components/theme-provider';
import {
  getMockImageFolders,
  mockImageSourcesByFolderPath,
} from '../../data/mockData';
import type { FileSystemService } from '../features/folder-navigation';
import { ServicesProvider } from '../shared/context/ServiceContext';

// フォルダパス→フレンドリー名のマッピング（useSiblingFolders の getBaseName で使用）
const folderNameMap: Record<string, string> = Object.fromEntries(
  getMockImageFolders().map((f) => [f.path, f.name]),
);

// モックサービス（ViewerIntegration.stories.tsx と同じパターン）
const createMockFileSystemService = (): FileSystemService => ({
  openDirectoryDialog: async () => '/mock/folder/path',
  listImagesInFolder: async (_folderPath: string) => {
    const images = mockImageSourcesByFolderPath[_folderPath] || [];
    return images.map((img) => img.assetUrl);
  },
  getSiblingFolders: async () => {
    return getMockImageFolders().map((folder) => folder.path);
  },
  convertFileSrc: (filePath: string) => filePath,
  getBaseName: async (filePath: string) => {
    return folderNameMap[filePath] || filePath.split('/').pop() || '';
  },
  getDirName: async (filePath: string) => {
    const parts = filePath.split('/');
    return parts.slice(0, -1).join('/');
  },
  getFolderThumbnail: async () => null,
  prefetchFolderThumbnails: async () => {},
});

const MockServiceProvider = ({ children }: { children: React.ReactNode }) => {
  const mockService = createMockFileSystemService();
  return (
    <ThemeProvider defaultTheme="light">
      <ServicesProvider services={mockService}>{children}</ServicesProvider>
    </ThemeProvider>
  );
};

const meta: Meta = {
  title: 'E2E/Scenarios',
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <MockServiceProvider>
        <Story />
      </MockServiceProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj;

/**
 * シナリオ1: フォルダを開く → サイドバーにフォルダ一覧が表示される
 */
export const FolderListDisplay: Story = {
  name: 'シナリオ1: フォルダ一覧の表示',
  render: () => (
    <App initialState={{ currentFolderPath: '/test_images/folder_1' }} />
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('サイドバーヘッダー「フォルダ一覧」が表示される', async () => {
      await waitFor(() => {
        expect(canvas.getByText('フォルダ一覧')).toBeInTheDocument();
      });
    });

    await step('フォルダ名が表示される', async () => {
      await waitFor(() => {
        expect(
          canvas.getAllByText('ワンピース 第1巻').length,
        ).toBeGreaterThanOrEqual(1);
        expect(
          canvas.getAllByText('NARUTO -ナルト- 第1巻').length,
        ).toBeGreaterThanOrEqual(1);
        expect(
          canvas.getAllByText('進撃の巨人 第1巻').length,
        ).toBeGreaterThanOrEqual(1);
      });
    });
  },
};

/**
 * シナリオ2: フォルダを選択 → ImageViewer に画像が表示される
 */
export const FolderSelectShowsImage: Story = {
  name: 'シナリオ2: フォルダ選択で画像表示',
  render: () => (
    <App initialState={{ currentFolderPath: '/test_images/folder_1' }} />
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('ImageViewer コンテナが存在する', async () => {
      await waitFor(() => {
        expect(
          canvasElement.querySelector('[role="application"]'),
        ).toBeInTheDocument();
      });
    });

    await step('画像要素が表示されている', async () => {
      await waitFor(() => {
        const viewer = canvasElement.querySelector('[role="application"]');
        expect(viewer).toBeInTheDocument();
        const img = viewer?.querySelector('img');
        expect(img).toBeInTheDocument();
      });
    });

    await step('別のフォルダをクリックして画像が切り替わる', async () => {
      // NARUTO フォルダのボタンをクリック
      const narutoButton = canvas.getByText('NARUTO -ナルト- 第1巻');
      await userEvent.click(narutoButton);

      await waitFor(() => {
        const viewer = canvasElement.querySelector('[role="application"]');
        const img = viewer?.querySelector('img');
        expect(img).toBeInTheDocument();
        const newSrc = img?.getAttribute('src');
        expect(newSrc).toBeTruthy();
        // folder_2 の画像パスに変わっていることを確認
        expect(newSrc).toContain('folder_2');
      });
    });
  },
};

/**
 * シナリオ3: 次へボタンで次の画像に移動できる
 */
export const ImageNavigation: Story = {
  name: 'シナリオ3: 画像ナビゲーション',
  render: () => (
    <App initialState={{ currentFolderPath: '/test_images/folder_1' }} />
  ),
  play: async ({ canvasElement, step }) => {
    let initialSrc: string | null | undefined;

    await step('ImageViewer に画像が表示されている', async () => {
      await waitFor(() => {
        const viewer = canvasElement.querySelector('[role="application"]');
        expect(viewer).toBeInTheDocument();
        const img = viewer?.querySelector('img');
        expect(img).toBeInTheDocument();
        initialSrc = img?.getAttribute('src');
        expect(initialSrc).toBeTruthy();
      });
    });

    await step('次へボタンで次の画像に移動', async () => {
      const viewer = canvasElement.querySelector(
        '[role="application"]',
      ) as HTMLElement;

      // マウスムーブでコントロールを表示（autoHideControls 対策）
      await userEvent.hover(viewer);

      // aria-label でボタンを取得してクリック
      await waitFor(() => {
        expect(
          within(viewer).getByRole('button', { name: '次の画像' }),
        ).toBeInTheDocument();
      });
      const nextButton = within(viewer).getByRole('button', {
        name: '次の画像',
      });
      await userEvent.click(nextButton);

      await waitFor(() => {
        const img = viewer.querySelector('img');
        const newSrc = img?.getAttribute('src');
        expect(newSrc).toBeTruthy();
        expect(newSrc).not.toBe(initialSrc);
      });
    });
  },
};

/**
 * シナリオ4: テーマ切り替えが動作する（light ↔ dark）
 */
export const ThemeToggle: Story = {
  name: 'シナリオ4: テーマ切り替え',
  render: () => (
    <App initialState={{ currentFolderPath: '/test_images/folder_1' }} />
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('初期テーマクラスを確認', async () => {
      await waitFor(() => {
        const root = canvasElement.ownerDocument.documentElement;
        // ThemeProvider defaultTheme="light" を指定しているので light クラスがあるはず
        expect(
          root.classList.contains('light') || root.classList.contains('dark'),
        ).toBe(true);
      });
    });

    let initialTheme = 'light';

    await step('現在のテーマを記録', async () => {
      const root = canvasElement.ownerDocument.documentElement;
      initialTheme = root.classList.contains('dark') ? 'dark' : 'light';
    });

    await step('メニューからテーマ切り替えを実行', async () => {
      // 「表示」メニューを開く（トリガーは canvasElement 内）
      const viewMenuTrigger = canvas.getByText('表示');
      await userEvent.click(viewMenuTrigger);

      // メニュー項目はポータルで canvasElement 外にレンダリングされる
      await waitFor(() => {
        const body = within(canvasElement.ownerDocument.body);
        expect(body.getByText('テーマ切り替え')).toBeInTheDocument();
      });
      const body = within(canvasElement.ownerDocument.body);
      const themeMenuItem = body.getByText('テーマ切り替え');
      await userEvent.click(themeMenuItem);
    });

    await step('テーマクラスが切り替わったことを確認', async () => {
      await waitFor(() => {
        const root = canvasElement.ownerDocument.documentElement;
        const currentTheme = root.classList.contains('dark') ? 'dark' : 'light';
        expect(currentTheme).not.toBe(initialTheme);
      });
    });
  },
};
