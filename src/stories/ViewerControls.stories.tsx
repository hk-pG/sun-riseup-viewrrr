import type { Meta, StoryObj } from '@storybook/react-vite';
import { ViewerControls } from '../components/ViewerControls';

const meta: Meta<typeof ViewerControls> = {
  title: 'Viewer/ViewerControls',
  component: ViewerControls,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    onPrevious: { action: 'previous clicked' },
    onNext: { action: 'next clicked' },
    onZoomIn: { action: 'zoom in clicked' },
    onZoomOut: { action: 'zoom out clicked' },
    onResetZoom: { action: 'reset zoom clicked' },
  },
};
export default meta;

type Story = StoryObj<typeof ViewerControls>;

export const Default: Story = {
  args: {
    currentIndex: 0,
    totalImages: 10,
    zoom: 1,
    isVisible: true,
  },
  decorators: [
    (Story) => (
      <div className="relative w-full h-screen bg-gray-900">
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <p>ビューアエリア（コントロールは下部に表示）</p>
        </div>
        <Story />
      </div>
    ),
  ],
};

export const MiddlePage: Story = {
  args: {
    currentIndex: 5,
    totalImages: 10,
    zoom: 1,
    isVisible: true,
  },
  decorators: [
    (Story) => (
      <div className="relative w-full h-screen bg-gray-900">
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <p>ビューアエリア（コントロールは下部に表示）</p>
        </div>
        <Story />
      </div>
    ),
  ],
};

export const LastPage: Story = {
  args: {
    currentIndex: 9,
    totalImages: 10,
    zoom: 1,
    isVisible: true,
  },
  decorators: [
    (Story) => (
      <div className="relative w-full h-screen bg-gray-900">
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <p>ビューアエリア（コントロールは下部に表示）</p>
        </div>
        <Story />
      </div>
    ),
  ],
};

export const ZoomedIn: Story = {
  args: {
    currentIndex: 5,
    totalImages: 10,
    zoom: 2.5,
    isVisible: true,
  },
  decorators: [
    (Story) => (
      <div className="relative w-full h-screen bg-gray-900">
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <p>ビューアエリア（コントロールは下部に表示）</p>
        </div>
        <Story />
      </div>
    ),
  ],
};

export const ZoomedOut: Story = {
  args: {
    currentIndex: 5,
    totalImages: 10,
    zoom: 0.5,
    isVisible: true,
  },
  decorators: [
    (Story) => (
      <div className="relative w-full h-screen bg-gray-900">
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <p>ビューアエリア（コントロールは下部に表示）</p>
        </div>
        <Story />
      </div>
    ),
  ],
};

export const Hidden: Story = {
  args: {
    currentIndex: 5,
    totalImages: 10,
    zoom: 1,
    isVisible: false,
  },
  decorators: [
    (Story) => (
      <div className="relative w-full h-screen bg-gray-900">
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <p>ビューアエリア（コントロールは非表示）</p>
        </div>
        <Story />
      </div>
    ),
  ],
};

export const SingleImage: Story = {
  args: {
    currentIndex: 0,
    totalImages: 1,
    zoom: 1,
    isVisible: true,
  },
  decorators: [
    (Story) => (
      <div className="relative w-full h-screen bg-gray-900">
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <p>ビューアエリア（コントロールは下部に表示）</p>
        </div>
        <Story />
      </div>
    ),
  ],
};

export const ManyImages: Story = {
  args: {
    currentIndex: 50,
    totalImages: 100,
    zoom: 1,
    isVisible: true,
  },
  decorators: [
    (Story) => (
      <div className="relative w-full h-screen bg-gray-900">
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <p>ビューアエリア（コントロールは下部に表示）</p>
        </div>
        <Story />
      </div>
    ),
  ],
};
