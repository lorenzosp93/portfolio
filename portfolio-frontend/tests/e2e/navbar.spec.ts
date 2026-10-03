import { expect, test, type Page } from '@playwright/test';
import { timelineResponse } from './timeline.fixture';

const entries = Array.from({ length: 6 }, (_, i) => ({
  uuid: `nav-entry-${i}`, name: `Role ${i}`, start_date: `${2012 + i * 2}-01-01`,
  description: 'Building products and developing teams.', current: i === 5,
  entity: { uuid: 'org', name: 'Organization', picture: '/favicon-32x32.png' },
  keywords: [], projects: [], attachments: [],
  narrative_heading: i === 0 ? 'Foundations' : '', narrative_body: i === 0 ? 'Learning by doing.' : '',
}));

test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', route => {
    const url = route.request().url();
    const json = url.includes('/timeline/') ? timelineResponse(entries)
      : url.includes('/settings/') ? {
        show_skills: true, highlights_nav_label: 'About',
        highlight_cards: [1, 2, 3].map(id => ({ id, title: `Highlight ${id}`, body: 'Helping people develop and build thoughtful products.', icon: 'layers', position: id })),
      } : url.includes('/blog/post/') ? { count: 1, next: null, results: [{
        uuid: 'post-one', name: 'Product decisions', slug: 'product-decisions', created_at: '2026-01-01',
        content: 'A complete article about product decisions.', picture: '', attachments: [], created_by: { username: 'lorenzo' },
      }] } : url.includes('skillcategory') ? [] : { count: 0, results: [], next: null };
    return route.fulfill({ json });
  });
});

async function expectActive(page: Page, label: string) {
  await expect(page.locator('.mobile-link.active')).toHaveText(label);
  await expect(page.locator('.nav-link.active_top_text')).toHaveText(label);
  await expect(page.locator('#mobile-menu [aria-current="location"]')).toHaveCount(1);
  await expect(page.locator('.nav-link[aria-current="location"]')).toHaveCount(1);
  if (page.viewportSize()!.width >= 640) {
    await expect.poll(() => page.locator('#the-navbar').evaluate(nav => {
      const indicator = nav.querySelector('.nav-active-indicator')!;
      const selected = nav.querySelector('.nav-link[aria-current="location"]')!;
      const pill = indicator.getBoundingClientRect(), button = selected.getBoundingClientRect();
      return Math.max(Math.abs(pill.left - button.left), Math.abs(pill.width - button.width));
    })).toBeLessThan(1);
    await expect(page.locator('.nav-active-indicator')).toHaveCSS('opacity', '1');
  }
}

async function readSection(page: Page, selector: string, fraction = 0) {
  await page.locator(selector).evaluate((el, progress) => {
    const bounds = el.getBoundingClientRect();
    scrollTo({ top: scrollY + bounds.top + bounds.height * progress - 90, behavior: 'instant' });
  }, fraction);
}

async function resizeAndSettle(page: Page, width: number) {
  await page.setViewportSize({ width, height: 844 });
  // The pinned highlights rebuild after a 200ms resize debounce. Wait for the
  // document geometry to settle before choosing the next reading position.
  await page.locator('#the-blog').evaluate(async el => {
    let previous = '', stableSince = performance.now();
    const start = performance.now();
    while (performance.now() - start < 5000) {
      await new Promise(requestAnimationFrame);
      const geometry = `${el.getBoundingClientRect().top}:${document.documentElement.scrollHeight}:${scrollY}`;
      if (geometry !== previous) { previous = geometry; stableSince = performance.now(); }
      if (performance.now() - stableSince > 350) return;
    }
    throw new Error('Page geometry did not settle after resize');
  });
}

for (const width of [390, 1280]) {
  for (const reducedMotion of ['reduce', 'no-preference'] as const) {
    test(`navbar follows reading and resizing at ${width}px with ${reducedMotion}`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.setViewportSize({ width, height: 844 });
      await page.emulateMedia({ reducedMotion });
      await page.goto('/');
      await expect(page.locator('.journey-world')).toHaveClass(/is-ready/);
      await expect(page.locator('.leadership-card')).toHaveCount(3);
      await expect(page.locator('#mobile-menu .mobile-link')).toHaveText(['About', 'Resume', 'Blog', 'Contacts']);
      await page.getByRole('button', { name: 'Scroll to explore the portfolio' }).click();
      await expectActive(page, 'About');
      if (width < 640) await page.getByRole('button', { name: 'Open main menu' }).click();
      await page.getByRole('button', { name: 'Resume', exact: true }).click();
      await expectActive(page, 'Resume');
      await readSection(page, '#the-resume', .5);
      await expectActive(page, 'Resume');
      await readSection(page, '#skills');
      await expectActive(page, 'Resume');
      // Resume still intersects the top 90px here; it must not override Blog.
      await readSection(page, '#the-blog');
      await expectActive(page, 'Blog');
      await readSection(page, '#the-contacts');
      await expectActive(page, 'Contacts');
      await readSection(page, '#the-blog');
      await expectActive(page, 'Blog');
      const otherWidth = width === 390 ? 1280 : 390;
      await resizeAndSettle(page, otherWidth);
      await readSection(page, '#the-blog');
      await expectActive(page, 'Blog');
      await resizeAndSettle(page, width);
      await readSection(page, '#the-blog');
      await expectActive(page, 'Blog');
      await readSection(page, '#the-resume', .5);
      await expectActive(page, 'Resume');
      await readSection(page, '#the-leadership');
      await expectActive(page, 'About');
      if (width < 640) {
        await page.getByRole('button', { name: 'Open main menu' }).click();
        await expect(page.locator('#mobile-menu')).toHaveAttribute('aria-hidden', 'false');
      }
      await page.getByRole('button', { name: 'Back to introduction' }).click();
      await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(2);
      await expect(page.locator('#mobile-menu')).toHaveAttribute('aria-hidden', 'true');
      await expect(page.locator('.nav-link[aria-current]')).toHaveCount(0);
      expect(errors).toEqual([]);
    });
  }
}

for (const width of [390, 1280]) {
  test(`shared typography hierarchy at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('.journey-world')).toHaveClass(/is-ready/);
    await readSection(page, '#the-blog');
    await expect(page.locator('.blog-card')).toHaveCount(1);
    for (const selector of ['.hero-copy', '.section-lede', '.leadership-card .type-body', '.journey-summary', '.journey-story p', '.journey-outro p', '.list-card-content']) {
      await expect(page.locator(selector).first()).toHaveCSS('font-size', '16px');
    }
    for (const selector of ['.leadership-card h3', '.journey-card h3', '.journey-story h3', '.list-card-title']) {
      await expect(page.locator(selector).first()).toHaveCSS('font-size', '20px');
    }
    for (const selector of ['#the-leadership h2', '#the-resume h2', '#the-blog h2.section-heading', '#the-contacts h2']) {
      await expect(page.locator(selector)).toHaveCSS('font-size', width < 768 ? '24px' : '30px');
    }
    await expect(page.locator('.journey-meta').first()).toHaveCSS('font-size', '12px');
    await expect(page.locator('.journey-org').first()).toHaveCSS('font-size', '14px');
    await expect(page.locator('.journey-location').first()).toHaveCSS('font-size', '14px');
    await page.getByRole('button', { name: 'View Role 0 details' }).click();
    const dialog = page.getByRole('dialog');
    const titleId = await dialog.getAttribute('aria-labelledby');
    await expect(page.locator(`#${titleId}`)).toHaveCSS('font-size', '24px');
    await expect(dialog.locator('header time')).toHaveCSS('font-size', '12px');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
