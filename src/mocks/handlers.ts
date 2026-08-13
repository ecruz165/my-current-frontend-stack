import { delay, HttpResponse, http } from 'msw';
import { InviteUserSchema } from '@/schemas/user';
import { users } from './fixtures';

export const handlers = [
  http.get('/api/users', async () => {
    // Artificial latency so the pending state is visible in the UI.
    await delay(500);
    return HttpResponse.json(users);
  }),
  http.post('/api/invites', async ({ request }) => {
    await delay(300);
    // The mocked server re-validates with the same schema the form uses:
    // one Zod source of truth on both sides of the wire.
    const result = InviteUserSchema.safeParse(await request.json());
    if (!result.success) {
      return HttpResponse.json(
        { issues: result.error.issues },
        { status: 400 },
      );
    }
    // Stateless by design: the created user is returned, never stored.
    const id = `u-${Math.random().toString(36).slice(2, 8)}`;
    return HttpResponse.json({ id, ...result.data }, { status: 201 });
  }),
];
