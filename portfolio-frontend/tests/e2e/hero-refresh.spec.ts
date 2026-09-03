import { expect, test } from "@playwright/test";

for (const width of [390, 1280]) {
  test(`keeps the portrait stable across image refreshes at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await page.locator("#heroPicture").evaluate(async (element) => {
      await (element as HTMLImageElement).decode();
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(0, 350);
    });
    await page.waitForTimeout(500);

    const samples = await page.evaluate(async () => {
      const image = document.querySelector<HTMLElement>("#heroPicture")!;
      const sample = () => {
        const box = image.getBoundingClientRect();
        return { x: box.x, y: box.y, width: box.width };
      };
      const result = [sample()];
      for (let frame = 0; frame < 60; frame++) {
        // Reproduce late src/srcset loads while partway through the animation.
        if (frame % 10 === 0) image.dispatchEvent(new Event("load"));
        await new Promise(requestAnimationFrame);
        result.push(sample());
      }
      return result;
    });
    for (const sample of samples) {
      expect(Math.abs(sample.x - samples[0].x)).toBeLessThan(1);
      expect(Math.abs(sample.y - samples[0].y)).toBeLessThan(1);
      expect(Math.abs(sample.width - samples[0].width)).toBeLessThan(1);
    }
  });
}

test("image refresh preserves the timeline and uses a separate layout anchor", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(500);
  const result = await page.evaluate(async () => {
    // Inspect the same GSAP instance the application registers, without a test-only production API.
    const app = document.querySelector("#app") as Element & {
      __vue_app__: { config: { globalProperties: { $str: {
        getAll: () => Array<{ trigger: Element; animation: unknown }>;
      } } } };
    };
    const triggers = app.__vue_app__.config.globalProperties.$str;
    const original = triggers.getAll().find((item) => item.trigger.id === "the-hero");
    const image = document.querySelector<HTMLElement>("#heroPicture")!;
    const anchor = document.querySelector<HTMLElement>("#heroPictureAnchor");
    image.dispatchEvent(new Event("load"));
    await new Promise(requestAnimationFrame);
    const current = triggers.getAll().find((item) => item.trigger.id === "the-hero");
    return {
      hasAnchor: Boolean(anchor),
      sameTrigger: original === current,
      sameAnimation: original?.animation === current?.animation,
    };
  });
  expect(result).toEqual({ hasAnchor: true, sameTrigger: true, sameAnimation: true });
});

test.describe("mobile viewport changes", () => {
  test.use({ isMobile: true, hasTouch: true, viewport: { width: 390, height: 844 } });

  test("ignores toolbar-sized height changes but refreshes on orientation changes", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(700);
    await page.evaluate(() => {
      const app = document.querySelector("#app") as Element & {
        __vue_app__: { config: { globalProperties: { $str: {
          getAll: () => Array<{ trigger: Element; vars: { onRefresh?: () => void } }>;
        } } } };
      };
      const trigger = app.__vue_app__.config.globalProperties.$str.getAll()
        .find((item) => item.trigger.id === "the-hero")!;
      const refresh = trigger.vars.onRefresh;
      document.body.dataset.heroRefreshCount = "0";
      trigger.vars.onRefresh = function (...args) {
        document.body.dataset.heroRefreshCount = String(Number(document.body.dataset.heroRefreshCount) + 1);
        return refresh?.apply(this, args);
      };
    });

    // Above our former 120px threshold, below GSAP's 25% mobile threshold.
    await page.setViewportSize({ width: 390, height: 704 });
    await page.waitForTimeout(500);
    await expect(page.locator("body")).toHaveAttribute("data-hero-refresh-count", "0");

    await page.setViewportSize({ width: 844, height: 390 });
    await expect.poll(() => page.locator("body").getAttribute("data-hero-refresh-count"))
      .not.toBe("0");
  });

  test("follows the same path forwards and backwards through refreshes", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(700);
    const errors = await page.evaluate(async () => {
      document.documentElement.style.scrollBehavior = "auto";
      const image = document.querySelector<HTMLElement>("#heroPicture")!;
      const anchor = document.querySelector<HTMLElement>("#heroPictureAnchor")!;
      const hero = document.querySelector<HTMLElement>("#the-hero")!;
      const logo = document.querySelector<HTMLElement>("#heroLogo")!;
      const nav = logo.closest("nav")!;
      const errors: number[] = [];
      const frame = () => new Promise(requestAnimationFrame);
      for (const fraction of [0.1, 0.2, 0.4, 0.6, 0.4, 0.2, 0.1]) {
        window.scrollTo(0, hero.offsetHeight * fraction);
        await frame();
        await frame();
        image.dispatchEvent(new Event("load"));
        for (let tick = 0; tick < 8; tick++) {
          await frame();
          const start = anchor.getBoundingClientRect();
          const target = logo.getBoundingClientRect();
          const bounds = hero.getBoundingClientRect();
          const progress = Math.min(1, -bounds.top / bounds.height / 0.7);
          const expectedX = start.x + start.width / 2 +
            (target.x + target.width / 2 - start.x - start.width / 2) * progress;
          const endY = bounds.bottom + (parseFloat(getComputedStyle(nav).top) || 0) +
            target.y - nav.getBoundingClientRect().y + target.height / 2;
          const expectedY = start.y + start.height / 2 +
            (endY - start.y - start.height / 2) * progress;
          const actual = image.getBoundingClientRect();
          errors.push(Math.hypot(actual.x + actual.width / 2 - expectedX,
            actual.y + actual.height / 2 - expectedY));
        }
      }
      return errors;
    });
    expect(Math.max(...errors)).toBeLessThan(2);
  });
});
