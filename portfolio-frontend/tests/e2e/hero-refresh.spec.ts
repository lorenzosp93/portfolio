import { expect, test, type Page } from "@playwright/test";

// Keep geometry checks independent of network timing and live résumé content.
test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", (route) => route.fulfill({
    json: route.request().url().includes("/settings/") ? { hero_picture: null }
      : route.request().url().includes("skillcategory") ? []
      : { count: 0, results: [], next: null, previous: null },
  }));
});

// Finish the load choreography so geometry checks measure the resting layout.
async function settleEntrance(page: Page) {
  await page.evaluate(() => document.getAnimations().forEach(animation => {
    if (animation.effect?.getComputedTiming().iterations !== Infinity) animation.finish();
  }));
}

const tiltY = (page: Page) => page.locator(".hero-tilt").evaluate(el =>
  parseFloat(el.style.getPropertyValue("--hero-tilt-y")) || 0);

test("mouse tilt follows the pointer during the entrance and resets on leave", async ({ page }) => {
  await page.goto("/");
  const shape = page.locator(".hero-shape").first();
  await shape.evaluate(async (element) => {
    const animation = element.getAnimations()[0];
    animation.pause();
    await animation.ready;
    animation.currentTime = 150;
  });
  const stage = (await page.locator(".hero-stage").boundingBox())!;
  await page.mouse.move(stage.x + stage.width * .9, stage.y + stage.height * .5);
  await expect.poll(() => tiltY(page)).toBeGreaterThan(5);
  // The spring overshoots opacity to 1 within ~60 ms, so assert on scale:
  // the shape is still growing at 150 ms (≈0.76 of full size).
  const scale = () => shape.evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).a);
  expect(await scale()).toBeLessThan(0.95);

  await settleEntrance(page);
  await expect(shape).toHaveCSS("opacity", "1");
  expect(await scale()).toBeCloseTo(1, 3);
  expect(await tiltY(page)).toBeGreaterThan(5);

  await page.mouse.move(0, stage.y + stage.height + 200);
  await expect.poll(() => tiltY(page)).toBeCloseTo(0, 2);
});

for (const width of [390, 1280]) {
  test(`portrait stays in the hero through scrolling and image loads at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await settleEntrance(page);
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

test("touch press-and-drag tilts the stage, springs back, and keeps vertical scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await settleEntrance(page);
  const stage = page.locator(".hero-stage");
  await expect(stage).toHaveCSS("touch-action", "pan-y");
  await expect(page.locator("#the-hero")).toHaveCSS("touch-action", "auto");
  const box = (await stage.boundingBox())!;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  for (const end of ["pointerup", "pointercancel"]) {
    await stage.dispatchEvent("pointerdown", { pointerId: 7, clientX: x, clientY: y, pointerType: "touch" });
    await stage.dispatchEvent("pointermove", { pointerId: 7, clientX: x + box.width * .4, clientY: y, pointerType: "touch" });
    await expect.poll(() => tiltY(page)).toBeGreaterThan(5);
    await expect(page.locator(".hero-tilt")).toHaveClass(/is-touching/);
    await stage.dispatchEvent(end, { pointerId: 7, pointerType: "touch" });
    await expect.poll(() => tiltY(page)).toBeCloseTo(0, 2);
    await expect(page.locator(".hero-tilt")).toHaveClass(/is-releasing/);
  }
});

test("reduced motion keeps the portrait and navigation static and available", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".hero-portrait-mask")).toHaveCSS("animation-name", "none");
  await expect(page.locator(".hero-shape").first()).toHaveCSS("animation-name", "none");
  await expect(page.locator(".hero-letter").first()).toHaveCSS("animation-name", "none");
  const stage = (await page.locator(".hero-stage").boundingBox())!;
  await page.mouse.move(stage.x + stage.width * .9, stage.y + 10);
  await expect(page.locator(".hero-tilt")).toHaveCSS("transform", "none");
  await page.evaluate(() => window.scrollTo(0, document.querySelector<HTMLElement>("#the-hero")!.offsetHeight));
  await expect(page.locator(".hero-shape").first()).toHaveCSS("translate", "none");
  await expect(page.locator(".navbar-surface")).toHaveCSS("animation-name", "none");
  await expect(page.locator(".navbar-surface")).toHaveCSS("opacity", "1");
});

test("navbar waits for the portrait to exit, fades in, and never duplicates it on return", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await settleEntrance(page);
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

for (const mobile of [false, true]) {
  test.describe(mobile ? "mobile scroll depth" : "desktop scroll depth", () => {
    test.use({ isMobile: mobile, hasTouch: mobile, viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 720 } });
    test("scroll depth moves only the shapes and follows scroll position", async ({ page }) => {
      await page.goto("/");
      await settleEntrance(page);
      const result = await page.evaluate(async () => {
        document.documentElement.style.scrollBehavior = "auto";
        const hero = document.querySelector<HTMLElement>("#the-hero")!;
        const image = document.querySelector("#heroPicture")!;
        const amber = document.querySelector(".hero-shape--amber")!;
        const y = image.getBoundingClientRect().top + scrollY;
        const frames = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        window.scrollTo(0, hero.offsetHeight / 2);
        await frames();
        const mid = { scroll: Number(hero.style.getPropertyValue("--hero-scroll")), translate: getComputedStyle(amber).translate,
          drift: image.getBoundingClientRect().top + scrollY - y };
        window.scrollTo(0, 0);
        await frames();
        return { mid, rest: Number(hero.style.getPropertyValue("--hero-scroll")) };
      });
      expect(result.mid.scroll).toBeCloseTo(.5, 1);
      expect(result.mid.translate).not.toBe("none");
      expect(result.mid.translate).not.toBe("0px");
      expect(Math.abs(result.mid.drift)).toBeLessThan(1);
      expect(result.rest).toBe(0);
    });
  });
}
