import { HttpResponse, delay, http } from 'msw';
import { users } from './fixtures';

export const handlers = [
  http.get('/api/users', async () => {
    // Artificial latency so the pending state is visible in the UI.
    await delay(500);
    return HttpResponse.json(users);
  }),
];
