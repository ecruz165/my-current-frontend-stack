import type { Column, RowData } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import type { Features } from '@/lib/table';

// Bound to the app's Features (which includes rowSortingFeature) so the
// sorting methods are guaranteed to exist on the column type.
interface SortableColumnHeaderProps<TData extends RowData> {
  column: Column<Features, TData, unknown>;
  children: ReactNode;
}

export function SortableColumnHeader<TData extends RowData>({
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
