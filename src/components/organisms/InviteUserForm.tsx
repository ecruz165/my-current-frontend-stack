import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type InviteUser, InviteUserSchema, type User } from '@/schemas/user';

async function postInvite(invite: InviteUser): Promise<User> {
  const response = await fetch('/api/invites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invite),
  });
  if (!response.ok) {
    throw new Error(`Invite rejected: ${response.status}`);
  }
  return (await response.json()) as User;
}

export function InviteUserForm() {
  const form = useForm<InviteUser>({
    resolver: zodResolver(InviteUserSchema),
    defaultValues: { name: '', email: '', status: 'invited' },
  });
  const mutation = useMutation({ mutationFn: postInvite });

  return (
    <form
      className="max-w-md space-y-4"
      onSubmit={form.handleSubmit((invite) => mutation.mutate(invite))}
      noValidate
    >
      <div className="space-y-1">
        <Label htmlFor="invite-name">Name</Label>
        <Input id="invite-name" {...form.register('name')} />
        {form.formState.errors.name && (
          <p role="alert" className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>
      <div className="space-y-1">
        <Label htmlFor="invite-email">Email</Label>
        <Input id="invite-email" type="email" {...form.register('email')} />
        {form.formState.errors.email && (
          <p role="alert" className="text-sm text-destructive">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>
      <div className="space-y-1">
        <Label htmlFor="invite-status">Status</Label>
        <select
          id="invite-status"
          className="flex h-8 w-full rounded-md border border-input bg-background px-2.5 text-sm"
          {...form.register('status')}
        >
          <option value="active">active</option>
          <option value="invited">invited</option>
          <option value="suspended">suspended</option>
        </select>
      </div>
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Sending…' : 'Send invite'}
      </Button>
      {mutation.isSuccess && (
        <p role="status" className="text-sm">
          Invited {mutation.data.name} ({mutation.data.id})
        </p>
      )}
      {mutation.isError && (
        <p role="alert" className="text-sm text-destructive">
          {mutation.error.message}
        </p>
      )}
    </form>
  );
}
