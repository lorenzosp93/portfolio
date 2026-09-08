import { expect, test } from "@playwright/test";

// Keep geometry checks independent of network timing and live résumé content.
test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", (route) => route.fulfill({
    json: route.request().url().includes("/settings/") ? { hero_picture: null }
      : route.request().url().includes("skillcategory") ? []
      : { count: 0, results: [], next: null, previous: null },
  }));
});

test("pointer offsets work during the entrance and survive its completion", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const hero = document.querySelector<HTMLElement>("#the-hero")!;
    const entrance = document.querySelector<HTMLElement>(".hero-shape-entrance")!;
    const layer = document.querySelector<HTMLElement>(".hero-pointer-layer")!;
    const animation = entrance.getAnimations()[0];
    animation.pause();
    animation.currentTime = 150;
    const bounds = hero.getBoundingClientRect();
    hero.dispatchEvent(new PointerEvent("pointermove", {
      clientX: bounds.left + bounds.width * .8,
      clientY: bounds.top + bounds.height * .3,
      pointerType: "mouse",
    }));
    await new Promise(resolve => setTimeout(resolve, 180));
    const early = getComputedStyle(layer).transform;
    const enteringOpacity = Number(getComputedStyle(entrance).opacity);
    animation.finish();
    await new Promise(requestAnimationFrame);
    const late = getComputedStyle(layer).transform;
    hero.dispatchEvent(new PointerEvent("pointerleave"));
    await new Promise(resolve => setTimeout(resolve, 180));
    return { early, late, enteringOpacity, reset: getComputedStyle(layer).transform };
  });
  expect(result.enteringOpacity).toBeLessThan(1);
  expect(result.early).not.toBe("matrix(1, 0, 0, 1, 0, 0)");
  expect(result.late).toBe(result.early);
  expect(result.reset).toBe("matrix(1, 0, 0, 1, 0, 0)");
});

for (const width of [390, 1280]) {
  test(`portrait stays in the hero through scrolling and image loads at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await page.waitForTimeout(750);
    const measurements = await page.evaluate(async () => {
      document.documentElement.style.scrollBehavior = "auto";
      const image = document.querySelector<HTMLElement>("#heroPicture")!;
      const measure = () => {
        const box = image.getBoundingClientRect();
        return { x: box.x, y: box.y + scrollY, width: box.width };
      };
      const samples = [measure()];
      for (const y of [200, 500, 200, 0]) {
        window.scrollTo(0, y);
        image.dispatchEvent(new Event("load"));
        await new Promise(resolve => setTimeout(resolve, 50));
        samples.push(measure());
      }
      return samples;
    });
    for (const sample of measurements) {
      expect(Math.abs(sample.x - measurements[0].x)).toBeLessThan(1);
      expect(Math.abs(sample.y - measurements[0].y)).toBeLessThan(1);
      expect(sample.width).toBe(measurements[0].width);
    }
  });
}

test("navbar stays visible and sticky through toolbar and orientation changes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, document.querySelector<HTMLElement>("#the-hero")!.offsetHeight + 80);
  });
  const surface = page.locator(".navbar-surface");
  await expect(surface).toHaveClass(/navbar-revealed/);
  await expect(surface).toHaveCSS("opacity", "1");
  for (const viewport of [{ width: 390, height: 704 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(viewport);
    await expect(surface).toHaveCSS("opacity", "1");
    await expect.poll(async () => (await page.locator("#the-navbar").boundingBox())!.y).toBe(0);
  }
  await expect(page.getByRole("button", { name: "Blog", exact: true })).toBeVisible();
});

test("touch follows immediately and resets on cancellation without blocking scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const hero = page.locator("#the-hero");
  await hero.dispatchEvent("pointerdown", { clientX: 300, clientY: 200, pointerType: "touch" });
  await expect.poll(() => hero.evaluate(el => el.style.getPropertyValue("--hero-pointer-x"))).not.toBe("0");
  await hero.dispatchEvent("pointercancel", { pointerType: "touch" });
  await expect.poll(() => hero.evaluate(el => el.style.getPropertyValue("--hero-pointer-x"))).toBe("0");
  await expect(hero).toHaveCSS("touch-action", "auto");
});

test("reduced motion keeps the portrait and navigation static and available", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".hero-portrait-entrance")).toHaveCSS("animation-name", "none");
  await expect(page.locator(".hero-shape-entrance").first()).toHaveCSS("animation-name", "none");
  await page.locator("#the-hero").dispatchEvent("pointermove", { clientX: 300, clientY: 100 });
  await expect(page.locator(".hero-pointer-layer").first()).toHaveCSS("transform", "none");
  await page.evaluate(() => window.scrollTo(0, document.querySelector<HTMLElement>("#the-hero")!.offsetHeight));
  await expect(page.locator(".navbar-surface")).toHaveCSS("animation-name", "none");
  await expect(page.locator(".navbar-surface")).toHaveCSS("opacity", "1");
});

test("navbar waits for the portrait to exit, fades in, and never duplicates it on return", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page.waitForTimeout(750);
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 100);
  });
  await expect(page.locator("#heroPicture")).toBeInViewport();
  await expect(page.locator("#the-navbar")).toBeInViewport();
  await expect(page.locator(".navbar-surface")).toHaveCSS("opacity", "0");
  await expect(page.locator("#heroLogo")).toHaveCSS("visibility", "hidden");
  const endpoints = await page.evaluate(() => ({
    start: scrollY + document.querySelector("#heroPicture")!.getBoundingClientRect().bottom,
    end: scrollY + document.querySelector("#the-hero")!.getBoundingClientRect().bottom,
  }));
  for (const progress of [0, .25, .5, .75, 1, .75, .5, .25, 0]) {
    await page.evaluate(({ start, end, progress }) => {
      window.scrollTo(0, start + (end - start) * progress);
    }, { ...endpoints, progress });
    await expect.poll(async () => Number(await page.locator(".navbar-surface").evaluate(
      el => getComputedStyle(el).opacity))).toBeCloseTo(progress, 2);
  }
  await page.evaluate(() => window.scrollTo(0, 100));
  await expect(page.locator("#heroLogo")).toHaveCSS("visibility", "hidden");
  await expect(page.locator(".navbar-surface")).toHaveCSS("opacity", "0");
});

test("scroll inertia moves only the shapes and settles at rest", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(750);
  const result = await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = "auto";
    const hero = document.querySelector<HTMLElement>("#the-hero")!;
    const image = document.querySelector("#heroPicture")!;
    const y = image.getBoundingClientRect().top + scrollY;
    const offsets: number[] = [];
    window.scrollTo(0, 100);
    for (let i = 0; i < 24; i++) {
      await new Promise(requestAnimationFrame);
      offsets.push(parseFloat(hero.style.getPropertyValue("--hero-scroll-offset")) || 0);
    }
    return { offsets, drift: image.getBoundingClientRect().top + scrollY - y };
  });
  expect(Math.max(...result.offsets)).toBeGreaterThan(1);
  expect(Math.max(...result.offsets)).toBeLessThanOrEqual(14);
  expect(Math.abs(result.drift)).toBeLessThan(1);
  await expect.poll(() => page.locator("#the-hero").evaluate(el =>
    el.style.getPropertyValue("--hero-scroll-offset"))).toBe("0px");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(() => window.scrollTo(0, 200));
  await expect(page.locator(".hero-pointer-layer").first()).toHaveCSS("transform", "none");
});
