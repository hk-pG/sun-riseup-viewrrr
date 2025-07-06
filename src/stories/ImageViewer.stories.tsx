import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { sampleImageSources1 } from '../../data/mockData';
import { ImageViewer } from '../components/ImageViewer';
import { ServicesProvider } from '../context/ServiceContext';
import type { FileSystemService } from '../service/FileSystemService';
import type { ViewerSettings } from '../types/viewerTypes';

// モックファイルシステムサービス
const createMockFileSystemService = (
  images: typeof sampleImageSources1,
): FileSystemService => ({
  openDirectoryDialog: async () => '/mock/folder/path',
  openFileDialog: async () => '/mock/file/path',
  listImagesInFolder: async () => images.map((img) => img.assetUrl),
  getSiblingFolders: async () => ['/mock/folder1', '/mock/folder2'],
  convertFileSrc: (filePath: string) => filePath,
  getBaseName: async (filePath: string) => filePath.split('/').pop() || '',
  getDirName: async (filePath: string) =>
    filePath.substring(0, filePath.lastIndexOf('/')),
});

const MockServiceProvider = ({
  children,
  images,
}: { children: React.ReactNode; images: typeof sampleImageSources1 }) => {
  const mockService = createMockFileSystemService(images);

  return <ServicesProvider services={mockService}>{children}</ServicesProvider>;
};

const meta: Meta<typeof ImageViewer> = {
  title: 'Viewer/ImageViewer',
  component: ImageViewer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    callbacks: {
      control: 'object',
    },
    settings: {
      control: 'object',
    },
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

type Story = StoryObj<typeof ImageViewer>;

const defaultSettings: ViewerSettings = {
  fitMode: 'both',
  zoom: 1,
  rotation: 0,
  backgroundColor: '#1a1a1a',
  showControls: true,
  autoHideControls: true,
  controlsTimeout: 3000,
};

export const Default: Story = {
  args: {
    folderPath: '/mock/folder/path',
    initialIndex: 0,
    settings: defaultSettings,
    className: 'w-full h-screen',
    callbacks: {
      onImageChange: (index, image) =>
        console.log('Image changed:', index, image.name),
      onZoomChange: (zoom) => console.log('Zoom changed:', zoom),
      onRotationChange: (rotation) =>
        console.log('Rotation changed:', rotation),
      onImageLoad: (image) => console.log('Image loaded:', image.name),
      onImageError: (error, image) =>
        console.log('Image error:', error, image.name),
    },
  },
};

export const WithCustomSettings: Story = {
  args: {
    folderPath: '/mock/folder/path',
    initialIndex: 0,
    settings: {
      ...defaultSettings,
      backgroundColor: '#2a2a2a',
      zoom: 1.2,
      rotation: 0,
    },
    className: 'w-full h-screen',
  },
};

export const StartingFromMiddle: Story = {
  args: {
    folderPath: '/mock/folder/path',
    initialIndex: 2,
    settings: defaultSettings,
    className: 'w-full h-screen',
  },
};

export const LightTheme: Story = {
  args: {
    folderPath: '/mock/folder/path',
    initialIndex: 0,
    settings: {
      ...defaultSettings,
      backgroundColor: '#f5f5f5',
    },
    className: 'w-full h-screen',
  },
};

export const FitWidthMode: Story = {
  args: {
    folderPath: '/mock/folder/path',
    initialIndex: 0,
    settings: {
      ...defaultSettings,
      fitMode: 'width',
    },
    className: 'w-full h-screen',
  },
};

export const FitHeightMode: Story = {
  args: {
    folderPath: '/mock/folder/path',
    initialIndex: 0,
    settings: {
      ...defaultSettings,
      fitMode: 'height',
    },
    className: 'w-full h-screen',
  },
};

export const WithoutControls: Story = {
  args: {
    folderPath: '/mock/folder/path',
    initialIndex: 0,
    settings: {
      ...defaultSettings,
      showControls: false,
    },
    className: 'w-full h-screen',
  },
};

// インタラクティブなストーリー
export const Interactive: Story = {
  args: {
    folderPath: '/mock/folder/path',
    initialIndex: 0,
    settings: defaultSettings,
    className: 'w-full h-screen',
  },
  render: (args) => {
    const [currentSettings, setCurrentSettings] = useState(
      args.settings || defaultSettings,
    );

    return (
      <ImageViewer
        {...args}
        settings={currentSettings}
        callbacks={{
          ...args.callbacks,
          onSettingsChange: (newSettings) => {
            setCurrentSettings((prev) => ({ ...prev, ...newSettings }));
            console.log('Settings changed:', newSettings);
          },
        }}
      />
    );
  },
};
