import type { Meta, StoryObj } from '@storybook/react-vite';
import { SAMPLE_MARKDOWN } from '@/mocks/sampleMarkdown';
import { MarkdownView } from './MarkdownView';

const meta = {
  title: 'Organisms/MarkdownView',
  component: MarkdownView,
} satisfies Meta<typeof MarkdownView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SampleDocument: Story = {
  args: { markdown: SAMPLE_MARKDOWN },
};
