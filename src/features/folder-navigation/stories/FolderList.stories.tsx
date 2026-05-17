import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ServicesProvider } from '@/shared';
import { createMockFileSystemService } from '@/test/mocks';
import { mockImageSourcesByFolderPath } from '../../../../tests/fixtures/data/mockData';
import { type FolderInfo, FolderList } from '../index';

const folders: FolderInfo[] = [
  {
    path: '/tests/fixtures/images/folder_1',
    name: 'フォルダ1',
    imageCount:
      mockImageSourcesByFolderPath['/tests/fixtures/images/folder_1']?.length,
  },
  {
    path: '/tests/fixtures/images/folder_2',
    name: 'フォルダ2',
    imageCount:
      mockImageSourcesByFolderPath['/tests/fixtures/images/folder_2']?.length,
  },
  {
    path: '/mock/empty-folder',
    name: '空のフォルダ',
    imageCount: 0,
  },
];

const MockServiceProvider = ({ children }: { children: React.ReactNode }) => {
  const mockService = createMockFileSystemService();
  return <ServicesProvider services={mockService}>{children}</ServicesProvider>;
};

const meta = {
  title: 'FolderNavigation/FolderList',
  component: FolderList,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story, _context) => {
      return (
        <MockServiceProvider>
          <Story />
        </MockServiceProvider>
      );
    },
  ],
  args: {
    onFolderDoubleClick: fn(),
    onFolderSelect: fn(),
  },
} satisfies Meta<typeof FolderList>;
export default meta;

type Story = StoryObj<typeof FolderList>;

export const Default: Story = {
  args: {
    folders,
    selectedFolder: folders[0],
    thumbnailSize: 80,
    showImageCount: true,
  },
};

export const NoSelection: Story = {
  args: {
    folders,
    selectedFolder: undefined,
    thumbnailSize: 80,
    showImageCount: true,
  },
};

export const Empty: Story = {
  args: {
    folders: [],
    selectedFolder: undefined,
    thumbnailSize: 80,
    showImageCount: true,
  },
};
