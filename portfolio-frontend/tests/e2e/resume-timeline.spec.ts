import { expect, test } from "@playwright/test";
import { timelineResponse } from "./timeline.fixture";
const entries = Array.from({ length: 6 }, (_, i) => ({
  uuid: `entry-${i}`,
  kind: i % 3 === 0 ? "education" : "experience",
  name: `Journey entry ${i + 1}`,
  start_date: `${2012 + i * 2}-01-01`,
  end_date: i === 5 ? null : `${2013 + i * 2}-12-01`,
  current: i === 5,
  entity: { uuid: "org", name: "Organization", picture: "/favicon-32x32.png" },
  location: "Amsterdam",
  description: "Full details with [a reference](https://example.com).",
  timeline_summary:
    "- Building products and developing teams.\n- Learning through technical challenges and new responsibilities.",
  key_achievements: "A meaningful achievement.",
  keywords: [{ name: "Product" }],
  projects: [],
  attachments: [],
  narrative_heading: i === 0 ? "Engineering foundations" : "",
  narrative_body: i === 0 ? "Learning how complex systems behave." : "",
  transition_motif: i === 2 ? "breakthrough" : i === 3 ? "detour" : "none",
}));
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(crypto, "randomUUID", { value: undefined }));
  await page.route("**/api/**", (route) => {
    const url = route.request().url();
    return route.fulfill({
      json: url.includes("/timeline/")
        ? timelineResponse(entries)
        : url.includes("/settings/")
          ? { show_skills: false, highlight_cards: [] }
          : url.includes("skillcategory")
            ? []
            : { count: 0, results: [], next: null },
    });
  });
});
for (const width of [320, 390, 768, 1023, 1024, 1440]) {
  test(`path clears cards, stays smooth, and alternates at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator(".journey-world")).toHaveClass(/is-ready/);
    const geometry = await page.locator(".journey-world").evaluate((el) => {
      const path = el.querySelector<SVGPathElement>(".journey-inkline")!;
      const origin = el.getBoundingClientRect();
      const cards = [...el.querySelectorAll(".journey-card")].map((card) => {
        const b = card.getBoundingClientRect();
        return {
          left: b.left - origin.left,
          right: b.right - origin.left,
          top: b.top - origin.top,
          bottom: b.bottom - origin.top,
        };
      });
      let collisions = 0,
        escapes = 0;
      for (let d = 0; d < path.getTotalLength(); d += 4) {
        const p = path.getPointAtLength(d);
        if (p.x < 5 || p.x > origin.width - 5) escapes++;
        if (
          cards.some(
            (b) =>
              p.x > b.left - 2 &&
              p.x < b.right + 2 &&
              p.y > b.top - 2 &&
              p.y < b.bottom + 2,
          )
        )
          collisions++;
      }
      const numbers = path
        .getAttribute("d")!
        .match(/-?\d+(?:\.\d+)?/g)!
        .map(Number);
      let previousEnd = { x: numbers[0], y: numbers[1] },
        previousTangent: { x: number; y: number } | undefined,
        minCosine = 1;
      for (let n = 2; n < numbers.length; n += 6) {
        const [x1, y1, x2, y2, x, y] = numbers.slice(n, n + 6),
          tangent = { x: x1 - previousEnd.x, y: y1 - previousEnd.y };
        if (previousTangent)
          minCosine = Math.min(
            minCosine,
            (tangent.x * previousTangent.x + tangent.y * previousTangent.y) /
              Math.hypot(tangent.x, tangent.y) /
              Math.hypot(previousTangent.x, previousTangent.y),
          );
        previousTangent = { x: x - x2, y: y - y2 };
        previousEnd = { x, y };
      }
      return {
        collisions,
        escapes,
        minCosine,
        compact: el.classList.contains("is-narrow"),
        cards,
        overflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
    expect(geometry.collisions).toBe(0);
    expect(geometry.escapes).toBe(0);
    expect(geometry.minCosine).toBeGreaterThan(0.9999);
    expect(geometry.overflow).toBe(false);
    const tail = await page.locator(".journey-tail").evaluate(el => {
      const p = el as SVGPathElement;
      return [p.getPointAtLength(0).x, p.getPointAtLength(p.getTotalLength()).x];
    });
    expect(tail[0]).toBe(tail[1]);
    expect(geometry.compact).toBe(width < 1024);
    if (width < 1024)
      expect(geometry.cards[0].left).toBeGreaterThan(geometry.cards[1].left);
    else expect(geometry.cards[0].left).toBeLessThan(geometry.cards[1].left);
    await page.setViewportSize({
      width: width < 1024 ? 1280 : 390,
      height: 900,
    });
    await expect(page.locator(".journey-world")).toHaveClass(
      width < 1024 ? /^(?!.*is-narrow)/ : /is-narrow/,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}
for (const width of [390, 1280]) {
  test(`marker leads the side entrance, hidden future and Detail Card work at ${width}px`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.locator(".journey-world")).toHaveClass(/is-ready/);
    await expect(page.locator(".journey-tail")).toHaveCSS("opacity", "0");
    await expect(page.locator(".journey-card").last()).toHaveCSS(
      "opacity",
      "0",
    );
    await page
      .locator(".journey-row")
      .nth(1)
      .evaluate((el) => {
        const card = el.querySelector(".journey-card")!;
        scrollTo({
          top:
            scrollY +
            card.getBoundingClientRect().top +
            53 -
            innerHeight * 0.52 -
            12,
          behavior: "instant",
        });
      });
    await expect(page.locator(".journey-row").nth(1)).not.toHaveClass(
      /is-reached/,
    );
    // The setup scroll can briefly reveal then hide the row; let that exit
    // finish before measuring a fresh entrance from its full side offset.
    await expect.poll(() => page.locator(".journey-row").nth(1)
      .locator(".journey-card").evaluate((el) => {
        const style = getComputedStyle(el);
        return Math.abs(new DOMMatrixReadOnly(style.transform).m41
          - parseFloat(style.getPropertyValue("--journey-enter")));
      })).toBeLessThan(0.1);
    const samples = await page
      .locator(".journey-row")
      .nth(1)
      .evaluate(async (el) => {
        const node = document.querySelectorAll(".journey-station")[1],
          card = el.querySelector(".journey-card")!;
        const values: {
          node: number;
          opacity: number;
          x: number;
          t: number;
        }[] = [];
        // Sample the real CSS transitions at fixed times: busy renderers can
        // skip the entire marker-only interval between wall-clock frames.
        const animations = await new Promise<Animation[]>((resolve, reject) => {
          const timeout = setTimeout(() => {
            observer.disconnect();
            reject(new Error("The path did not reach the second timeline entry"));
          }, 5000);
          const observer = new MutationObserver(() => {
            if (!el.classList.contains("is-reached")) return;
            const transitions = [...node.getAnimations(), ...card.getAnimations()];
            transitions.forEach((animation) => animation.pause());
            clearTimeout(timeout);
            observer.disconnect();
            resolve(transitions);
          });
          observer.observe(el, { attributes: true, attributeFilter: ["class"] });
          scrollBy({ top: 24, behavior: "instant" });
        });
        await Promise.all(animations.map((animation) => animation.ready));
        for (const t of [0, 90, 150, 250, 450, 750]) {
          animations.forEach((animation) => { animation.currentTime = t; });
          await new Promise(requestAnimationFrame);
          values.push({
            t,
            node: +getComputedStyle(node).opacity,
            opacity: +getComputedStyle(card).opacity,
            x: Math.abs(
              new DOMMatrixReadOnly(getComputedStyle(card).transform).m41,
            ),
          });
        }
        animations.forEach((animation) => animation.finish());
        return values;
      });
    // Verify the transition schedule as well as the rendered side motion.
    await expect(
      page.locator(".journey-row").nth(1).locator(".journey-card"),
    ).toHaveCSS("transition-delay", "0.1s");
    await expect(page.locator(".journey-station").nth(1)).toHaveCSS(
      "transition-delay",
      /^0s(?:, 0s)*$/,
    );
    expect(
      samples.some((s) => s.node > 0.5 && s.opacity === 0 && s.x > 20),
      JSON.stringify(samples),
    ).toBe(true);
    // Check visible sideways travel across the entrance, not a narrow overlap
    // after the fade completes that busy renderers can skip between frames.
    expect(samples.some((s) => s.opacity > 0.1 && s.x > 2 && s.x < 60), JSON.stringify(samples.filter((_, i) => i % 4 === 0))).toBe(true);
    const tipError = await page.locator(".journey-inkline").evaluate((el) => {
      const path = el as SVGPathElement,
        tip = document.querySelector(".journey-tip")!;
      const position = path.getPointAtLength(
        path.getTotalLength() -
          parseFloat(getComputedStyle(path).strokeDashoffset),
      );
      return Math.hypot(
        position.x - Number(tip.getAttribute("cx")),
        position.y - Number(tip.getAttribute("cy")),
      );
    });
    expect(tipError).toBeLessThan(1);
    const button = page.getByRole("button", {
      name: "View Journey entry 2 details",
    });
    await button.click();
    const dialog = page.getByRole("dialog", {
      name: "Journey entry 2",
      exact: true,
    });
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("img", { name: "Organization logo" }),
    ).toBeVisible();
    await expect(dialog).toContainText("A meaningful achievement.");
    await page.keyboard.press("Escape");
    await expect(button).toBeFocused();
    await page.mouse.wheel(0, -900);
    await expect(page.locator('.journey-row').nth(1)).not.toHaveClass(/is-reached/);
    await expect(page.locator('.journey-row').nth(1).locator('.journey-card')).toHaveCSS('opacity', '0');
    await page.getByRole("button", { name: "Jump to today" }).click();
    await page.waitForTimeout(700);
    await expect(page.locator(".journey-tail")).toHaveCSS("opacity", "0");
    await expect(page.locator(".journey-tail")).toHaveCSS("opacity", "0.5", { timeout: 15000 });
    await expect(page.locator(".journey-card").last()).toHaveCSS(
      "opacity",
      "1",
    );
    await expect(page.locator('[data-effect="breakthrough"]')).toHaveClass(
      /is-broken/,
    );
    await expect(page.locator('[data-effect="detour"]')).toHaveClass(/is-near/);
    expect(errors).toEqual([]);
  });
}
test("reduced motion and keyboard focus keep every entry readable", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".journey-world")).toHaveClass(/is-ready/);
  const last = page.getByRole("button", {
    name: "View Journey entry 6 details",
  });
  await last.focus();
  await expect(page.locator(".journey-card").last()).toHaveCSS("opacity", "1");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".journey-inkline")).toHaveCSS(
    "stroke-dashoffset",
    "0px",
  );
  expect(
    await page
      .locator(".journey-card")
      .evaluateAll((cards) =>
        cards.every(
          (card) =>
            getComputedStyle(card).opacity === "1" &&
            getComputedStyle(card).transform === "none",
        ),
      ),
  ).toBe(true);
});
test("failed feed can retry and empty feed stays usable", async ({ page }) => {
  let calls = 0;
  await page.route("**/api/resume/timeline/", (route) =>
    ++calls === 1
      ? route.fulfill({ status: 503, json: {} })
      : route.fulfill({ json: timelineResponse([]) }),
  );
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText("couldn’t be loaded");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(
    page.getByText("The journey is being written. Check back soon."),
  ).toBeVisible();
  await expect(page.locator(".journey-route")).toHaveCount(0);
});

test("jump yields to user input and years drift more slowly than the cards", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".journey-world")).toHaveClass(/is-ready/);
  await page.getByRole("button", { name: "Jump to today" }).click();
  await page.waitForTimeout(900);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(80);
  const stopped = await page.evaluate(() => scrollY);
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => scrollY)).toBe(stopped);
  await expect(page.locator(".journey-tail")).toHaveCSS("opacity", "0");
  const year = page.locator(".journey-year").first();
  await page.locator(".journey-card").first().scrollIntoViewIfNeeded();
  await expect(year).toHaveClass(/is-reached/);
  const before = await year.boundingBox();
  await page.mouse.wheel(0, 100);
  await page.waitForTimeout(300);
  const after = await year.boundingBox();
  expect(before!.y - after!.y).toBeGreaterThan(50);
  expect(before!.y - after!.y).toBeLessThan(95);
});

test.describe('touch interaction', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  test('ellipsis opens and closes the Detail Card on a touch device', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const opener = page.getByRole('button', { name: 'View Journey entry 1 details' });
    await opener.tap();
    const dialog = page.getByRole('dialog', { name: 'Journey entry 1', exact: true });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Close dialog' }).tap();
    await expect(dialog).not.toBeVisible();
    await expect(opener).toHaveAttribute('aria-expanded', 'false');
    await opener.tap();
    await expect(dialog).toBeVisible();
  });
});

for (const width of [390, 1280]) {
  test(`unique years, Today, floating CV and round logos at ${width}px`, async ({ page }) => {
    const currentYear = new Date().getFullYear().toString();
    const dates = ['2012', '2012', '2015', '2015', '2022', '2022'];
    await page.route('**/api/resume/timeline/', route => route.fulfill({
      json: timelineResponse(entries.map((entry, i) => ({ ...entry, start_date: `${dates[i]}-01-01` }))),
    }));
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    await expect(page.locator('.journey-world')).toHaveClass(/is-ready/);
    const years = page.locator('.journey-year');
    expect((await years.allTextContents()).map(text => text.trim())).toEqual(['2012', '2015', '2022', currentYear]);
    await expect(page.locator('.journey-current-year')).toHaveCSS('opacity', '0');
    await page.locator('.journey-header').scrollIntoViewIfNeeded();
    await expect(page.getByRole('link', { name: 'My CV', exact: true })).toHaveCount(1);
    await expect(page.locator('.journey-header a')).toHaveCount(0);
    await expect(page.getByTestId('cv-fab')).toBeVisible();
    await expect(page.getByTestId('cv-fab')).toHaveAttribute('href', /\/api\/resume\/cv\/$/);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.getByRole('button', { name: 'Jump to today' }).click();
    await expect(page.locator('.journey-today')).toHaveClass(/is-reached/);
    await expect(page.locator('.journey-current-year')).toHaveClass(/is-reached/);
    const year = await page.locator('.journey-current-year').boundingBox();
    const today = await page.locator('.journey-today').boundingBox();
    const closing = await page.locator('.journey-outro h3').boundingBox();
    expect(Math.abs(year!.y - today!.y)).toBeLessThan(70);
    expect(year!.y + year!.height).toBeLessThan(closing!.y);
    const logo = page.locator('.journey-logo').last();
    await expect(logo).toHaveCSS('border-radius', '9999px');
    const size = await logo.boundingBox();
    expect(size!.width).toBe(size!.height);
    await page.getByRole('button', { name: 'View Journey entry 6 details' }).click();
    const detailLogo = page.getByRole('dialog').getByRole('img', { name: 'Organization logo' });
    await expect(detailLogo).toHaveCSS('border-radius', '9999px');
  });
}

test('keeps the current year at its first timeline entry without repeating it at Today', async ({ page }) => {
  const currentYear = new Date().getFullYear().toString();
  const dates = ['2012', '2012', '2015', '2015', currentYear, currentYear];
  await page.route('**/api/resume/timeline/', route => route.fulfill({
    json: timelineResponse(entries.map((entry, i) => ({ ...entry, start_date: `${dates[i]}-01-01` }))),
  }));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.journey-world')).toHaveClass(/is-ready/);
  expect((await page.locator('.journey-year').allTextContents()).map(text => text.trim())).toEqual(['2012', '2015', currentYear]);
  await expect(page.locator('.journey-current-year')).toHaveCount(0);
  const year = await page.locator('.journey-year').last().boundingBox();
  const firstCurrentCard = await page.locator('.journey-card').nth(4).boundingBox();
  const secondCurrentCard = await page.locator('.journey-card').nth(5).boundingBox();
  expect(Math.abs(year!.y - firstCurrentCard!.y)).toBeLessThan(250);
  expect(year!.y).toBeLessThan(secondCurrentCard!.y - 250);
});

test('soft backgrounds avoid filtered or document-height compositing layers', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.locator('.journey-header').scrollIntoViewIfNeeded();
  await expect(page.locator('.journey-background')).toHaveCSS('transform', 'none');
  await expect(page.locator('.journey-background')).toHaveCSS('will-change', 'auto');
  const hazes = await page.locator('.journey-haze').evaluateAll(elements => elements.map(el => ({
    filter: getComputedStyle(el).filter, image: getComputedStyle(el).backgroundImage,
    height: el.getBoundingClientRect().height,
  })));
  expect(hazes.length).toBeGreaterThan(0);
  for (const haze of hazes) {
    expect(haze.filter).toBe('none');
    expect(haze.image).toContain('radial-gradient');
    expect(haze.height).toBeLessThan(600);
  }
  await page.mouse.wheel(0, 600);
  await expect(page.locator('.journey-haze').first()).not.toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  await page.locator('.journey-outro').evaluate(el => scrollTo({ top: scrollY + el.getBoundingClientRect().top, behavior: 'instant' }));
  await expect.poll(() => page.locator('.journey-world').evaluate(world => {
    const bounds = world.getBoundingClientRect();
    return [...world.querySelectorAll('.journey-haze')].every(haze => {
      const box = haze.getBoundingClientRect();
      return box.top >= bounds.top - 1 && box.bottom <= bounds.bottom + 1;
    });
  })).toBe(true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.journey-haze').first()).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
});
