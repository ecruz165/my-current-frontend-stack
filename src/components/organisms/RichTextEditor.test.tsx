import { render, waitFor } from '@testing-library/react';
import type { Editor } from '@tiptap/react';
import { describe, expect, it } from 'vitest';
import { RichTextEditor } from './RichTextEditor';

// A holder object (not a bare `let`) so TypeScript's control-flow analysis
// doesn't narrow the closure-assigned editor to `never`.
function makeHolder() {
  return { editor: null as Editor | null, markdown: '' };
}

describe('RichTextEditor', () => {
  it('serializes bold text to markdown', async () => {
    const holder = makeHolder();
    render(
      <RichTextEditor
        onReady={(instance) => {
          holder.editor = instance;
        }}
        onMarkdownChange={(value) => {
          holder.markdown = value;
        }}
      />,
    );
    await waitFor(() => expect(holder.editor).not.toBeNull());
    holder.editor
      ?.chain()
      .focus()
      .insertContent('hello')
      .selectAll()
      .toggleBold()
      .run();
    await waitFor(() => expect(holder.markdown).toContain('**hello**'));
  });

  it('round-trips initial markdown', async () => {
    const holder = makeHolder();
    render(
      <RichTextEditor
        initialMarkdown="# Title"
        onReady={(instance) => {
          holder.editor = instance;
        }}
      />,
    );
    await waitFor(() =>
      expect(holder.editor?.getHTML()).toMatch(/<h1[^>]*>Title<\/h1>/),
    );
  });
});
