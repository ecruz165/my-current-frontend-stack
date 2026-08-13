import { createFileRoute } from '@tanstack/react-router';
import { StackFlow } from '@/components/organisms/StackFlow';

export const Route = createFileRoute('/demos/flow')({
  component: FlowDemoPage,
});

function FlowDemoPage() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">Architecture flow</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        This repo, documenting itself — drag the nodes.
      </p>
      <StackFlow />
    </div>
  );
}
