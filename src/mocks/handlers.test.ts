import { describe, expect, it } from 'vitest';
import { UserSchema } from '@/schemas/user';

describe('GET /api/users handler', () => {
  it('serves 10 schema-valid users', async () => {
    const response = await fetch('/api/users');
    expect(response.status).toBe(200);
    const parsed = UserSchema.array().parse(await response.json());
    expect(parsed).toHaveLength(10);
    expect(parsed[0]?.name).toBe('Walter Reyes');
  });
});
