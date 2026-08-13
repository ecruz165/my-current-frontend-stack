import type { Meta, StoryObj } from '@storybook/react-vite';
import { StackFlow } from './StackFlow';

const meta = {
  title: 'Organisms/StackFlow',
  component: StackFlow,
} satisfies Meta<typeof StackFlow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
