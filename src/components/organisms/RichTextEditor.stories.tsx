import type { Meta, StoryObj } from '@storybook/react-vite';
import { RichTextEditor } from './RichTextEditor';

const meta = {
  title: 'Organisms/RichTextEditor',
  component: RichTextEditor,
} satisfies Meta<typeof RichTextEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    initialMarkdown: '# Hello\n\nTry **bold**, _italic_, and @ mentions.',
  },
};
