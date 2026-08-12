import { expect, test } from '@playwright/test';

test('rows reorder by dragging; handles disable under sort', async ({
  page,
}) => {
  await page.goto('/users');
  const rows = page.locator('tbody tr');
  await expect(rows).toHaveCount(10);
  await expect(rows.first()).toContainText('Walter Reyes');

  // Drag Walter's handle onto Miguel's (two rows down): the manual order
  // becomes Dana, Miguel, Walter, …
  const source = page.getByRole('button', { name: 'Reorder Walter Reyes' });
  const target = page.getByRole('button', { name: 'Reorder Miguel Santana' });
  const src = await source.boundingBox();
  const dst = await target.boundingBox();
  if (!src || !dst) throw new Error('handle bounding boxes unavailable');

  await page.mouse.move(src.x + src.width / 2, src.y + src.height / 2);
  await page.mouse.down();
  // dnd-kit's PointerSensor needs intermediate move events to track the drag.
  await page.mouse.move(dst.x + dst.width / 2, dst.y + dst.height / 2, {
    steps: 10,
  });
  await page.mouse.up();

  await expect(rows.first()).toContainText('Dana Whitfield');
  await expect(rows.nth(2)).toContainText('Walter Reyes');

  // Sorting disables the handles: manual order is only meaningful unsorted.
  await page.getByRole('button', { name: 'Name' }).click();
  await expect(
    page.getByRole('button', { name: 'Reorder Alice Chen' }),
  ).toBeDisabled();
});
