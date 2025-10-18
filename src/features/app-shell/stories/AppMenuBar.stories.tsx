import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '@/providers/ThemeProvider';
import type { AppMenuBarEvent } from '../index';
import { AppMenuBar } from '../index';

const meta: Meta<typeof AppMenuBar> = {
  title: 'AppShell/AppMenuBar',
  component: AppMenuBar,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof AppMenuBar>;

export const Default: Story = {
  args: {
    onMenuAction: (action: AppMenuBarEvent) => alert(`Action: ${action}`),
  },
};
