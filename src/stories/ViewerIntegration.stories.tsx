import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  sampleImageSources1,
  sampleImageSources2,
  sampleImageSources3,
} from '../../data/mockData';
import { mockFolders } from '../../data/mockData';
import { ImageViewer } from '../components/ImageViewer';
import { Sidebar } from '../components/Sidebar';
import { ServicesProvider } from '../context/ServiceContext';
import type { FileSystemService } from '../service/FileSystemService';

// モックファイルシステムサービス
const createMockFileSystemService = (
  _: typeof sampleImageSources1,
): FileSystemService => ({
  openDirectoryDialog: async () => '/mock/folder/path',
  listImagesInFolder: async (_folderPath: string) => {
    const folders = [
      sampleImageSources1,
      sampleImageSources2,
      sampleImageSources3,
    ];
    const mapped = mockFolders.map((folder, i) => {
      return {
        id: i,
        name: folder.name,
        path: folder.path,
        images: folders[i] || [],
      };
    });
    const matched = mapped.find((folder) => folder.path === _folderPath);

    if (!matched) {
      return [];
    }

    return matched.images.map((img) => img.assetUrl);
  },
  getSiblingFolders: async () => ['/mock/folder1', '/mock/folder2'],
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

const MockServiceProvider = ({
  children,
  images,
}: { children: React.ReactNode; images: typeof sampleImageSources1 }) => {
  const mockService = createMockFileSystemService(images);

  return <ServicesProvider services={mockService}>{children}</ServicesProvider>;
};

const meta: Meta = {
  title: 'Viewer/Integration',
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story, _context) => (
      <MockServiceProvider images={sampleImageSources1}>
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
    const [currentFolderPath, setCurrentFolderPath] = useState('');

    const selectedFolder = mockFolders.find(
      (folder) => folder.path === currentFolderPath,
    );

    return (
      <div className="h-screen flex bg-gray-100">
        <Sidebar
          folders={mockFolders}
          selectedFolder={selectedFolder}
          onFolderSelect={(folder) => {
            setCurrentFolderPath(folder.path);
          }}
          width={280}
        />
        <ImageViewer
          key={currentFolderPath} // フォルダが変更されたら再レンダリング
          folderPath={currentFolderPath}
          className="flex-1"
        />
      </div>
    );
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
    const [selectedFolder, setSelectedFolder] = useState(mockFolders[0]);

    return (
      <div className="h-screen bg-gray-100">
        <Sidebar
          folders={mockFolders}
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
    const [currentFolderPath, setCurrentFolderPath] =
      useState('/mock/folder/path');
    const [sidebarVisible, setSidebarVisible] = useState(true);

    const selectedFolder = mockFolders.find(
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
              folders={mockFolders}
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
