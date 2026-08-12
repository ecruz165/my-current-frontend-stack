import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
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
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(
      await screen.findByText('Alice Chen', undefined, { timeout: 3000 }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(11); // 1 header + 10 users
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
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

  it('rejects malformed payloads instead of rendering bad rows', async () => {
    server.use(http.get('/api/users', () => HttpResponse.json([{ id: 123 }])));
    renderUsersTable();
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
