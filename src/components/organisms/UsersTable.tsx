import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useQuery } from '@tanstack/react-query';
import {
  type ColumnDef,
  flexRender,
  type Row,
  type SortingState,
  useTable,
} from '@tanstack/react-table';
import { GripVertical } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Spinner } from '@/components/atoms/Spinner';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { SortableColumnHeader } from '@/components/molecules/SortableColumnHeader';
import { Button } from '@/components/ui/button';
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

// Manual (drag) order and column sorting are rival orderings, so the drag
// handles are only active while no sort is applied.
function RowDragHandle({ user, disabled }: { user: User; disabled: boolean }) {
  const { attributes, listeners } = useSortable({ id: user.id, disabled });

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      aria-label={`Reorder ${user.name}`}
      disabled={disabled}
      title={disabled ? 'Clear sorting to reorder' : undefined}
      className="cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <GripVertical aria-hidden className="size-4" />
    </Button>
  );
}

const columns: ColumnDef<typeof features, User>[] = [
  {
    id: 'drag-handle',
    header: '',
    cell: ({ row, table }) => (
      <RowDragHandle
        user={row.original}
        disabled={(table.options.state?.sorting?.length ?? 0) > 0}
      />
    ),
  },
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
  // Client-side manual order; a refetch re-seeds it (MSW is the backend by
  // design, so there is nowhere to persist the order).
  const [orderedUsers, setOrderedUsers] = useState(users);
  useEffect(() => setOrderedUsers(users), [users]);

  const sortActive = sorting.length > 0;
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const table = useTable({
    features,
    columns,
    data: orderedUsers,
    state: { sorting },
    onSortingChange: setSorting,
  });

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    setOrderedUsers((current) => {
      const oldIndex = current.findIndex((user) => user.id === active.id);
      const newIndex = current.findIndex((user) => user.id === over.id);
      return arrayMove(current, oldIndex, newIndex);
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
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
        <SortableContext
          items={orderedUsers.map((user) => user.id)}
          strategy={verticalListSortingStrategy}
        >
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <DraggableRow key={row.id} row={row} disabled={sortActive} />
            ))}
          </TableBody>
        </SortableContext>
      </Table>
    </DndContext>
  );
}

function DraggableRow({
  row,
  disabled,
}: {
  row: Row<typeof features, User>;
  disabled: boolean;
}) {
  const { setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.original.id,
    disabled,
  });

  return (
    <TableRow
      ref={setNodeRef}
      data-dragging={isDragging || undefined}
      className="relative data-dragging:z-10 data-dragging:opacity-80"
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      {row.getAllCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}
