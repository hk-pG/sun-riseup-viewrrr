import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import App from '@/App';
import {
  getMockImageFolders,
  mockImageSourcesByFolderPath,
  mockSidebarOnlyFolders,
} from '../../data/mockData';
import { ImageViewer } from '../components/ImageViewer';
import { Sidebar } from '../components/Sidebar';
import { ServicesProvider } from '../context/ServiceContext';
import type { FileSystemService } from '../service/FileSystemService';

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
  convertFileSrc: (filePath: string) => filePath,
  getBaseName: async (filePath: string) => {
    const parts = filePath.split('/');
    return parts[parts.length - 1];
  },
  getDirName: async (filePath: string) => {
    const parts = filePath.split('/');
    return parts.slice(0, -1).join('/');
  },
});

const MockServiceProvider = ({ children }: { children: React.ReactNode }) => {
  const mockService = createMockFileSystemService();
  return <ServicesProvider services={mockService}>{children}</ServicesProvider>;
};

const meta: Meta = {
  title: 'Viewer/Integration',
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
      <div className="h-screen bg-gray-900">
        <ImageViewer
          folderPath="/mock/folder/path"
          initialIndex={currentIndex}
          className="w-full h-full"
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
      <div className="h-screen bg-gray-100">
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

// レスポンシブテスト
export const ResponsiveLayout: Story = {
  render: () => {
    // レスポンシブテストでも画像付き・画像なし両方のフォルダをサイドバーに表示
    const folders = [...getMockImageFolders(), ...mockSidebarOnlyFolders];
    const [currentFolderPath, setCurrentFolderPath] = useState(
      folders[0]?.path || '',
    );
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const selectedFolder = folders.find(
      (folder) => folder.path === currentFolderPath,
    );
    return (
      <div className="h-screen flex flex-col bg-gray-100">
        {/* ヘッダー */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">漫画ビューア</h1>
          <button
            type="button"
            onClick={() => setSidebarVisible(!sidebarVisible)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {sidebarVisible ? 'サイドバー非表示' : 'サイドバー表示'}
          </button>
        </div>
        {/* メインコンテンツ */}
        <div className="flex-1 flex">
          {sidebarVisible && (
            <Sidebar
              folders={folders}
              selectedFolder={selectedFolder}
              onFolderSelect={(folder) => setCurrentFolderPath(folder.path)}
              width={280}
            />
          )}
          <ImageViewer
            folderPath={currentFolderPath}
            initialIndex={0}
            className="flex-1"
          />
        </div>
      </div>
    );
  },
};
