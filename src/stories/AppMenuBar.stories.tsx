import type { Meta, StoryObj } from '@storybook/react-vite';
import type { AppMenuBarEvent } from '../features/app-shell';
import { AppMenuBar } from '../features/app-shell';

const meta: Meta<typeof AppMenuBar> = {
  title: 'AppMenuBar',
  component: AppMenuBar,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof AppMenuBar>;

export const Default: Story = {
  args: {
    onMenuAction: (action: AppMenuBarEvent) => alert(`Action: ${action}`),
  },
};
