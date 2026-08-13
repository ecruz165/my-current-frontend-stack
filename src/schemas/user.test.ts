import { describe, expect, it } from 'vitest';
import { InviteUserSchema, UserSchema } from './user';

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
    expect(() =>
      UserSchema.parse({ ...validUser, status: 'banned' }),
    ).toThrow();
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

describe('InviteUserSchema', () => {
  it('accepts a user without an id', () => {
    const { id: _id, ...invite } = validUser;
    expect(InviteUserSchema.parse(invite)).toEqual(invite);
  });

  it('strips the id field (invites have no id)', () => {
    expect(InviteUserSchema.parse(validUser)).not.toHaveProperty('id');
  });

  it('rejects a malformed invite', () => {
    expect(() =>
      InviteUserSchema.parse({ name: 'X', email: 'nope', status: 'active' }),
    ).toThrow();
  });
});
