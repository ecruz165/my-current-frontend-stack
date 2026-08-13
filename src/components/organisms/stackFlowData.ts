import type { Edge, Node } from '@xyflow/react';

// This repo's architecture, as data — the flow demo documents the app.
export const stackNodes: Node[] = [
  {
    id: 'main',
    position: { x: 250, y: 0 },
    data: { label: 'main.tsx (Theme + Query providers)' },
  },
  {
    id: 'router',
    position: { x: 250, y: 90 },
    data: { label: 'TanStack Router (__root template)' },
  },
  { id: 'home', position: { x: 60, y: 180 }, data: { label: '/ hello page' } },
  { id: 'users', position: { x: 250, y: 180 }, data: { label: '/users page' } },
  {
    id: 'demos',
    position: { x: 440, y: 180 },
    data: { label: '/demos section' },
  },
  {
    id: 'table',
    position: { x: 250, y: 270 },
    data: { label: 'UsersTable (Query + Table + dnd-kit)' },
  },
  {
    id: 'api',
    position: { x: 250, y: 360 },
    data: { label: 'fetchUsers (Zod boundary)' },
  },
  {
    id: 'msw',
    position: { x: 250, y: 450 },
    data: { label: 'MSW handlers (mock backend)' },
  },
];

export const stackEdges: Edge[] = [
  { id: 'main-router', source: 'main', target: 'router', animated: true },
  { id: 'router-home', source: 'router', target: 'home' },
  { id: 'router-users', source: 'router', target: 'users' },
  { id: 'router-demos', source: 'router', target: 'demos' },
  { id: 'users-table', source: 'users', target: 'table' },
  { id: 'table-api', source: 'table', target: 'api' },
  { id: 'api-msw', source: 'api', target: 'msw', animated: true },
];
