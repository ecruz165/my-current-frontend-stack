import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { ThemeProvider } from '@/lib/theme';
import { AppHeader } from './AppHeader';

// Link needs a router in context; a throwaway memory-history router whose
// root route renders the story does the job. The dev-console warning about
// the unknown /users path inside this story router is expected.
const meta = {
  title: 'Organisms/AppHeader',
  component: AppHeader,
  decorators: [
    (Story) => {
      const rootRoute = createRootRoute({
        component: () => (
          <ThemeProvider>
            <Story />
          </ThemeProvider>
        ),
      });
      const router = createRouter({
        routeTree: rootRoute,
        history: createMemoryHistory({ initialEntries: ['/'] }),
      });
      return <RouterProvider router={router} />;
    },
  ],
} satisfies Meta<typeof AppHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
