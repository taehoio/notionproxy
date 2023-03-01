import { test, expect } from '@playwright/test';

const TAEHOIO_BASE_URL = 'http://localhost:3000';

test('has title', async ({ page }) => {
  await page.goto(TAEHOIO_BASE_URL);

  await expect(page).toHaveTitle(/| TAEHO.IO/);
});
