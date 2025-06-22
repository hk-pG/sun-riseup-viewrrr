import type { Meta, StoryObj } from '@storybook/react-vite';
import { sampleImageSources } from '../../data/mockData';
import { ImageDisplay } from '../components/ImageDisplay';
import type { ViewerSettings } from '../types/viewerTypes';

const meta: Meta<typeof ImageDisplay> = {
  title: 'Viewer/ImageDisplay',
  component: ImageDisplay,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    settings: {
      control: 'object',
    },
    onLoad: { action: 'image loaded' },
    onError: { action: 'image error' },
  },
};
export default meta;

type Story = StoryObj<typeof ImageDisplay>;

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
    image: sampleImageSources[0],
    settings: defaultSettings,
    className: 'w-full h-screen',
  },
};

export const ZoomedIn: Story = {
  args: {
    image: sampleImageSources[0],
    settings: {
      ...defaultSettings,
      zoom: 2,
    },
    className: 'w-full h-screen',
  },
};

export const Rotated: Story = {
  args: {
    image: sampleImageSources[0],
    settings: {
      ...defaultSettings,
      rotation: 90,
    },
    className: 'w-full h-screen',
  },
};

export const FitWidth: Story = {
  args: {
    image: sampleImageSources[0],
    settings: {
      ...defaultSettings,
      fitMode: 'width',
    },
    className: 'w-full h-screen',
  },
};

export const FitHeight: Story = {
  args: {
    image: sampleImageSources[0],
    settings: {
      ...defaultSettings,
      fitMode: 'height',
    },
    className: 'w-full h-screen',
  },
};

export const LightBackground: Story = {
  args: {
    image: sampleImageSources[0],
    settings: {
      ...defaultSettings,
      backgroundColor: '#f5f5f5',
    },
    className: 'w-full h-screen',
  },
};

export const ZoomedAndRotated: Story = {
  args: {
    image: sampleImageSources[0],
    settings: {
      ...defaultSettings,
      zoom: 1.5,
      rotation: 45,
    },
    className: 'w-full h-screen',
  },
};

export const PortraitImage: Story = {
  args: {
    image: sampleImageSources[1], // 縦長の画像
    settings: defaultSettings,
    className: 'w-full h-screen',
  },
};

export const LandscapeImage: Story = {
  args: {
    image: sampleImageSources[2], // 横長の画像
    settings: defaultSettings,
    className: 'w-full h-screen',
  },
};
