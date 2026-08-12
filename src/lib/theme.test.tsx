import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { ThemeProvider } from './theme';

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('applies a stored dark theme to <html> on mount', () => {
    localStorage.setItem('ui-theme', 'dark');
    render(
      <ThemeProvider>
        <p>content</p>
      </ThemeProvider>,
    );
    expect(document.documentElement).toHaveClass('dark');
  });

  it('defaults to the system theme (light in tests)', () => {
    render(
      <ThemeProvider>
        <p>content</p>
      </ThemeProvider>,
    );
    expect(document.documentElement).not.toHaveClass('dark');
  });
});
