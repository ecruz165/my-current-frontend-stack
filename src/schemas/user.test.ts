import { describe, expect, it } from 'vitest';
import { UserSchema } from './user';

const validUser = {
  id: 'u-01',
  name: 'Alice Chen',
  email: 'alice.chen@example.com',
  status: 'active',
};

describe('UserSchema', () => {
  it('parses a valid user', () => {
    expect(UserSchema.parse(validUser)).toEqual(validUser);
  });

  it('rejects an unknown status', () => {
    expect(() => UserSchema.parse({ ...validUser, status: 'banned' })).toThrow();
  });

  it('rejects a malformed email', () => {
    expect(() =>
      UserSchema.parse({ ...validUser, email: 'not-an-email' }),
    ).toThrow();
  });

  it('rejects a missing field', () => {
    const { email: _email, ...withoutEmail } = validUser;
    expect(() => UserSchema.parse(withoutEmail)).toThrow();
  });
});
