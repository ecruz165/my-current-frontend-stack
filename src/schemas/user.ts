import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  status: z.enum(['active', 'invited', 'suspended']),
});

export type User = z.infer<typeof UserSchema>;
