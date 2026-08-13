import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StackFlow } from './StackFlow';

describe('StackFlow', () => {
  it('renders the architecture nodes', async () => {
    render(<StackFlow />);
    expect(await screen.findByText(/main\.tsx/)).toBeInTheDocument();
    expect(screen.getByText(/MSW handlers/)).toBeInTheDocument();
    expect(screen.getByText(/UsersTable/)).toBeInTheDocument();
  });
});
