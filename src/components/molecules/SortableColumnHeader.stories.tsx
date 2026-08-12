import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  type ColumnDef,
  type SortingState,
  useTable,
} from '@tanstack/react-table';
import { useState } from 'react';
import { features } from '@/lib/table';
import { users } from '@/mocks/fixtures';
import type { User } from '@/schemas/user';
import { SortableColumnHeader } from './SortableColumnHeader';

const columns: ColumnDef<typeof features, User>[] = [{ accessorKey: 'name' }];

// A Column instance only exists inside a table, so the story wraps the
// header in a minimal live table — click it and watch the list re-sort.
function SortableColumnHeaderDemo() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useTable({
    features,
    columns,
    data: users,
    state: { sorting },
    onSortingChange: setSorting,
  });
  const column = table.getColumn('name');
  if (!column) throw new Error('name column is not defined');

  return (
    <div className="space-y-2">
      <SortableColumnHeader column={column}>Name</SortableColumnHeader>
      <ol className="pl-4 text-sm">
        {table.getRowModel().rows.map((row) => (
          <li key={row.id}>{row.original.name}</li>
        ))}
      </ol>
    </div>
  );
}

// Untyped Meta on purpose: SortableColumnHeader is generic and
// Meta<typeof Component> cannot carry a free type parameter.
const meta: Meta = {
  title: 'Molecules/SortableColumnHeader',
  render: () => <SortableColumnHeaderDemo />,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
