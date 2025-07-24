import type { Meta, StoryObj } from '@storybook/react-vite';
import { mockImageSourcesByFolderPath } from '../../data/mockData';
import { FolderList } from '../components/FolderList';
import type { FolderInfo } from '../types/viewerTypes';

const folders: FolderInfo[] = [
  {
    path: '/test_images/folder_1',
    name: 'フォルダ1',
    imageCount: mockImageSourcesByFolderPath['/test_images/folder_1']?.length,
  },
  {
    path: '/test_images/folder_2',
    name: 'フォルダ2',
    imageCount: mockImageSourcesByFolderPath['/test_images/folder_2']?.length,
  },
  {
    path: '/mock/empty-folder',
    name: '空のフォルダ',
    imageCount: 0,
  },
];

const meta: Meta<typeof FolderList> = {
  title: 'Viewer/FolderList',
  component: FolderList,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};
export default meta;

type Story = StoryObj<typeof FolderList>;

export const Default: Story = {
  args: {
    folders,
    selectedFolder: folders[0],
    onFolderSelect: (folder: FolderInfo) => alert(`選択: ${folder.name}`),
    onFolderDoubleClick: (folder: FolderInfo) =>
      alert(`ダブルクリック: ${folder.name}`),
    thumbnailSize: 80,
    showImageCount: true,
  },
};

export const NoSelection: Story = {
  args: {
    folders,
    selectedFolder: undefined,
    onFolderSelect: () => {},
    onFolderDoubleClick: () => {},
    thumbnailSize: 80,
    showImageCount: true,
  },
};

export const Empty: Story = {
  args: {
    folders: [],
    selectedFolder: undefined,
    onFolderSelect: () => {},
    onFolderDoubleClick: () => {},
    thumbnailSize: 80,
    showImageCount: true,
  },
};
