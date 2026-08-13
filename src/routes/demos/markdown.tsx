import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/demos/markdown')({
  component: MarkdownDemoPage,
});

function MarkdownDemoPage() {
  return <h1 className="text-2xl font-semibold">Markdown pipeline</h1>;
}
