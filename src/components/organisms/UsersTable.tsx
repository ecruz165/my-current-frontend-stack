import { useQuery } from '@tanstack/react-query';
import {
  type ColumnDef,
  type SortingState,
  useTable,
} from '@tanstack/react-table';
import { useState } from 'react';
import { Spinner } from '@/components/atoms/Spinner';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { SortableColumnHeader } from '@/components/molecules/SortableColumnHeader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { fetchUsers } from '@/lib/api';
import { features } from '@/lib/table';
import type { User } from '@/schemas/user';

const columns: ColumnDef<typeof features, User>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <SortableColumnHeader column={column}>Name</SortableColumnHeader>
    ),
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <SortableColumnHeader column={column}>Email</SortableColumnHeader>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

// Split in two because hooks can't sit below early returns: the outer
// component maps Query state, the inner one calls useTable.
export function UsersTable() {
  const query = useQuery({ queryKey: ['users'], queryFn: fetchUsers });

  if (query.isPending) return <Spinner />;
  if (query.isError) {
    return (
      <p role="alert" className="text-destructive">
        Could not load users: {query.error.message}
      </p>
    );
  }
  return <SortableUsersTable users={query.data} />;
}

function SortableUsersTable({ users }: { users: User[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useTable({
    features,
    columns,
    data: users,
    state: { sorting },
    onSortingChange: setSorting,
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder ? null : (
                  <table.FlexRender header={header} />
                )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getAllCells().map((cell) => (
              <TableCell key={cell.id}>
                <table.FlexRender cell={cell} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
