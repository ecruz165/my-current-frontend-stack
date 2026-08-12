import { useQuery } from '@tanstack/react-query';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
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
import type { User } from '@/schemas/user';

const columns: ColumnDef<User>[] = [
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
// component maps Query state, the inner one calls useReactTable.
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
  const table = useReactTable({
    data: users,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
