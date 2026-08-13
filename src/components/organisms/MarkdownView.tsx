import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import { createHighlighterCore, type HighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

// Fine-grained shiki: only the TS grammar and the two github themes ship
// (the full bundle emits every grammar as its own chunk, several MB of
// dist), and the JavaScript regex engine drops the oniguruma wasm chunk.
// Unknown fence languages throw at highlight time and fall back to the
// plain <pre> below.
let highlighterPromise: Promise<HighlighterCore> | null = null;

export function getHighlighter() {
  highlighterPromise ??= createHighlighterCore({
    themes: [
      import('@shikijs/themes/github-light'),
      import('@shikijs/themes/github-dark'),
    ],
    langs: [import('@shikijs/langs/typescript')],
    engine: createJavaScriptRegexEngine(),
  });
  return highlighterPromise;
}

function ShikiBlock({ code, lang }: { code: string; lang: string }) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getHighlighter()
      .then((highlighter) => {
        const result = highlighter.codeToHtml(code, {
          lang,
          themes: { light: 'github-light', dark: 'github-dark' },
        });
        if (!cancelled) setHtml(result);
      })
      .catch(() => {
        if (!cancelled) setHtml(null);
      });
    return () => {
      cancelled = true;
    };
  }, [code, lang]);

  if (!html) return <pre className="overflow-x-auto text-sm">{code}</pre>;
  // Shiki output is generated locally from the page's own source text.
  // biome-ignore lint/security/noDangerouslySetInnerHtml: local shiki output
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

// Theme signal that works with and without ThemeProvider: the app's
// provider and Storybook's toolbar both toggle the dark class on <html>,
// so the class itself is the one source both worlds share.
function useIsDark() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark'),
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

// @mermaid-js/tiny is mermaid's official slim build (same version line,
// common diagram types only — no cytoscape/katex baggage). It is a
// classic-script IIFE: its top-level `var` only lands on globalThis when
// executed as a script, not as an ESM import, so it loads via a <script>
// tag pointing at the Vite asset URL. The promise is a singleton so
// concurrent diagrams share one load.
export interface MermaidApi {
  initialize(config: Record<string, unknown>): void;
  render(id: string, code: string): Promise<{ svg: string }>;
}

let mermaidPromise: Promise<MermaidApi> | null = null;

export function loadMermaid(): Promise<MermaidApi> {
  mermaidPromise ??= (async () => {
    const globals = globalThis as { mermaid?: MermaidApi };
    if (globals.mermaid) return globals.mermaid;
    const { default: scriptUrl } = await import(
      '@mermaid-js/tiny/dist/mermaid.tiny.js?url'
    );
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = scriptUrl;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error('mermaid tiny script failed to load'));
      document.head.appendChild(script);
    });
    if (!globals.mermaid) throw new Error('mermaid global not initialized');
    return globals.mermaid;
  })();
  return mermaidPromise;
}

function MermaidBlock({ code }: { code: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  const isDark = useIsDark();

  useEffect(() => {
    let cancelled = false;
    loadMermaid()
      .then(async (mermaid) => {
        // Mermaid themes are fixed at render time, so re-render on toggle.
        // themeVariables only apply with theme 'base', so dark mode builds
        // its look from base + variables tuned to the app's dark palette.
        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? 'base' : 'neutral',
          themeVariables: isDark
            ? {
                darkMode: true,
                background: '#171717',
                primaryColor: '#262626',
                primaryTextColor: '#fafafa',
                primaryBorderColor: '#525252',
                secondaryColor: '#262626',
                tertiaryColor: '#171717',
                lineColor: '#a3a3a3',
                edgeLabelBackground: 'transparent',
              }
            : undefined,
        });
        const { svg: rendered } = await mermaid.render(
          `mmd-${Math.random().toString(36).slice(2)}`,
          code,
        );
        if (!cancelled) setSvg(rendered);
      })
      .catch((error) => {
        // jsdom / bad diagrams: plain fallback — but never silently.
        console.warn('[MermaidBlock] falling back to plain code:', error);
        if (!cancelled) setSvg(null);
      });
    return () => {
      cancelled = true;
    };
  }, [code, isDark]);

  if (!svg) return <pre className="overflow-x-auto text-sm">{code}</pre>;
  // biome-ignore lint/security/noDangerouslySetInnerHtml: local mermaid output
  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
}

export function MarkdownView({ markdown }: { markdown: string }) {
  return (
    <div className="prose-sm max-w-none space-y-3 [&_table]:w-full [&_td]:border [&_td]:p-2 [&_th]:border [&_th]:p-2">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          code({ className, children }) {
            const language = /language-(\w+)/.exec(className ?? '')?.[1];
            const code = String(children).replace(/\n$/, '');
            if (language === 'mermaid') return <MermaidBlock code={code} />;
            if (language) return <ShikiBlock code={code} lang={language} />;
            return <code className="rounded bg-muted px-1">{children}</code>;
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
