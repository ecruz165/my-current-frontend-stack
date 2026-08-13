import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import { codeToHtml } from 'shiki';

function ShikiBlock({ code, lang }: { code: string; lang: string }) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    codeToHtml(code, {
      lang,
      themes: { light: 'github-light', dark: 'github-dark' },
    })
      .then((result) => {
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

function MermaidBlock({ code }: { code: string }) {
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    import('mermaid')
      .then(async ({ default: mermaid }) => {
        mermaid.initialize({ startOnLoad: false, theme: 'neutral' });
        const { svg: rendered } = await mermaid.render(
          `mmd-${Math.random().toString(36).slice(2)}`,
          code,
        );
        if (!cancelled) setSvg(rendered);
      })
      .catch(() => {
        if (!cancelled) setSvg(null); // jsdom / bad diagrams: plain fallback
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

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
