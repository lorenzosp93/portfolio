import { expect, test } from "@playwright/test";

test("renders the main portfolio sections", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.getByRole("main").locator("footer")).toHaveCount(0);
  await expect(page.getByRole("contentinfo")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: /Hi, I'm Lorenzo/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Experience leading products and teams." })).toBeAttached();
  await expect(page.getByRole("heading", { name: "Thoughts from the blog." })).toBeAttached();
  await expect(page.getByRole("heading", { name: "Get in touch!" })).toBeAttached();
});

test("docks the navbar after scrolling to explore", async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.getByRole("button", { name: "Scroll to explore the portfolio" }).click();

    await expect.poll(async () => {
      const navbar = await page.locator("#the-navbar").boundingBox();
      return Math.abs(navbar!.y);
    }).toBeLessThan(1);
    await expect(page.locator(".navbar-surface")).toHaveCSS("opacity", "1");
  }
});

test("does not place the animated portrait inside a transformed hero layout", async ({ page }) => {
  await page.goto("/");

  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const layout = page.locator(".hero-layout");
    await expect(layout).toHaveCSS("transform", "none");
    await expect(layout).toHaveCSS("top", width < 640 ? "-32px" : "0px");
    await expect(page.locator(".navbar-surface")).toHaveCSS("backdrop-filter", "none");
  }
});

test("uses a consistent night background across sections in dark mode", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(11, 17, 32)");
  await expect(page.locator(".cloud-teal")).toHaveCSS("background-image", /rgb\(24, 60, 54\)/);
  await expect(page.locator(".cloud-teal")).toHaveCSS("opacity", "0.28");
  await expect(page.locator(".cloud-coral")).toHaveCSS("background-image", /rgb\(68, 43, 50\)/);
  for (const selector of ["#the-resume", "#the-contacts"]) {
    await expect(page.locator(selector)).toHaveCSS("background-image", "none");
    await expect(page.locator(selector)).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  }
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

test("returns to the hero from the mobile portrait", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/");
  await page.locator("#the-resume").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => window.scrollY > 100);

  await page.getByRole("button", { name: "Open main menu" }).click();
  await page.getByRole("button", { name: "Back to introduction", exact: true }).click();

  await page.waitForFunction(() => window.scrollY < 2);
  await expect(page.locator("#mobile-menu")).toHaveAttribute("aria-hidden", "true");
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
