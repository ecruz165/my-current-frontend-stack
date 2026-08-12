import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '@/lib/theme';
import { ThemeToggle } from './ThemeToggle';

// Clicking the story's toggle flips the real <html> class, visibly
// re-theming the whole Storybook preview — the mechanism, demonstrated.
const meta = {
  title: 'Molecules/ThemeToggle',
  component: ThemeToggle,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
