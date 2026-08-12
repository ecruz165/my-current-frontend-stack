import { expect, test } from '@playwright/test';

test('hello card renders; users table sorts; theme toggles', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByText('Hello, world')).toBeVisible();

  await page.getByRole('link', { name: 'Users' }).click();
  await expect(page).toHaveURL(/\/users$/);

  const rows = page.locator('tbody tr');
  await expect(rows).toHaveCount(10);
  await expect(rows.first()).toContainText('Walter Reyes'); // fixture order

  await page.getByRole('button', { name: 'Name' }).click(); // sort asc
  await expect(rows.first()).toContainText('Alice Chen'); // alphabetical order

  // Playwright contexts default to a light color scheme, so the first
  // toggle click deterministically lands on dark.
  await page.getByRole('button', { name: 'Toggle theme' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
});
