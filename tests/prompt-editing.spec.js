import { test, expect } from '@playwright/test';
import { readCatalog } from '../scripts/catalog.mjs';

const entries = await readCatalog();
const secondWorld = entries.find(entry => entry.id === 'second-world');
const rubberStamp = entries.find(entry => entry.id === 'rubber-stamp');
const plainEntry = entries.find(entry => !entry.prompt.includes('{{'));
const editor = page => page.locator('.prompt-parameter[contenteditable="plaintext-only"]');
const card = (page, entry) => page.locator(`.prompt-card[data-id="${entry.id}"]`);

async function openPrompt(page, entry) {
  await card(page, entry).locator('[data-action="open"]').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
}

async function closePrompt(page) {
  await page.locator('#close-dialog').click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
}

async function expectPrompt(page, prompt) {
  await expect.poll(() => page.locator('.prompt-text').textContent()).toBe(prompt);
}

async function expectHandoff(link, prompt) {
  await expect(link).toHaveAttribute('href', `https://chatgpt.com/?prompt=${encodeURIComponent(prompt)}`);
  expect(new URL(await link.getAttribute('href')).searchParams.get('prompt')).toBe(prompt);
}

async function expectCopied(page, button, prompt) {
  await button.click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(prompt);
}

test('editing the highlighted ratio immediately updates copying and the ChatGPT handoff', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await context.route('https://chatgpt.com/**', route => route.fulfill({
    contentType: 'text/html',
    body: '<!doctype html><title>Edited prompt handoff</title>',
  }));
  await page.goto('/');
  await openPrompt(page, secondWorld);
  await expect(editor(page)).toHaveCount(1);
  await expect(editor(page)).toHaveText('2:3');
  await expect(editor(page)).toHaveAttribute('data-parameter-index', '0');
  await editor(page).fill('4:3');
  const edited = secondWorld.prompt.replace('{{2:3}}', '{{4:3}}');
  await expect(editor(page)).toBeFocused();
  await editor(page).press('Enter');
  await expect(editor(page)).not.toBeFocused();
  await expectPrompt(page, edited);
  await expectHandoff(page.locator('#detail-chatgpt-button'), edited);
  await expectCopied(page, page.locator('#detail-copy-button'), edited);

  const popupPromise = page.waitForEvent('popup');
  await page.locator('#detail-chatgpt-button').click();
  const popup = await popupPromise;
  await popup.waitForLoadState('domcontentloaded');
  expect(new URL(popup.url()).searchParams.get('prompt')).toBe(edited);
  await popup.close();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('drafts remain isolated and survive image, language, theme, and card actions during the visit', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await openPrompt(page, secondWorld);
  await editor(page).fill('4:3');
  const edited = secondWorld.prompt.replace('{{2:3}}', '{{4:3}}');
  await page.locator('[data-view="original"]').click();
  await expectPrompt(page, edited);
  await closePrompt(page);
  await expectHandoff(card(page, secondWorld).locator('.chatgpt-button'), edited);
  await expectCopied(page, card(page, secondWorld).locator('[data-action="copy"]'), edited);

  await openPrompt(page, rubberStamp);
  await expect(editor(page)).toHaveText('3:2');
  await expectPrompt(page, rubberStamp.prompt);
  await expectHandoff(page.locator('#detail-chatgpt-button'), rubberStamp.prompt);
  await closePrompt(page);
  await page.locator('#language-toggle').click();
  await page.locator('#theme-toggle').click();
  await openPrompt(page, secondWorld);
  await expect(editor(page)).toHaveText('4:3');
  await expectPrompt(page, edited);
  await expectHandoff(page.locator('#detail-chatgpt-button'), edited);
  await expectCopied(page, page.locator('#detail-copy-button'), edited);

  await page.reload();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(editor(page)).toHaveText('2:3');
  await expectPrompt(page, secondWorld.prompt);
  await expectHandoff(page.locator('#detail-chatgpt-button'), secondWorld.prompt);
});

test('multiple repeated and empty parameters stay independent and pasted text remains literal', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const fixture = 'First {{2:3}}, repeated {{2:3}}, empty {{}}.\nKeep <outside> & "quotes" unchanged.';
  await page.route('**/data/catalog.json', async route => {
    const response = await route.fetch();
    const catalog = await response.json();
    catalog.find(entry => entry.id === secondWorld.id).prompt = fixture;
    await route.fulfill({ response, json: catalog });
  });
  await page.goto('/');
  await openPrompt(page, secondWorld);
  await expect(editor(page)).toHaveCount(3);
  await expectPrompt(page, fixture);
  await editor(page).nth(0).fill('4:3');
  await editor(page).nth(1).fill('');
  const pasted = '<img src=x onerror="alert(1)"> & \'quoted\'\n第二行';
  await page.evaluate(text => navigator.clipboard.writeText(text), pasted);
  await editor(page).nth(2).focus();
  await editor(page).nth(2).press('ControlOrMeta+V');
  const edited = `First {{4:3}}, repeated {{}}, empty {{${pasted}}}.\nKeep <outside> & "quotes" unchanged.`;
  await expectPrompt(page, edited);
  await expect(page.locator('.prompt-text img, .prompt-text script')).toHaveCount(0);
  await expectHandoff(page.locator('#detail-chatgpt-button'), edited);
  await expectCopied(page, page.locator('#detail-copy-button'), edited);
  await closePrompt(page);
  await openPrompt(page, secondWorld);
  await expect(editor(page)).toHaveCount(3);
  await expect(editor(page).nth(0)).toHaveText('4:3');
  await expect(editor(page).nth(1)).toHaveText('');
  await expectPrompt(page, edited);
  await expectHandoff(page.locator('#detail-chatgpt-button'), edited);
});

test('a prompt without template parameters retains its exact text and actions', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await openPrompt(page, plainEntry);
  await expect(editor(page)).toHaveCount(0);
  await expectPrompt(page, plainEntry.prompt);
  await expectHandoff(page.locator('#detail-chatgpt-button'), plainEntry.prompt);
  await expectCopied(page, page.locator('#detail-copy-button'), plainEntry.prompt);
});
