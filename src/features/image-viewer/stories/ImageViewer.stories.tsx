import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { createMockFileSystemService } from '@/test/mocks';
import { mockImageSourcesByFolderPath } from '../../../../tests/fixtures/data/mockData';
import { ServicesProvider } from '../../../shared/context/ServiceContext';
import { ImageViewer } from '../components/ImageViewer';
import type { ImageSource } from '../types/ImageSource';
import type { ViewerSettings } from '../types/viewerTypes';

const images = mockImageSourcesByFolderPath['/tests/fixtures/images/folder_1'];

const MockServiceProvider = ({
  children,
  images,
}: {
  children: React.ReactNode;
  images: ImageSource[];
}) => {
  const mockService = createMockFileSystemService({
    listImagesInContainer: async () =>
      images.map((img: ImageSource) => img.assetUrl),
  });

  return <ServicesProvider services={mockService}>{children}</ServicesProvider>;
};

const meta: Meta<typeof ImageViewer> = {
  title: 'ImageViewer/ImageViewer',
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
      <MockServiceProvider images={images}>
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
