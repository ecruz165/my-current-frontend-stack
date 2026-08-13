import { createFileRoute } from '@tanstack/react-router';
import { marked } from 'marked';
import { useMemo, useState } from 'react';
import { RichTextEditor } from '@/components/organisms/RichTextEditor';

export const Route = createFileRoute('/demos/editor')({
  component: EditorDemoPage,
});

function RawHtml({ html }: { html: string }) {
  // biome-ignore lint/security/noDangerouslySetInnerHtml: editor-local content
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

function HtmlPreview({ html }: { html: string }) {
  return (
    <div className="min-h-[8rem] rounded-md border p-4">
      <RawHtml html={html} />
    </div>
  );
}

function EditorDemoPage() {
  const [markdown, setMarkdown] = useState('');
  // Editor-local content only — nothing remote reaches this HTML.
  const html = useMemo(
    () => marked.parse(markdown, { async: false }),
    [markdown],
  );

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Rich text editor</h1>
      <div className="grid gap-4 lg:grid-cols-2">
        <RichTextEditor onMarkdownChange={setMarkdown} />
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">
            Markdown (tiptap-markdown)
          </h2>
          <pre className="min-h-[8rem] overflow-x-auto rounded-md border bg-muted/30 p-4 text-sm">
            {markdown || '—'}
          </pre>
          <h2 className="text-sm font-medium text-muted-foreground">
            HTML preview (marked)
          </h2>
          <HtmlPreview html={html} />
        </div>
      </div>
    </div>
  );
}
