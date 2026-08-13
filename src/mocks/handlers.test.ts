import { describe, expect, it } from 'vitest';
import { UserSchema } from '@/schemas/user';

describe('POST /api/invites handler', () => {
  it('creates a user from a valid invite', async () => {
    const response = await fetch('/api/invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Nia Adeyemi',
        email: 'nia.adeyemi@example.com',
        status: 'invited',
      }),
    });
    expect(response.status).toBe(201);
    const created = UserSchema.parse(await response.json());
    expect(created.name).toBe('Nia Adeyemi');
    expect(created.id).toMatch(/^u-/);
  });

  it('rejects an invalid invite with the Zod issues', async () => {
    const response = await fetch('/api/invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', email: 'nope', status: 'ghost' }),
    });
    expect(response.status).toBe(400);
    const body = (await response.json()) as { issues: unknown[] };
    expect(body.issues.length).toBeGreaterThan(0);
  });
});

describe('GET /api/users handler', () => {
  it('serves 10 schema-valid users', async () => {
    const response = await fetch('/api/users');
    expect(response.status).toBe(200);
    const parsed = UserSchema.array().parse(await response.json());
    expect(parsed).toHaveLength(10);
    expect(parsed[0]?.name).toBe('Walter Reyes');
  });
});
