import { timelineResponse } from './timeline.fixture';
import { expect, test, type Page } from '@playwright/test';

const pendingPages = new WeakMap<Page, () => void>();

const image = '/og-image.jpg';
const posts = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(id => ({
  uuid: `motion-post-${id}`, name: id > 3 ? `Motion article ${id}: a much longer title about regional product leadership and developing independent teams` : `Motion article ${id}`, slug: `motion-article-${id}`,
  created_at: '2026-10-02', content: 'An article about product leadership.\n\n'.repeat(20),
  picture: image, attachments: [], created_by: { username: 'lorenzo' },
}));
const experience = {
  uuid: 'experience-one', name: 'Product leader', start_date: '2023-03-01', current: true,
  location: 'Amsterdam', department: 'Software Product Management', description: 'Leading products and teams.',
  key_achievements: 'Developed independent product leaders.', projects: [], keywords: [], attachments: [],
  entity: { uuid: 'tesla', name: 'Tesla', picture: '/favicon-32x32.png' },
};

test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url());
    if (url.pathname.includes('/blog/post/')) {
      const offset = Number(url.searchParams.get('offset') || 0);
      const limit = Number(url.searchParams.get('limit') || 3);
      if (offset > 0) await new Promise<void>(resolve => pendingPages.set(page, resolve));
      const next = offset + limit < posts.length ? `${url.origin}${url.pathname}?limit=${limit}&offset=${offset + limit}` : null;
      return route.fulfill({ json: { count: posts.length, results: posts.slice(offset, offset + limit), next } });
    }
    if (url.pathname.includes('/resume/timeline/')) return route.fulfill({ json: timelineResponse([experience]) });
    const results = url.pathname.includes('/experience/') ? [experience] : [];
    return route.fulfill({ json: url.pathname.includes('/settings/') ? { show_skills: false, hero_picture: null }
      : url.pathname.includes('skillcategory') ? [] : { count: results.length, results, next: null } });
  });
});

for (const width of [390, 1280]) {
  test(`blog cards stay visible without an entrance and media appears in detail cards at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.locator('#the-blog').scrollIntoViewIfNeeded();
    const cards = page.locator('.blog-card');
    await expect(cards).toHaveCount(width === 390 ? 3 : 6);
    const first = cards.first();
    // Cards should be immediately readable as async content loads.
    await page.evaluate(() => {
      const row = document.getElementById('blog-container')!;
      window.scrollTo({ top: row.getBoundingClientRect().top + window.scrollY - 150, behavior: 'instant' });
    });
    await expect(first).not.toHaveClass(/blog-card--pending/);
    await expect(first).toHaveCSS('opacity', '1');
    expect(await cards.evaluateAll(elements => elements.every(el => el.getAnimations().length === 0))).toBe(true);
    const before = await page.locator('#blog-container').evaluate(el => ({ y: scrollY, height: el.clientHeight }));
    // Loading two more pages must not replay the entrance, hide peeking cards,
    // change the gallery height, or move the surrounding page.
    while (await cards.count() < posts.length) {
      const previousCount = await cards.count();
      await page.locator('#blog-container').evaluate(el => el.scrollTo({ left: el.scrollWidth, behavior: 'instant' }));
      await expect(page.getByRole('status', { name: 'Loading articles' })).toHaveCount(1);
      const loadingPosition = await page.locator('#blog-container').evaluate(el => ({ y: scrollY, height: el.clientHeight, x: el.scrollLeft }));
      expect({ y: loadingPosition.y, height: loadingPosition.height }).toEqual(before);
      pendingPages.get(page)!();
      pendingPages.delete(page);
      await expect.poll(() => cards.count()).toBeGreaterThan(previousCount);
      if (width === 390) {
        expect(await page.locator('#blog-container').evaluate(el => el.scrollLeft)).toBeCloseTo(loadingPosition.x, 0);
      }
      await expect(page.getByRole('status', { name: 'Loading articles' })).toHaveCount(0);
      expect(await page.locator('#blog-container').evaluate(el => ({ y: scrollY, height: el.clientHeight }))).toEqual(before);
      expect(await cards.evaluateAll(elements => elements.every(el => getComputedStyle(el).opacity === '1'))).toBe(true);
    }
    await page.locator('#blog-container').evaluate(el => el.scrollTo({ left: 0, behavior: 'instant' }));
    await expect(first).toBeInViewport();
    await first.getByRole('button', { name: 'Open Motion article 1' }).click();
    const article = page.getByRole('dialog', { name: 'Motion article 1', exact: true });
    const cover = article.locator('.blog-detail-cover');
    await expect(cover).toHaveAttribute('src', image);
    expect(await cover.evaluate(el => el.closest('.bottom-sheet__content') !== null)).toBe(true);
    await expect.poll(() => cover.evaluate(el => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await article.getByRole('button', { name: 'Close dialog' }).click();
    await expect(article).not.toBeVisible();
    expect(await first.evaluate(el => el.getAnimations().length)).toBe(0);
    await page.locator('#the-resume').scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'View Product leader details', exact: true }).click();
    const resume = page.getByRole('dialog', { name: 'Product leader', exact: true });
    await expect(resume.getByRole('img', { name: 'Tesla logo' })).toHaveAttribute('src', experience.entity.picture);
    await expect(resume).toContainText(experience.department);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('reduced motion leaves every blog card visible without entrance animations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('#the-blog').scrollIntoViewIfNeeded();
  await expect(page.locator('.blog-card')).toHaveCount(6);
  await expect(page.locator('.blog-card--pending')).toHaveCount(0);
  expect(await page.locator('.blog-card').evaluateAll(cards => cards.every(card => getComputedStyle(card).opacity === '1' && card.getAnimations().length === 0))).toBe(true);
});
