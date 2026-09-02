import { expect, test } from "@playwright/test";

test("renders the main portfolio sections", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Hi, I'm Lorenzo/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Here are a few things I've done." })).toBeAttached();
  await expect(page.getByRole("heading", { name: "Thoughts from the blog." })).toBeAttached();
  await expect(page.getByRole("heading", { name: "Get in touch!" })).toBeAttached();
});

test("stacks the contact call to action on laptop screens", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const heading = page.getByRole("heading", { name: "Get in touch!" });
  const paragraph = page.getByText(
    "Have an interesting product, technical challenge, or idea in mind? I'd be glad to hear about it."
  );
  const button = page.getByRole("button", {
    name: "Click here to send me a message.",
  });
  await button.scrollIntoViewIfNeeded();

  const headingBox = await heading.boundingBox();
  const paragraphBox = await paragraph.boundingBox();
  const buttonBox = await button.boundingBox();

  expect(headingBox).not.toBeNull();
  expect(paragraphBox).not.toBeNull();
  expect(buttonBox).not.toBeNull();
  expect(paragraphBox!.y).toBeGreaterThan(headingBox!.y + headingBox!.height);
  expect(buttonBox!.y).toBeGreaterThan(paragraphBox!.y + paragraphBox!.height);
});

test("keeps mobile and desktop resume controls mutually exclusive", async ({ page }) => {
  await page.setViewportSize({ width: 639, height: 800 });
  await page.goto("/");
  await page.locator("#the-resume").scrollIntoViewIfNeeded();

  await expect(page.getByTestId("resume-mobile-tabs")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Scroll resume carousel right" })
  ).toHaveCount(0);

  await page.setViewportSize({ width: 640, height: 800 });

  await expect(page.getByTestId("resume-mobile-tabs")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Scroll resume carousel right" })
  ).toBeVisible();
});

test("returns to the hero from the mobile About menu", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/");
  await page.locator("#the-resume").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => window.scrollY > 100);

  await page.getByRole("button", { name: "Open main menu" }).click();
  await page.getByRole("button", { name: "About", exact: true }).click();

  await page.waitForFunction(() => window.scrollY < 2);
});

test("recalculates the hero animation from its natural position after resize", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(250);

  const centerBeforeResize = await heroCenter(page);

  await page.setViewportSize({ width: 1000, height: 800 });
  await page.waitForTimeout(400);

  const centerAfterResize = await heroCenter(page);
  expect(Math.abs(centerAfterResize.y - centerBeforeResize.y)).toBeLessThan(30);

  const heroEnd = await page.locator("#the-hero").evaluate((element) => {
    const box = element.getBoundingClientRect();
    return box.top + window.scrollY + box.height;
  });
  await page.evaluate((scrollY) => {
    const root = document.documentElement;
    const pageContainer = document.querySelector<HTMLElement>(".page-scroll-container");
    root.style.scrollBehavior = "auto";
    root.style.scrollSnapType = "none";
    if (pageContainer) pageContainer.style.scrollSnapType = "none";
    window.scrollTo(0, scrollY);
  }, heroEnd);
  await page.waitForTimeout(250);

  const endpoint = await page.evaluate(() => {
    const hero = document.querySelector<HTMLElement>("#heroPicture")!.getBoundingClientRect();
    const logo = document.querySelector<HTMLElement>("#heroLogo")!.getBoundingClientRect();
    return {
      heroX: hero.left + hero.width / 2,
      logoX: logo.left + logo.width / 2,
      navbarOpacity: Number.parseFloat(
        getComputedStyle(document.querySelector<HTMLElement>("#the-navbar")!).opacity
      ),
    };
  });

  expect(Math.abs(endpoint.heroX - endpoint.logoX)).toBeLessThan(2);
  expect(endpoint.navbarOpacity).toBeGreaterThan(0.95);
});

test("expands and restores the detail card while keeping its bottom anchored", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1000, height: 800 });
  await page.goto("/");
  const openButton = page.getByRole("button", {
    name: "Click here to send me a message.",
  });
  await openButton.scrollIntoViewIfNeeded();
  await openButton.click();

  const card = page.locator(".bottom-sheet.opened #detail-card");
  const pan = card.locator(".bottom-sheet__pan");
  await expect(card).toBeVisible();
  await page.waitForTimeout(450);

  const initialBox = await card.boundingBox();
  const panBox = await pan.boundingBox();
  expect(initialBox).not.toBeNull();
  expect(panBox).not.toBeNull();

  const x = panBox!.x + panBox!.width / 2;
  const y = panBox!.y + Math.min(panBox!.height / 2, 36);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y - 90, { steps: 8 });

  const expandedBox = await card.boundingBox();
  expect(expandedBox!.height).toBeGreaterThan(initialBox!.height);
  expect(Math.abs(expandedBox!.y + expandedBox!.height - 800)).toBeLessThan(2);

  await page.mouse.up();
  await page.waitForTimeout(500);
  const restoredBox = await card.boundingBox();
  expect(Math.abs(restoredBox!.height - initialBox!.height)).toBeLessThan(2);

  await page.keyboard.press("Escape");
  await expect(card).toBeHidden();
});

async function heroCenter(page: import("@playwright/test").Page) {
  return page.locator("#heroPicture").evaluate((element) => {
    const box = element.getBoundingClientRect();
    return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
  });
}
