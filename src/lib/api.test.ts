import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '@/mocks/server';
import { fetchUsers } from './api';

describe('fetchUsers', () => {
  it('returns schema-parsed users', async () => {
    const users = await fetchUsers();
    expect(users).toHaveLength(10);
    expect(users[0]).toMatchObject({ name: 'Walter Reyes', status: 'active' });
  });

  it('throws on a non-OK response', async () => {
    server.use(
      http.get('/api/users', () =>
        HttpResponse.json({ message: 'boom' }, { status: 500 }),
      ),
    );
    await expect(fetchUsers()).rejects.toThrow('Failed to fetch users: 500');
  });

  it('throws when the payload fails schema validation', async () => {
    server.use(
      http.get('/api/users', () => HttpResponse.json([{ id: 1, bogus: true }])),
    );
    await expect(fetchUsers()).rejects.toThrow();
  });
});
