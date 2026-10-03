import { expect, test } from '@playwright/test';

test.use({ isMobile: true, hasTouch: true });

test('mobile toolbar resizing during Blog loading keeps the pin spacer and page scroll', async ({ page }) => {
  const cards = [1, 2, 3].map(id => ({ id, title: `Product leadership ${id}`, icon: 'layers', position: id,
    body: 'Developing independent leaders and building successful software products. '.repeat(2) }));
  const posts = [1, 2, 3, 4, 5, 6].map(id => ({ uuid: `post-${id}`, name: `Article ${id}`, slug: `article-${id}`,
    created_at: '2026-01-01', content: 'Product leadership. '.repeat(30), picture: '/og-image.jpg', attachments: [], created_by: { username: 'lorenzo' } }));
  let release: (() => void) | undefined;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url());
    if (url.pathname.includes('/settings/')) return route.fulfill({ json: { show_skills: false, highlight_cards: cards, highlights_heading: 'Building products and teams' } });
    if (url.pathname.includes('/blog/post/')) {
      await pending;
      const offset = Number(url.searchParams.get('offset') || 0);
      return route.fulfill({ json: { count: posts.length, results: posts.slice(offset, offset + 3), next: offset ? null : `${url.origin}${url.pathname}?offset=3&limit=3` } });
    }
    return route.fulfill({ json: url.pathname.includes('skillcategory') ? [] : { count: 0, results: [], next: null } });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.leadership-scene')).toHaveAttribute('data-scroll-start', /\d/);
  await page.locator('#the-blog').scrollIntoViewIfNeeded();
  await expect(page.getByRole('status', { name: 'Loading articles' })).toBeVisible();
  await page.waitForTimeout(600);
  const initial = await page.evaluate(() => ({ y: scrollY, spacer: document.querySelector('.pin-spacer')!.getBoundingClientRect().height }));
  await page.setViewportSize({ width: 390, height: 740 });
  await page.waitForTimeout(600);
  expect(await page.evaluate(() => scrollY)).toBeCloseTo(initial.y, 0);
  expect(await page.locator('.pin-spacer').evaluate(el => el.getBoundingClientRect().height)).toBeCloseTo(initial.spacer, 0);
  release!();
  await expect(page.locator('.blog-card')).toHaveCount(3);
  const afterLoading = await page.evaluate(() => scrollY);
  expect(afterLoading).toBeCloseTo(initial.y, 0);
  await page.locator('#blog-container').evaluate(el => el.scrollTo({ left: el.scrollWidth, behavior: 'instant' }));
  await expect(page.locator('.blog-card')).toHaveCount(6);
  expect(await page.evaluate(() => scrollY)).toBeCloseTo(afterLoading, 0);
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator('.leadership-cards')).not.toHaveClass(/is-animated/);
});
