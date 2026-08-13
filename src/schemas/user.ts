import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  status: z.enum(['active', 'invited', 'suspended']),
});

export type User = z.infer<typeof UserSchema>;

// Invites are users the server hasn't issued an id for yet. Deriving from
// UserSchema keeps one source of type truth for both shapes.
export const InviteUserSchema = UserSchema.omit({ id: true });

export type InviteUser = z.infer<typeof InviteUserSchema>;
