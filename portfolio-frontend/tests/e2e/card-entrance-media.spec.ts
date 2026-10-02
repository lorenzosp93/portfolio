import { expect, test } from '@playwright/test';

declare global {
  interface Window {
    blogMotion: { samples: { opacity: number; y: number }[]; duration: number; delay: number }[];
  }
}

const image = '/og-image.jpg';
const posts = [1, 2, 3, 4, 5].map(id => ({
  uuid: `motion-post-${id}`, name: `Motion article ${id}`, slug: `motion-article-${id}`,
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
  await page.route('**/api/**', route => {
    const url = route.request().url();
    const results = url.includes('/blog/post/') ? posts : url.includes('/experience/') ? [experience] : [];
    return route.fulfill({ json: url.includes('/settings/') ? { show_skills: false, hero_picture: null }
      : url.includes('skillcategory') ? [] : { count: results.length, results, next: null } });
  });
});

for (const width of [390, 1280]) {
  test(`blog cards visibly settle once and media appears in detail cards at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.locator('#the-blog').scrollIntoViewIfNeeded();
    const cards = page.locator('.blog-card');
    await expect(cards).toHaveCount(5);
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
    if (width === 390) {
      const last = cards.last();
      await expect(last).toHaveClass(/blog-card--pending/);
      await page.locator('#blog-container').evaluate(el => el.scrollLeft = el.scrollWidth);
      await expect(last).not.toHaveClass(/blog-card--pending/);
      await page.locator('#blog-container').evaluate(el => el.scrollLeft = 0);
    }
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
  await expect(page.locator('.blog-card')).toHaveCount(5);
  await expect(page.locator('.blog-card--pending')).toHaveCount(0);
  expect(await page.locator('.blog-card').evaluateAll(cards => cards.every(card => getComputedStyle(card).opacity === '1' && card.getAnimations().length === 0))).toBe(true);
});
