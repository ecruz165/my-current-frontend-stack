import { UserSchema, type User } from '@/schemas/user';

export async function fetchUsers(): Promise<User[]> {
  const response = await fetch('/api/users');
  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.status}`);
  }
  // Zod at the network boundary: malformed payloads throw here and surface
  // as a Query error instead of rendering bad rows.
  return UserSchema.array().parse(await response.json());
}
