import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import App from '@/App';
import { ThemeProvider } from '@/components/theme-provider';
import {
  generateDummyEmptyFolders,
  generateLongNameFolders,
  getMockImageFolders,
  mockImageSourcesByFolderPath,
  mockSidebarOnlyFolders,
} from '../../tests/fixtures/data/mockData';
import { type FileSystemService, Sidebar } from '../features/folder-navigation';
import { ImageViewer } from '../features/image-viewer';
import { ServicesProvider } from '../shared/context/ServiceContext';

// モックファイルシステムサービス
const createMockFileSystemService = (): FileSystemService => ({
  openDirectoryDialog: async () => '/mock/folder/path',
  listImagesInFolder: async (_folderPath: string) => {
    const images = mockImageSourcesByFolderPath[_folderPath] || [];
    return images.map((img) => img.assetUrl);
  },
  // getSiblingFolders: async () => ['/mock/folder1', '/mock/folder2'],

  getSiblingFolders: async () => {
    return getMockImageFolders().map((folder) => folder.path);
  },
  getSiblingContainers: async () => {
    return getMockImageFolders().map((folder) => folder.path);
  },
  convertFileSrc: (filePath: string) => filePath,
  getBaseName: async (filePath: string) => {
    const parts = filePath.split('/');
    return parts[parts.length - 1];
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
    <ThemeProvider>
      <ServicesProvider services={mockService}>{children}</ServicesProvider>
    </ThemeProvider>
  );
};

const meta: Meta = {
  title: 'Integration/ViewerIntegration',
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story, _context) => (
      <MockServiceProvider>
        <Story />
      </MockServiceProvider>
    ),
  ],
};
export default meta;

type Story = StoryObj;

// 完全なビューアアプリケーションのシミュレーション
export const FullViewerApp: Story = {
  render: () => {
    // フォルダ情報は getMockFolders() で取得可能
    return <App />;
  },
};

// ビューアのみのテスト
export const ViewerOnly: Story = {
  render: () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    return (
      <div className="h-screen bg-background">
        <ImageViewer
          folderPath="/mock/folder/path"
          initialIndex={currentIndex}
          className="h-full w-full"
          callbacks={{
            onImageChange: (index) => {
              setCurrentIndex(index);
              console.log('Current image index:', index);
            },
            onZoomChange: (zoom) => console.log('Zoom level:', zoom),
            onRotationChange: (rotation) => console.log('Rotation:', rotation),
          }}
        />
      </div>
    );
  },
};

// サイドバーのみのテスト
export const SidebarOnly: Story = {
  render: () => {
    // サイドバーのみのテストでは画像を持たないフォルダも含めてテストできる
    const folders = [...getMockImageFolders(), ...mockSidebarOnlyFolders];
    const [selectedFolder, setSelectedFolder] = useState(folders[0]);
    return (
      <div className="h-screen bg-background">
        <Sidebar
          folders={folders}
          selectedFolder={selectedFolder}
          onFolderSelect={setSelectedFolder}
          width={280}
        />
      </div>
    );
  },
};

// Define rich folders for responsive test
const richFolders = [
  ...getMockImageFolders(),
  ...mockSidebarOnlyFolders,
  ...generateDummyEmptyFolders(30),
  ...generateLongNameFolders(),
];

const folderNameMap = richFolders.reduce(
  (acc, folder) => {
    acc[folder.path] = folder.name;
    return acc;
  },
  {} as Record<string, string>,
);

const createRichMockFileSystemService = (): FileSystemService => {
  const base = createMockFileSystemService();
  return {
    ...base,
    getSiblingFolders: async (currentPath: string) =>
      richFolders.map((f) => f.path).filter((path) => path !== currentPath),
    getBaseName: async (filePath: string) => {
      return folderNameMap[filePath] || filePath.split('/').pop() || '';
    },
  };
};

const RichMockServiceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const mockService = createRichMockFileSystemService();
  return <ServicesProvider services={mockService}>{children}</ServicesProvider>;
};

// レスポンシブテスト
export const ResponsiveLayout: Story = {
  decorators: [
    (Story) => (
      <RichMockServiceProvider>
        <Story />
      </RichMockServiceProvider>
    ),
  ],
  render: () => {
    const initialFolder = richFolders[0];
    return (
      <App
        initialState={{
          currentFolderPath: initialFolder?.path || '',
        }}
      />
    );
  },
};
