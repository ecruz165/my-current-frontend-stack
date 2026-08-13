import { createFileRoute } from '@tanstack/react-router';
import { InviteUserForm } from '@/components/organisms/InviteUserForm';

export const Route = createFileRoute('/demos/form')({
  component: FormDemoPage,
});

function FormDemoPage() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">Invite a user</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        One Zod schema validates on both sides of the wire.
      </p>
      <InviteUserForm />
    </div>
  );
}
