import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Group, Panel, Separator } from 'react-resizable-panels';
import type { HighlighterCore } from 'shiki/core';
import {
  type CodeHighlighterPlugin,
  type DiagramPlugin,
  Streamdown,
} from 'streamdown';
import {
  getHighlighter,
  loadMermaid,
  MarkdownView,
} from '@/components/organisms/MarkdownView';
import { Button } from '@/components/ui/button';
import { SAMPLE_MARKDOWN } from '@/mocks/sampleMarkdown';

// Streamdown ships no highlighter or diagram engine of its own — without
// plugins, streamed code stays plain and mermaid only works if something
// else already set globalThis.mermaid. These plugins reuse the exact
// modules the left panel loads: the slim shiki core and mermaid tiny.
// Not exported by streamdown; derived from the plugin contract instead.
type HighlightResult = NonNullable<
  ReturnType<CodeHighlighterPlugin['highlight']>
>;

let readyHighlighter: HighlighterCore | null = null;

function toHighlightResult(
  highlighter: HighlighterCore,
  code: string,
  lang: string,
): HighlightResult {
  return highlighter.codeToTokens(code, {
    lang: lang as Parameters<HighlighterCore['codeToTokens']>[1]['lang'],
    themes: { light: 'github-light', dark: 'github-dark' },
  });
}

const streamdownCodePlugin: CodeHighlighterPlugin = {
  name: 'shiki',
  type: 'code-highlighter',
  getThemes: () => ['github-light', 'github-dark'],
  getSupportedLanguages: () => ['typescript', 'ts'] as never[],
  supportsLanguage: (language) =>
    language === 'ts' || language === 'typescript',
  highlight: ({ code, language }, callback) => {
    // Streamdown probes with partial/empty languages while fences stream in.
    if (language !== 'ts' && language !== 'typescript') return null;
    if (readyHighlighter) {
      return toHighlightResult(readyHighlighter, code, language);
    }
    getHighlighter()
      .then((highlighter) => {
        readyHighlighter = highlighter;
        callback?.(toHighlightResult(highlighter, code, language));
      })
      .catch((error) => {
        console.warn('[streamdown shiki plugin] highlight failed:', error);
      });
    return null;
  },
};

const streamdownMermaidPlugin: DiagramPlugin = {
  name: 'mermaid',
  type: 'diagram',
  language: 'mermaid',
  // Streamdown wants a sync instance; hand it a facade that defers to the
  // async tiny loader and replays the last initialize() config.
  getMermaid: (config) => {
    let currentConfig = config as Record<string, unknown> | undefined;
    return {
      initialize: (nextConfig) => {
        currentConfig = nextConfig as unknown as Record<string, unknown>;
      },
      render: async (id, source) => {
        const mermaid = await loadMermaid();
        if (currentConfig) mermaid.initialize(currentConfig);
        return mermaid.render(id, source);
      },
    };
  },
};

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
              <Streamdown
                plugins={{
                  code: streamdownCodePlugin,
                  mermaid: streamdownMermaidPlugin,
                }}
              >
                {streamed}
              </Streamdown>
            ) : (
              <MarkdownView markdown={source} />
            )}
          </div>
        </Panel>
      </Group>
    </div>
  );
}
