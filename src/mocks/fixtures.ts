import type { User } from '@/schemas/user';

// Deliberately unsorted: Walter is first so the default order is visibly
// unsorted; Alice Chen is alphabetically first (the e2e sort assertion
// depends on her rising to the top).
export const users: User[] = [
  {
    id: 'u-01',
    name: 'Walter Reyes',
    email: 'walter.reyes@example.com',
    status: 'active',
  },
  {
    id: 'u-02',
    name: 'Dana Whitfield',
    email: 'dana.whitfield@example.com',
    status: 'invited',
  },
  {
    id: 'u-03',
    name: 'Miguel Santana',
    email: 'miguel.santana@example.com',
    status: 'suspended',
  },
  {
    id: 'u-04',
    name: 'Alice Chen',
    email: 'alice.chen@example.com',
    status: 'active',
  },
  {
    id: 'u-05',
    name: 'Priya Nair',
    email: 'priya.nair@example.com',
    status: 'active',
  },
  {
    id: 'u-06',
    name: 'Tomas Herrera',
    email: 'tomas.herrera@example.com',
    status: 'invited',
  },
  {
    id: 'u-07',
    name: 'Yuki Tanaka',
    email: 'yuki.tanaka@example.com',
    status: 'active',
  },
  {
    id: 'u-08',
    name: 'Bram de Vries',
    email: 'bram.devries@example.com',
    status: 'suspended',
  },
  {
    id: 'u-09',
    name: 'Zoe Okafor',
    email: 'zoe.okafor@example.com',
    status: 'active',
  },
  {
    id: 'u-10',
    name: 'Karl Lindqvist',
    email: 'karl.lindqvist@example.com',
    status: 'invited',
  },
];
