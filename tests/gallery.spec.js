import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { readCatalog } from '../scripts/catalog.mjs';

const entries = await readCatalog();
const illustrationCount = entries.filter(entry => entry.category === 'illustration').length;

test('cards, original comparison, exact prompt copying, details, and deep links', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await expect(page.locator('.prompt-card')).toHaveCount(entries.length);
  const first = page.locator('.prompt-card').first();
  await first.locator('[data-action="compare"]').click({ force: true });
  await expect(first).toHaveClass(/show-original/);
  await first.locator('[data-action="copy"]').click();
  const expected = (await readFile('content/second-world/prompt.txt', 'utf8')).trim();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(expected);
  await first.locator('[data-action="open"]').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('.prompt-text')).toHaveText(expected);
  await page.locator('[data-view="original"]').click();
  await expect(page.locator('#detail-image')).toHaveAttribute('src', /original\.jpg$/);
  await expect(page.locator('#full-size-link')).toHaveAttribute('href', /original\.jpg$/);
  await page.reload();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Close prompt', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('body')).not.toHaveClass(/dialog-open/);
});

test('search, categories, sorting and no-results recovery', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.prompt-card')).toHaveCount(entries.length);
  await page.getByRole('button', { name: 'Illustration', exact: true }).click();
  await expect(page.locator('.prompt-card')).toHaveCount(illustrationCount);
  await expect(page.locator('.prompt-card h3')).toContainText(entries.filter(entry => entry.category === 'illustration').map(entry => entry.title.en));
  await page.getByRole('button', { name: /All prompts/ }).click();
  await page.getByRole('searchbox').fill('不存在的作品');
  await expect(page.locator('#empty-state')).toBeVisible();
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await page.getByLabel('Sort prompts').selectOption('oldest');
  await expect(page.locator('.prompt-card h3').first()).toContainText('impasto');
  await page.getByRole('searchbox').fill('第二世界');
  await expect(page.locator('.prompt-card')).toHaveCount(1);
});

test('Chinese browser defaults, language/theme preferences and responsive width', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'zh-CN', colorScheme: 'dark', viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('.prompt-card')).toHaveCount(entries.length);
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('[data-action="open"]').first().click();
  expect(await page.evaluate(() => document.querySelector('dialog').scrollWidth <= innerWidth)).toBe(true);
  await context.close();
});

test('images load and desktop hover reveals the original', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('.prompt-card')).toHaveCount(entries.length);
  await expect.poll(() => page.locator('.generated-image').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
  if (testInfo.project.name === 'desktop') {
    const card = page.locator('.card-visual').first();
    await card.hover();
    await expect(card.locator('.original-image')).toHaveCSS('opacity', '1');
    await page.locator('#hero-title').hover();
    await expect(card.locator('.original-image')).toHaveCSS('opacity', '0');
  }
  expect(errors).toEqual([]);
});
