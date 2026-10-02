import { expect, test } from '@playwright/test';
const cards = [
  { id: 1, title: 'Establishing a product practice', icon: 'layers', position: 0, body: 'I helped build Tesla’s software product practice in EMEA, launching the SAF-T framework and Vehicle Registration Platform from zero. I then hired and developed product managers to take ownership and grow those products further.' },
  { id: 2, title: 'Earning regional autonomy', icon: 'globe', position: 1, body: 'Deep domain and technical knowledge built trust with our US counterparts, giving us a shared long-term strategy and the autonomy to execute within the global platform.' },
  { id: 3, title: 'Developing independent leaders', icon: 'users', position: 2, body: 'The work I’m proudest of is helping people become confident product leaders. Through consistent coaching, I help people navigate stakeholder challenges and take ownership of long-term product direction.' },
];
const settings = { about_text: 'I lead software product teams at Tesla in EMEA.', hero_picture: null, leadership_heading: 'Building products—and the teams that lead them.', leadership_cards: cards };
const post = { uuid: 'post-one', name: 'Product decisions', slug: 'product-decisions', canonical_url: 'http://127.0.0.1:8080/writing/product-decisions/', created_at: '2026-01-01', content: 'A complete article about product decisions.', picture: '', attachments: [], created_by: { username: 'lorenzo' } };
test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', route => {
    const url = route.request().url();
    const json = url.includes('/settings/') ? settings : url.includes('/blog/post/') ? { count: 1, results: [post], next: null } : url.includes('skillcategory') ? [] : { count: 0, results: [], next: null };
    return route.fulfill({ json });
  });
});
for (const width of [320, 390, 1023, 1024, 1280]) {
  test(`leadership cards settle without clipping at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('.leadership-cards')).toHaveClass(/is-animated/);
    await expect(page.locator('.pin-spacer > .leadership-scene')).toHaveCount(1);
    // Follow the reading flow rather than deriving a scroll destination from a
    // spacer while ScrollTrigger is still refreshing its layout in WebKit.
    await page.locator('#the-resume').scrollIntoViewIfNeeded();
    await expect.poll(() => page.locator('.leadership-card').last().evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42)).toBeLessThan(30);
    expect(await page.locator('.leadership-card').evaluateAll(els => els.every(el => el.scrollHeight <= el.clientHeight + 2))).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const positions = await page.locator('.leadership-card').evaluateAll(els => els.map(el => el.getBoundingClientRect().left));
    if (width >= 1024) expect(positions[1]).toBeGreaterThan(positions[0] + 100);
    else expect(Math.abs(positions[1] - positions[0])).toBeLessThan(15);
  });
}
test('short viewports and long CMS copy retain a readable static flow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 500 });
  await page.goto('/');
  await expect(page.locator('.leadership-card')).toHaveCount(3);
  await expect(page.locator('.leadership-cards')).not.toHaveClass(/is-animated/);
  await page.setViewportSize({ width: 390, height: 900 });
  const longCopy = { ...settings, leadership_cards: cards.map(card => ({ ...card, body: card.body.repeat(8) })) };
  await page.route('**/api/settings/1/', route => route.fulfill({ json: longCopy }));
  await page.reload();
  await expect(page.locator('.leadership-card').first()).toContainText(cards[0].body.repeat(8));
  await expect(page.locator('.leadership-cards')).not.toHaveClass(/is-animated/);
  expect(await page.locator('.leadership-card').evaluateAll(els => els.every(el => el.scrollHeight <= el.clientHeight + 2))).toBe(true);
});
test('background moves at different speeds and reduced motion restores normal flow', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.leadership-cards')).toHaveClass(/is-animated/);
  await page.evaluate(() => window.scrollTo({ top: 700, behavior: 'instant' }));
  await expect.poll(() => page.locator('.cloud-teal').evaluate(el => getComputedStyle(el).backgroundPositionY)).not.toBe('0px');
  const positions = await page.locator('.background-cloud').evaluateAll(els => els.map(el => getComputedStyle(el).backgroundPositionY));
  expect(new Set(positions).size).toBe(3);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.leadership-cards')).not.toHaveClass(/is-animated/);
  await expect(page.locator('.cloud-teal')).toHaveCSS('background-position-y', '0px');
});
test('article keyboard opening, focus trap, Escape and restoration', async ({ page }) => {
  await page.goto('/?post=product-decisions');
  const dialog = page.getByRole('dialog', { name: 'Product decisions', exact: true });
  await expect(dialog).toBeVisible();
  await expect(page).toHaveTitle('Product decisions — Lorenzo Spinelli');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', post.canonical_url);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(page).toHaveTitle('Lorenzo Spinelli — product leader, software & energy');
  const opener = page.getByRole('button', { name: 'Open Product decisions', exact: true });
  await opener.focus();
  await page.keyboard.press('Enter');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Close dialog' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  expect(await dialog.evaluate(el => el.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
});
test('contact uses native validation and submits 2000 characters through the form', async ({ page }) => {
  let payload: Record<string, string> | undefined;
  await page.route('**/api/contacts/', route => {
    payload = route.request().postDataJSON();
    return route.fulfill({ status: 202, json: { success: true } });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Click here to send me a message.' }).click();
  await page.getByLabel('First name', { exact: true }).fill('Ada');
  await page.getByLabel('Last name', { exact: true }).fill('Lovelace');
  await page.getByLabel('Email', { exact: true }).fill('invalid');
  await page.getByLabel('Message', { exact: true }).fill('x'.repeat(2000));
  await expect(page.locator('#content-help')).toHaveText('2000 / 2000 characters');
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  expect(payload).toBeUndefined();
  await page.getByLabel('Email', { exact: true }).fill('ada@example.test');
  await page.getByLabel('First name', { exact: true }).press('Enter');
  await expect(page.getByRole('status')).toContainText('Message received');
  expect(payload?.content.length).toBe(2000);
});
test('mobile résumé tabs support arrow-key navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const experience = page.getByRole('tab', { name: 'experience' });
  await experience.focus();
  await experience.press('ArrowRight');
  const education = page.getByRole('tab', { name: 'education' });
  await expect(education).toBeFocused();
  await expect(education).toHaveAttribute('aria-selected', 'true');
  await education.press('End');
  await expect(page.getByRole('tab', { name: 'skills' })).toBeFocused();
});
