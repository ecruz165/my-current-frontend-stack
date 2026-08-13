import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/demos/')({ component: DemosIndexPage });

function DemosIndexPage() {
  return <h1 className="text-2xl font-semibold">Demos</h1>;
}
