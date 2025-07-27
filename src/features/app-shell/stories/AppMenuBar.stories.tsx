import type { Meta, StoryObj } from '@storybook/react-vite';
import type { AppMenuBarEvent } from '../index';
import { AppMenuBar } from '../index';

const meta: Meta<typeof AppMenuBar> = {
  title: 'AppShell/AppMenuBar',
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
