import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/demos/flow')({
  component: FlowDemoPage,
});

function FlowDemoPage() {
  return <h1 className="text-2xl font-semibold">Architecture flow</h1>;
}
