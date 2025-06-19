import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppMenuBar } from '../components/AppMenuBar';
import type { AppMenuBarEvent } from '../components/AppMenuBar';

const meta: Meta<typeof AppMenuBar> = {
  title: 'AppMenuBar',
  component: AppMenuBar,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof AppMenuBar>;

export const Default: Story = {
  args: {
    title: '漫画ビューア',
    onMenuAction: (action: AppMenuBarEvent) => alert(`Action: ${action}`),
  },
};
