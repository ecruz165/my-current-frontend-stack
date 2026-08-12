import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './button';

const meta = {
  title: 'UI/Button',
  component: Button,
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: 'Click me' } };
export const Outline: Story = {
  args: { variant: 'outline', children: 'Outline' },
};
export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Delete' },
};
