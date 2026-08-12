import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { handlers } from '@/mocks/handlers';
import { UsersTable } from './UsersTable';

// Fresh QueryClient per render so the loading spinner is visible on every
// story visit; parameters.msw.handlers reuses the shared handlers module.
const meta = {
  title: 'Organisms/UsersTable',
  component: UsersTable,
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
  parameters: { msw: { handlers } },
} satisfies Meta<typeof UsersTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
