import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { readCatalog } from '../scripts/catalog.mjs';

const entries = await readCatalog();

async function expectChatGPTLink(link, prompt) {
  const href = `https://chatgpt.com/?prompt=${encodeURIComponent(prompt)}`;
  await expect(link).toHaveText('Use in ChatGPT');
  await expect(link).toHaveAttribute('href', href);
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  expect(new URL(await link.getAttribute('href')).searchParams.get('prompt')).toBe(prompt);
}

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

test('search, sorting and no-results recovery without categories or tags', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.prompt-card')).toHaveCount(entries.length);
  await expect(page.locator('#filters, .tags, [data-filter], .card-meta > span')).toHaveCount(0);
  await page.getByRole('searchbox').fill('不存在的作品');
  await expect(page.locator('#empty-state')).toBeVisible();
  await page.getByRole('button', { name: 'Reset search' }).click();
  await expect(page.getByRole('searchbox')).toHaveValue('');
  await expect(page.locator('#empty-state')).toBeHidden();
  await expect(page.locator('.prompt-card')).toHaveCount(entries.length);
  await page.getByLabel('Sort prompts').selectOption('oldest');
  const oldest = [...entries].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))[0];
  await expect(page.locator('.prompt-card').first()).toHaveAttribute('data-id', oldest.id);
  await page.getByRole('searchbox').fill('第二世界');
  await expect(page.locator('.prompt-card')).toHaveCount(1);
  await expect(page.locator('.prompt-card')).toHaveAttribute('data-id', 'second-world');
});

test('every card and detail hands the complete original prompt to ChatGPT', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.prompt-card')).toHaveCount(entries.length);
  for (const entry of entries) {
    const card = page.locator(`.prompt-card[data-id="${entry.id}"]`);
    await expectChatGPTLink(card.locator('.chatgpt-button'), entry.prompt);
    await card.locator('[data-action="open"]').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expectChatGPTLink(page.locator('#detail-chatgpt-button'), entry.prompt);
    await expect(page.locator('.prompt-text')).toHaveText(entry.prompt);
    await expect(page.locator('#detail-content .tags')).toHaveCount(0);
    await page.getByRole('button', { name: 'Close prompt', exact: true }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  }
});

test('ChatGPT links open a new tab without opening or closing prompt details', async ({ page, context }) => {
  await context.route('https://chatgpt.com/**', route => route.fulfill({
    contentType: 'text/html',
    body: '<!doctype html><title>ChatGPT handoff</title>',
  }));
  await page.goto('/');
  const entry = entries[0];
  const card = page.locator(`.prompt-card[data-id="${entry.id}"]`);
  const openChatGPT = async link => {
    const popupPromise = page.waitForEvent('popup');
    await link.click();
    const popup = await popupPromise;
    await popup.waitForLoadState('domcontentloaded');
    const destination = new URL(popup.url());
    expect(destination.origin).toBe('https://chatgpt.com');
    expect(destination.pathname).toBe('/');
    expect(destination.searchParams.get('prompt')).toBe(entry.prompt);
    expect(await popup.title()).toBe('ChatGPT handoff');
    await popup.close();
  };

  await openChatGPT(card.locator('.chatgpt-button'));
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page).not.toHaveURL(/#prompt=/);
  await card.locator('[data-action="open"]').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await openChatGPT(page.locator('#detail-chatgpt-button'));
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`#prompt=${entry.id}$`));
});

test('Chinese browser defaults, language/theme preferences and responsive width', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'zh-CN', colorScheme: 'dark', viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('.prompt-card')).toHaveCount(entries.length);
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('.chatgpt-button')).toHaveText(entries.map(() => '在 ChatGPT 中使用'));
  await page.locator('[data-action="open"]').first().click();
  await expect(page.locator('#detail-chatgpt-button')).toHaveText('在 ChatGPT 中使用');
  await page.getByRole('button', { name: '关闭详情', exact: true }).click();
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.setViewportSize({ width: 320, height: 844 });
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
