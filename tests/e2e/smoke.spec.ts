import { test, expect } from '@playwright/test';

const QBT_USER = process.env.QBT_USER ?? 'admin';
const QBT_PASS = process.env.QBT_PASS ?? 'adminadmin';
const QBT_URL = process.env.QBT_URL;

test.skip(!QBT_URL, 'QBT_URL not set — skipping live smoke test');

test('login → list → add → pause → delete', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('USERNAME').fill(QBT_USER);
  await page.getByLabel('PASSWORD').fill(QBT_PASS);
  await page.getByRole('button', { name: 'Connect' }).click();

  await expect(page.getByTestId('torrent-list')).toBeVisible();

  await page.getByRole('button', { name: '+ add' }).click();
  await page.getByLabel('URLS / MAGNETS', { exact: false }).fill(
    'magnet:?xt=urn:btih:c12fe1c06bba254a9dc9f519b335aa7c1367a88a&dn=archlinux',
  );
  await page.getByRole('button', { name: 'add', exact: true }).click();

  await expect(page.locator('text=archlinux').first()).toBeVisible({ timeout: 8000 });

  await page.locator('text=archlinux').first().click();
  await page.keyboard.press('p');     // pause via keybind

  // Delete via keybind
  await page.keyboard.press('d');
  await page.getByRole('button', { name: 'delete' }).click();
});
