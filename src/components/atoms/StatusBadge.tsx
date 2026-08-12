import { Badge } from '@/components/ui/badge';
import type { User } from '@/schemas/user';

type Status = User['status'];

// Record<Status, …> makes this map total: adding a fourth enum value to
// UserSchema breaks this file at compile time instead of rendering nothing.
const variantByStatus: Record<Status, 'default' | 'secondary' | 'destructive'> =
  {
    active: 'default',
    invited: 'secondary',
    suspended: 'destructive',
  };

export function StatusBadge({ status }: { status: Status }) {
  return <Badge variant={variantByStatus[status]}>{status}</Badge>;
}
