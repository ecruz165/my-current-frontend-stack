import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MarkdownView } from './MarkdownView';

describe('MarkdownView', () => {
  it('renders GFM tables', async () => {
    render(<MarkdownView markdown={'| a | b |\n| - | - |\n| 1 | 2 |'} />);
    expect(await screen.findByRole('table')).toBeInTheDocument();
  });

  it('highlights code fences with shiki', async () => {
    const { container } = render(
      <MarkdownView markdown={'```ts\nconst x: number = 1;\n```'} />,
    );
    // The un-highlighted fallback shows the same text, so wait for the
    // shiki markup itself rather than the text content.
    await waitFor(
      () => expect(container.querySelector('pre.shiki')).toBeInTheDocument(),
      { timeout: 5000 },
    );
  });
});
