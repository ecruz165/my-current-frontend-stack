import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/demos/editor')({
  component: EditorDemoPage,
});

function EditorDemoPage() {
  return <h1 className="text-2xl font-semibold">Rich text editor</h1>;
}
