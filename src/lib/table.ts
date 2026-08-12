import {
  createSortedRowModel,
  rowSortingFeature,
  sortFns,
  tableFeatures,
} from '@tanstack/react-table';

// TanStack Table v9 is feature-composed: only what's registered here ships
// in the bundle. One definition for every table in the app — sorting only.
export const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns,
});

export type Features = typeof features;
