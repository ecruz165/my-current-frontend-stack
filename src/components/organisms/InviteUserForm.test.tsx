import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { InviteUserForm } from './InviteUserForm';

function renderForm() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <InviteUserForm />
    </QueryClientProvider>,
  );
}

describe('InviteUserForm', () => {
  it('shows Zod field errors on invalid submit', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.click(screen.getByRole('button', { name: 'Send invite' }));
    expect(await screen.findAllByRole('alert')).not.toHaveLength(0);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('submits a valid invite through MSW and shows the confirmation', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText('Name'), 'Nia Adeyemi');
    await user.type(screen.getByLabelText('Email'), 'nia.adeyemi@example.com');
    await user.selectOptions(screen.getByLabelText('Status'), 'invited');
    await user.click(screen.getByRole('button', { name: 'Send invite' }));
    expect(
      await screen.findByRole('status', undefined, { timeout: 3000 }),
    ).toHaveTextContent('Invited Nia Adeyemi');
  });
});
