import { delay, HttpResponse, http } from 'msw';
import { InviteUserSchema } from '@/schemas/user';
import { users } from './fixtures';
import { SAMPLE_MARKDOWN } from './sampleMarkdown';

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
  http.get('/api/stream', () => {
    // Chunked stream mimicking an AI response — streamdown's whole reason
    // to exist.
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for (let i = 0; i < SAMPLE_MARKDOWN.length; i += 24) {
          controller.enqueue(encoder.encode(SAMPLE_MARKDOWN.slice(i, i + 24)));
          await delay(50);
        }
        controller.close();
      },
    });
    return new HttpResponse(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }),
];
