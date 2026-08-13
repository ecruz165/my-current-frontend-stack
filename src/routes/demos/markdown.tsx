import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { Streamdown } from 'streamdown';
import { MarkdownView } from '@/components/organisms/MarkdownView';
import { Button } from '@/components/ui/button';
import { SAMPLE_MARKDOWN } from '@/mocks/sampleMarkdown';

export const Route = createFileRoute('/demos/markdown')({
  component: MarkdownDemoPage,
});

function MarkdownDemoPage() {
  const [source, setSource] = useState(SAMPLE_MARKDOWN);
  const [streamed, setStreamed] = useState<string | null>(null);

  async function streamIt() {
    setStreamed('');
    const response = await fetch('/api/stream');
    if (!response.body) return;
    const reader = response.body
      .pipeThrough(new TextDecoderStream())
      .getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      setStreamed((current) => (current ?? '') + value);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Markdown pipeline</h1>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={streamIt}>
            Stream it
          </Button>
          {streamed !== null && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStreamed(null)}
            >
              Back to live editing
            </Button>
          )}
        </div>
      </div>
      <Group
        orientation="horizontal"
        className="min-h-[24rem] rounded-md border"
      >
        <Panel defaultSize="50" minSize="25">
          <textarea
            aria-label="Markdown source"
            className="size-full resize-none bg-background p-4 font-mono text-sm outline-none"
            value={source}
            onChange={(event) => setSource(event.target.value)}
          />
        </Panel>
        <Separator className="w-1 bg-border" />
        <Panel minSize="25">
          <div className="size-full overflow-auto p-4">
            {streamed !== null ? (
              <Streamdown>{streamed}</Streamdown>
            ) : (
              <MarkdownView markdown={source} />
            )}
          </div>
        </Panel>
      </Group>
    </div>
  );
}
