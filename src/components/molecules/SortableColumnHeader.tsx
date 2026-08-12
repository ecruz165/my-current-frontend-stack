import type { Column } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface SortableColumnHeaderProps<TData> {
  column: Column<TData, unknown>;
  children: ReactNode;
}

export function SortableColumnHeader<TData>({
  column,
  children,
}: SortableColumnHeaderProps<TData>) {
  const sorted = column.getIsSorted();
  const Icon =
    sorted === 'asc' ? ArrowUp : sorted === 'desc' ? ArrowDown : ArrowUpDown;

  return (
    <Button
      type="button"
      variant="ghost"
      className="-ml-3"
      onClick={() => column.toggleSorting(sorted === 'asc')}
    >
      {children}
      <Icon aria-hidden className="ml-2 size-4" />
    </Button>
  );
}
