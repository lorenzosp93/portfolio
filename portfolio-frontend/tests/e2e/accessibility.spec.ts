import { expect, test } from '@playwright/test';
import axe from 'axe-core';

for (const width of [390, 1280]) {
  test(`résumé and Blog pass accessibility checks in both themes at ${width}px`, async ({ page }) => {
    await page.route('**/api/**', route => {
      const url = new URL(route.request().url());
      const entry = { uuid: 'entry-one', name: 'Product leader', start_date: '2021-01-01', current: true, location: 'Amsterdam',
        description: '- Building products\n- Developing teams', projects: [], keywords: [], attachments: [],
        entity: { uuid: 'tesla', name: 'Tesla', picture: '/favicon-32x32.png' } };
      const post = { uuid: 'post-one', name: 'Product leadership', slug: 'product-leadership', created_at: '2026-01-01',
        location: 'EMEA', content: 'Leading products and teams.', picture: '/og-image.jpg', attachments: [], created_by: { username: 'lorenzo' } };
      const results = url.pathname.includes('/experience/') || url.pathname.includes('/education/') ? [entry] : url.pathname.includes('/blog/post/') ? [post] : [];
      return route.fulfill({ json: url.pathname.includes('/settings/') ? { show_skills: false, highlight_cards: [] }
        : url.pathname.includes('skillcategory') ? [] : { count: results.length, results, next: null } });
    });
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.waitForTimeout(2000);
    await page.addScriptTag({ content: axe.source });
    for (const dark of [false, true]) {
      await page.evaluate(dark => document.documentElement.classList.toggle('dark', dark), dark);
      for (const section of ['#the-resume', '#the-blog']) {
        await page.locator(section).scrollIntoViewIfNeeded();
        await page.waitForTimeout(700);
        const violations = await page.evaluate(async () => {
          const engine = (window as unknown as { axe: typeof axe }).axe;
          const results = await engine.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } });
          return results.violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) }));
        });
        expect(violations, `${section}, dark=${dark}`).toEqual([]);
      }
    }
    if (width < 640) {
      const tab = page.getByRole('tab', { name: 'experience' });
      await tab.focus();
      await tab.press('ArrowRight');
      await expect(page.getByRole('tab', { name: 'education' })).toHaveAttribute('aria-selected', 'true');
    }
  });
}
