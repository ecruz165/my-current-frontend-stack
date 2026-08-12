import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { ThemeProvider } from '@/lib/theme';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('flips to dark, persists, then flips back to light', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Toggle theme' }));
    expect(document.documentElement).toHaveClass('dark');
    expect(localStorage.getItem('ui-theme')).toBe('dark');

    await user.click(screen.getByRole('button', { name: 'Toggle theme' }));
    expect(document.documentElement).not.toHaveClass('dark');
    expect(localStorage.getItem('ui-theme')).toBe('light');
  });
});
