import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '@/mocks/server';
import { UsersTable } from './UsersTable';

// Fresh QueryClient per test: no cross-test cache, and retry: false so
// errors surface immediately instead of after three background retries.
function renderUsersTable() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <UsersTable />
    </QueryClientProvider>,
  );
}

describe('UsersTable', () => {
  it('shows a spinner, then renders the fetched rows', async () => {
    renderUsersTable();
    // Query by accessible name: dnd-kit mounts its own role="status" live
    // region, so a bare role query would match the wrong element.
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
    expect(
      await screen.findByText('Alice Chen', undefined, { timeout: 3000 }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(11); // 1 header + 10 users
    expect(
      screen.queryByRole('status', { name: 'Loading' }),
    ).not.toBeInTheDocument();
  });

  it('shows the failure reason when the request errors', async () => {
    server.use(
      http.get('/api/users', () =>
        HttpResponse.json({ message: 'boom' }, { status: 500 }),
      ),
    );
    renderUsersTable();
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Failed to fetch users: 500');
  });

  it('renders a drag handle per row, disabled while a sort is active', async () => {
    renderUsersTable();
    await screen.findByText('Alice Chen', undefined, { timeout: 3000 });

    const handles = screen.getAllByRole('button', { name: /^Reorder / });
    expect(handles).toHaveLength(10);
    expect(handles[0]).toHaveAccessibleName('Reorder Walter Reyes');
    expect(handles[0]).toBeEnabled();

    await userEvent.click(screen.getByRole('button', { name: 'Name' }));
    for (const handle of screen.getAllByRole('button', { name: /^Reorder / })) {
      expect(handle).toBeDisabled();
    }
  });

  it('rejects malformed payloads instead of rendering bad rows', async () => {
    server.use(http.get('/api/users', () => HttpResponse.json([{ id: 123 }])));
    renderUsersTable();
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
