import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { handlers } from '@/mocks/handlers';
import { InviteUserForm } from './InviteUserForm';

const meta = {
  title: 'Organisms/InviteUserForm',
  component: InviteUserForm,
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: { mutations: { retry: false } },
      });
      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
  parameters: { msw: { handlers } },
} satisfies Meta<typeof InviteUserForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
