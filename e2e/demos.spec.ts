import { expect, test } from '@playwright/test';

test('demos index navigates and each demo responds to one interaction', async ({
  page,
}) => {
  await page.goto('/demos');

  // Editor: typing reaches the markdown preview via tiptap-markdown.
  await page.getByRole('link', { name: /Rich text editor/ }).click();
  const editorSurface = page.locator('.tiptap');
  await editorSurface.click();
  await page.keyboard.type('hello demo');
  await expect(page.getByText('hello demo').first()).toBeVisible();

  // Markdown: editing the source re-renders the right panel.
  await page.getByRole('link', { name: 'Markdown', exact: true }).click();
  const source = page.getByLabel('Markdown source');
  await source.fill('# Live edit proof');
  await expect(
    page.getByRole('heading', { name: 'Live edit proof' }),
  ).toBeVisible();

  // Flow: the architecture nodes render.
  await page.getByRole('link', { name: 'Flow' }).click();
  await expect(page.getByText('MSW handlers (mock backend)')).toBeVisible();

  // Form: invalid submit errors, valid submit confirms through MSW.
  await page.getByRole('link', { name: 'Form' }).click();
  await page.getByLabel('Email').fill('not-an-email');
  await page.getByRole('button', { name: 'Send invite' }).click();
  await expect(page.getByRole('alert').first()).toBeVisible();
  await page.getByLabel('Name').fill('Nia Adeyemi');
  await page.getByLabel('Email').fill('nia.adeyemi@example.com');
  await page.getByRole('button', { name: 'Send invite' }).click();
  await expect(page.getByRole('status')).toContainText('Invited Nia Adeyemi');
});
