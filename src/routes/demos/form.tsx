import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/demos/form')({
  component: FormDemoPage,
});

function FormDemoPage() {
  return <h1 className="text-2xl font-semibold">Invite a user</h1>;
}
