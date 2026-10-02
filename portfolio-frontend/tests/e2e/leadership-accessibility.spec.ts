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
    await expect.poll(() => page.locator('.leadership-card').last().evaluate((el, desktop) => {
      const transform = new DOMMatrixReadOnly(getComputedStyle(el).transform);
      return desktop ? transform.m41 : transform.m42;
    }, width >= 1024)).toBeLessThan(30);
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

for (const width of [390, 1280]) {
  test(`Skills setting removes the panel and keeps résumé navigation usable at ${width}px`, async ({ page }) => {
    await page.route('**/api/settings/1/', route => route.fulfill({ json: { ...settings, show_skills: false } }));
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.locator('#the-resume').scrollIntoViewIfNeeded();
    await expect(page.locator('#the-navbar .resume-subnav')).toHaveCount(1);
    await expect(page.locator('#skills')).toHaveCount(0);
    await expect(page.locator('#the-navbar').getByRole('button', { name: 'Skills', exact: true, includeHidden: true })).toHaveCount(0);
    await expect(page.getByRole('tab', { name: 'skills' })).toHaveCount(0);
    if (width < 640) {
      const experience = page.getByRole('tab', { name: 'experience' });
      await experience.focus();
      await experience.press('End');
      const education = page.getByRole('tab', { name: 'education' });
      await expect(education).toBeFocused();
      await expect(education).toHaveAttribute('aria-selected', 'true');
      await education.press('ArrowRight');
      await expect(experience).toBeFocused();
    } else {
      await page.locator('#the-resume').getByRole('button', { name: 'Scroll resume carousel right' }).click();
      await expect(page.locator('#education')).not.toHaveAttribute('inert', '');
    }
  });
}

for (const width of [390, 1280]) {
  test(`CMS highlights labels reach the section and navigation at ${width}px`, async ({ page }) => {
    await page.route('**/api/settings/1/', route => route.fulfill({ json: {
      about_text: settings.about_text, hero_picture: null, show_skills: false,
      highlights_heading: 'Work that matters', highlights_nav_label: 'Selected work',
      highlights_eyebrow: 'My impact', highlight_cards: cards,
    } }));
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Scroll to explore the portfolio' }).click();
    await expect(page.locator('.navbar-surface')).toHaveCSS('opacity', '1');
    if (width < 640) await page.getByRole('button', { name: 'Open main menu' }).click();
    await page.getByRole('button', { name: 'Selected work', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Work that matters', exact: true })).toBeVisible();
    await expect(page.locator('#the-leadership header')).toContainText('My impact');
    await expect(page.locator('#the-navbar').getByRole('button', { name: 'Leadership', exact: true, includeHidden: true })).toHaveCount(0);
  });
}

for (const width of [390, 1280]) {
  test(`contact dialog isolates scrolling and restores the page at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 600 });
    await page.goto('/');
    const opener = page.getByRole('button', { name: 'Click here to send me a message.' });
    await opener.scrollIntoViewIfNeeded();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500);
    await page.waitForTimeout(500);
    await opener.click();
    const dialog = page.getByRole('dialog', { name: 'Contact form' });
    await expect(dialog).toBeVisible();
    await expect(dialog).not.toContainText('Extra title content');
    await expect(page.locator('body')).not.toHaveCSS('position', 'fixed');
    const before = await page.evaluate(() => window.scrollY);
    await expect(page.locator('.navbar-surface')).toHaveCSS('opacity', '1');
    const navbarTop = await page.locator('#the-navbar').evaluate(el => el.getBoundingClientRect().top);
    expect(Math.abs(navbarTop)).toBeLessThan(1);
    const content = dialog.locator('.bottom-sheet__content');
    await page.waitForTimeout(450);
    const hasOverflow = await content.evaluate(el => el.scrollHeight > el.clientHeight);
    await content.hover();
    await page.mouse.wheel(0, 500);
    if (hasOverflow) await expect.poll(() => content.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
    await content.evaluate(el => { el.scrollTop = el.scrollHeight; });
    const backgroundTop = await page.locator('#the-contacts').evaluate(el => el.getBoundingClientRect().top);
    await page.getByLabel('Message', { exact: true }).hover();
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(250);
    expect(await page.locator('#the-contacts').evaluate(el => el.getBoundingClientRect().top)).toBeCloseTo(backgroundTop, 0);
    const close = dialog.getByRole('button', { name: 'Close dialog' });
    const insets = await close.evaluate(el => { const c=el.closest('[role=dialog]')!.getBoundingClientRect();const b=el.getBoundingClientRect(); return [b.top-c.top,c.right-b.right]; });
    expect(insets[0]).toBeCloseTo(insets[1], 0);
    await close.click();
    await expect(page.locator('body')).not.toHaveCSS('position', 'fixed');
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeCloseTo(before, 0);
    await expect(opener).toBeFocused();
  });
}

for (const width of [768, 1280]) {
  test(`two résumé panels support repeated round trips and resizing at ${width}px`, async ({ page }) => {
    await page.route('**/api/settings/1/', route => route.fulfill({ json: { ...settings, show_skills: false } }));
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.locator('#the-resume').scrollIntoViewIfNeeded();
    const right = page.getByRole('button', { name: 'Scroll resume carousel right' });
    const left = page.getByRole('button', { name: 'Scroll resume carousel left' });
    for (let round=0;round<3;round++) {
      await expect(right).toBeVisible();
      await expect(left).not.toBeVisible();
      await right.click();
      await expect(right).not.toBeVisible();
      await expect(left).toBeVisible();
      await expect(page.locator('#education')).not.toHaveAttribute('inert', '');
      await left.click();
      await expect(left).not.toBeVisible();
      await expect(page.locator('#experience')).not.toHaveAttribute('inert', '');
      if (round===1) await page.setViewportSize({ width: width+73, height: 900 });
    }
  });
}

for (const width of [390, 1280]) {
  test(`Explore and About leave the navbar attached and begin the timeline immediately at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const scene = page.locator('.leadership-scene');
    await expect(scene).toHaveAttribute('data-scroll-start', /\d/);
    const pinTop = Number(await scene.getAttribute('data-pin-top'));
    await page.getByRole('button', { name: 'Scroll to explore the portfolio' }).click();
    await expect.poll(() => scene.evaluate(el => el.getBoundingClientRect().top)).toBeCloseTo(pinTop, 0);
    expect(await page.locator('#the-navbar').evaluate(el => el.getBoundingClientRect().top)).toBe(0);
    if (width >= 1024) {
      const centerError = await scene.evaluate(el => {
        const rect = el.getBoundingClientRect();
        const nav = document.getElementById('the-navbar')!.getBoundingClientRect();
        return Math.abs(rect.top + rect.height / 2 - (innerHeight + nav.height) / 2);
      });
      expect(centerError).toBeLessThan(3);
    }
    const card = page.locator('.leadership-card').nth(1);
    const axis = width >= 1024 ? 'm41' : 'm42';
    const before = await card.evaluate((el, axis) => new DOMMatrixReadOnly(getComputedStyle(el).transform)[axis], axis);
    await page.mouse.wheel(0, 40);
    await expect.poll(() => card.evaluate((el, axis) => new DOMMatrixReadOnly(getComputedStyle(el).transform)[axis], axis)).toBeLessThan(before - 10);
    expect(await scene.evaluate(el => el.getBoundingClientRect().top)).toBeCloseTo(pinTop, 0);
    await page.locator('#the-resume').scrollIntoViewIfNeeded();
    if (width < 640) {
      await page.getByRole('button', { name: 'Open main menu' }).click();
      await page.locator('#mobile-menu button').nth(1).click();
    } else {
      await page.locator('.navbar-surface').getByRole('button', { name: 'Highlights', exact: true }).click();
    }
    await expect.poll(() => scene.evaluate(el => el.getBoundingClientRect().top)).toBeCloseTo(pinTop, 0);
    expect(await page.locator('#the-navbar').evaluate(el => el.getBoundingClientRect().top)).toBe(0);
  });
}

test('wide displays hide upcoming highlights until their entrance and reduced motion restores visibility', async ({ page }) => {
  await page.setViewportSize({ width: 2560, height: 1440 });
  await page.goto('/');
  await expect(page.locator('.leadership-cards')).toHaveClass(/is-animated/);
  const highlights = page.locator('.leadership-card');
  await expect(highlights.first()).toHaveCSS('opacity', '1');
  await expect(highlights.nth(1)).toHaveCSS('opacity', '0');
  await expect(highlights.nth(2)).toHaveCSS('opacity', '0');
  await expect.poll(() => page.locator('.leadership-scene').getAttribute('data-scroll-start')).not.toBeNull();
  await page.locator('.leadership-scene').evaluate(el => {
    window.scrollTo({ top: Number((el as HTMLElement).dataset.scrollStart) + innerHeight * .45, behavior: 'instant' });
  });
  await expect.poll(() => highlights.nth(1).evaluate(el => +getComputedStyle(el).opacity)).toBeGreaterThan(0);
  expect(await highlights.nth(1).evaluate(el => +getComputedStyle(el).opacity)).toBeLessThan(1);
  await expect(highlights.nth(2)).toHaveCSS('opacity', '0');
  await page.locator('#the-resume').scrollIntoViewIfNeeded();
  await expect(highlights.last()).toHaveCSS('opacity', '1');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.leadership-cards')).not.toHaveClass(/is-animated/);
  expect(await highlights.evaluateAll(els => els.every(el => getComputedStyle(el).opacity === '1'))).toBe(true);
});

for (const width of [390, 1280]) {
  test(`highlights navigation sticks the navbar in reduced motion at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('.leadership-card')).toHaveCount(3);
    await page.getByRole('button', { name: 'Scroll to explore the portfolio' }).click();
    await expect.poll(() => page.locator('#the-navbar').evaluate(el => el.getBoundingClientRect().top)).toBe(0);
    await page.locator('#the-resume').scrollIntoViewIfNeeded();
    if (width < 640) {
      await page.getByRole('button', { name: 'Open main menu' }).click();
      await page.locator('#mobile-menu button').nth(1).click();
    } else {
      await page.locator('.navbar-surface').getByRole('button', { name: 'Highlights', exact: true }).click();
    }
    await expect.poll(() => page.locator('#the-navbar').evaluate(el => el.getBoundingClientRect().top)).toBe(0);
    expect(await page.locator('.leadership-card').evaluateAll(els => els.every(el => getComputedStyle(el).opacity === '1'))).toBe(true);
  });
}
