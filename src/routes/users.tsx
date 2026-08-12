import { createFileRoute } from '@tanstack/react-router';
import { UsersTable } from '@/components/organisms/UsersTable';

export const Route = createFileRoute('/users')({ component: UsersPage });

function UsersPage() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">Users</h1>
      <UsersTable />
    </main>
  );
}
