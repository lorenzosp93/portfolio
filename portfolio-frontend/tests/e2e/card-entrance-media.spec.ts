import { expect, test } from '@playwright/test';

declare global {
  interface Window {
    blogMotion: { samples: { opacity: number; y: number }[]; duration: number; delay: number }[];
  }
}

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
  await page.addInitScript(() => {
    window.blogMotion = [];
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (frames, options) {
      const animation = animate.call(this, frames, options);
      if (this.classList.contains('blog-card') && typeof options === 'object' && options.duration === 600) {
        const record = { samples: [] as { opacity: number; y: number }[], duration: 600, delay: options.delay || 0 };
        window.blogMotion.push(record);
        const sample = () => {
          const style = getComputedStyle(this);
          record.samples.push({ opacity: +style.opacity, y: new DOMMatrixReadOnly(style.transform).m42 });
          if (animation.playState === 'running' || animation.pending) requestAnimationFrame(sample);
        };
        sample();
      }
      return animation;
    };
  });
  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url());
    if (url.pathname.includes('/blog/post/')) {
      const offset = Number(url.searchParams.get('offset') || 0);
      const limit = Number(url.searchParams.get('limit') || 3);
      await new Promise(resolve => setTimeout(resolve, 350));
      const next = offset + limit < posts.length ? `${url.origin}${url.pathname}?limit=${limit}&offset=${offset + limit}` : null;
      return route.fulfill({ json: { count: posts.length, results: posts.slice(offset, offset + limit), next } });
    }
    const results = url.pathname.includes('/experience/') ? [experience] : [];
    return route.fulfill({ json: url.pathname.includes('/settings/') ? { show_skills: false, hero_picture: null }
      : url.pathname.includes('skillcategory') ? [] : { count: results.length, results, next: null } });
  });
});

for (const width of [390, 1280]) {
  test(`blog cards visibly settle once and media appears in detail cards at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.locator('#the-blog').scrollIntoViewIfNeeded();
    const cards = page.locator('.blog-card');
    await expect(cards).toHaveCount(width === 390 ? 3 : 6);
    const first = cards.first();
    // Sample throughout the entrance, including while async content loads.
    await page.evaluate(() => {
      const row = document.getElementById('blog-container')!;
      window.scrollTo({ top: row.getBoundingClientRect().top + window.scrollY - 150, behavior: 'instant' });
    });
    await expect(first).not.toHaveClass(/blog-card--pending/);
    await expect(first).toHaveCSS('opacity', '1');
    const motion = await page.evaluate(() => window.blogMotion[0]);
    expect(motion.duration).toBe(600);
    expect(motion.samples.some(sample => sample.opacity > 0 && sample.opacity < 1 && sample.y > 0)).toBe(true);
    await expect.poll(() => cards.evaluateAll(elements => elements.every(el => el.getAnimations().length === 0))).toBe(true);
    const motionCount = await page.evaluate(() => window.blogMotion.length);
    const before = await page.locator('#blog-container').evaluate(el => ({ y: scrollY, height: el.clientHeight }));
    // Loading two more pages must not replay the entrance, hide peeking cards,
    // change the gallery height, or move the surrounding page.
    while (await cards.count() < posts.length) {
      const previousCount = await cards.count();
      await page.locator('#blog-container').evaluate(el => el.scrollTo({ left: el.scrollWidth, behavior: 'instant' }));
      await expect(page.getByRole('status', { name: 'Loading articles' })).toHaveCount(1);
      const loadingPosition = await page.locator('#blog-container').evaluate(el => ({ y: scrollY, height: el.clientHeight, x: el.scrollLeft }));
      expect({ y: loadingPosition.y, height: loadingPosition.height }).toEqual(before);
      await expect.poll(() => cards.count()).toBeGreaterThan(previousCount);
      if (width === 390) {
        expect(await page.locator('#blog-container').evaluate(el => el.scrollLeft)).toBeCloseTo(loadingPosition.x, 0);
      }
      await expect(page.getByRole('status', { name: 'Loading articles' })).toHaveCount(0);
      expect(await page.locator('#blog-container').evaluate(el => ({ y: scrollY, height: el.clientHeight }))).toEqual(before);
      expect(await cards.evaluateAll(elements => elements.every(el => getComputedStyle(el).opacity === '1'))).toBe(true);
    }
    expect(await page.evaluate(() => window.blogMotion.length)).toBe(motionCount);
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
    expect(await first.evaluate(el => el.getAnimations().filter(a => a.effect?.getTiming().duration === 600).length)).toBe(0);
    await page.locator('#the-resume').scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'Open Product leader', exact: true }).click();
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

for (const showSkills of [false, true]) {
  test(`mobile résumé tabs are centered in equal columns with skills ${showSkills}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.route('**/api/settings/**', route => route.fulfill({ json: { show_skills: showSkills, hero_picture: null } }));
    await page.goto('/');
    await page.locator('#the-resume').scrollIntoViewIfNeeded();
    const tabs = page.getByRole('tablist', { name: 'Résumé sections' });
    await expect(tabs.getByRole('tab')).toHaveCount(showSkills ? 3 : 2);
    const columns = await tabs.evaluate(el => {
      const rect = el.getBoundingClientRect();
      const buttons = [...el.querySelectorAll('button')];
      return buttons.map((button, index) => {
        const b = button.getBoundingClientRect();
        return Math.abs(b.left + b.width / 2 - (rect.left + rect.width * (index + .5) / buttons.length));
      });
    });
    expect(columns.every(error => error < 1)).toBe(true);
    await tabs.getByRole('tab', { name: 'education' }).click();
    await expect(tabs.getByRole('tab', { name: 'education' })).toHaveAttribute('aria-selected', 'true');
    await expect.poll(() => tabs.evaluate(el => {
      const tab = el.querySelector('[aria-selected="true"]')!.getBoundingClientRect();
      const bar = el.querySelector('.mobile-tab-bar')!.getBoundingClientRect();
      return Math.abs(tab.left - bar.left) + Math.abs(tab.width - bar.width);
    })).toBeLessThan(2);
  });
}
