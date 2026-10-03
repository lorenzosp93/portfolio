import { expect, test } from '@playwright/test';

for (const width of [390, 1280]) {
  test(`résumé selection and delayed Blog pagination preserve page position at ${width}px`, async ({ page }) => {
    const experiences = Array.from({ length: 8 }, (_, index) => ({
      uuid: `job-${index}`, name: `Product role ${index}`, start_date: '2021-01-01', current: true,
      location: 'Amsterdam', description: 'Leading products and teams. '.repeat(40),
      projects: [], keywords: [], attachments: [],
      entity: { uuid: 'tesla', name: 'Tesla', picture: '/favicon-32x32.png' },
    }));
    const posts = Array.from({ length: 9 }, (_, index) => ({
      uuid: `post-${index}`, name: `Article ${index}`, slug: `article-${index}`, created_at: '2026-01-01',
      content: 'Product decisions. '.repeat(80), picture: '/og-image.jpg', attachments: [], created_by: { username: 'lorenzo' },
    }));
    await page.route('**/api/**', async route => {
      const url = new URL(route.request().url());
      if (url.pathname.includes('/settings/')) return route.fulfill({ json: { show_skills: false, highlight_cards: [] } });
      let results: unknown[] = [], count = 0, next: string | null = null;
      if (url.pathname.includes('/experience/')) { results = experiences; count = experiences.length; }
      if (url.pathname.includes('/education/')) {
        await new Promise(resolve => setTimeout(resolve, 500));
        results = [{ ...experiences[0], uuid: 'degree', name: 'Engineering degree', description: 'Engineering education.' }]; count = 1;
      }
      if (url.pathname.includes('/blog/post/')) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const offset = Number(url.searchParams.get('offset') || 0), limit = Number(url.searchParams.get('limit') || 3);
        results = posts.slice(offset, offset + limit); count = posts.length;
        if (offset + limit < count) next = `${url.origin}${url.pathname}?limit=${limit}&offset=${offset + limit}`;
      }
      return route.fulfill({ json: url.pathname.includes('skillcategory') ? [] : { count, results, next } });
    });
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    await page.locator('#the-resume').scrollIntoViewIfNeeded();
    await expect(page.getByRole('button', { name: 'Open Product role 7', exact: true })).toBeAttached();
    await page.locator('#the-resume').evaluate(el => scrollTo({ top: scrollY + el.getBoundingClientRect().top - 80, behavior: 'instant' }));
    await page.waitForTimeout(700);
    const baseline = await page.evaluate(() => ({ y: scrollY, blogTop: document.getElementById('the-blog')!.getBoundingClientRect().top }));
    if (width < 640) await page.getByRole('tab', { name: 'education', exact: true }).click();
    else await page.locator('#the-resume').getByRole('button', { name: 'Scroll resume carousel right' }).click();
    await expect(page.getByRole('button', { name: 'Open Engineering degree', exact: true })).toBeAttached();
    await page.waitForTimeout(800);
    const after = await page.evaluate(() => ({ y: scrollY, blogTop: document.getElementById('the-blog')!.getBoundingClientRect().top }));
    expect(after.y).toBeCloseTo(baseline.y, 0);
    expect(after.blogTop).toBeCloseTo(baseline.blogTop, 0);
    if (width >= 640) {
      await page.locator('#the-navbar').getByRole('button', { name: 'Education', exact: true }).click();
      await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(after.y + 50);
    }
    await page.locator('#the-blog').scrollIntoViewIfNeeded();
    const cards = page.locator('.blog-card');
    await expect.poll(() => cards.count()).toBeGreaterThan(0);
    await page.waitForTimeout(1200);
    const row = page.locator('#blog-container');
    const blogBaseline = await page.evaluate(() => ({ y: scrollY, top: document.getElementById('the-blog')!.getBoundingClientRect().top }));
    while (await cards.count() < posts.length) {
      const count = await cards.count();
      await row.evaluate(el => el.scrollTo({ left: el.scrollWidth, behavior: 'instant' }));
      await expect.poll(() => cards.count()).toBeGreaterThan(count);
      await expect(page.getByRole('status', { name: 'Loading articles' })).toHaveCount(0);
      const position = await page.evaluate(() => ({ y: scrollY, top: document.getElementById('the-blog')!.getBoundingClientRect().top }));
      expect(position.y).toBeCloseTo(blogBaseline.y, 0);
      expect(position.top).toBeCloseTo(blogBaseline.top, 0);
    }
  });
}
