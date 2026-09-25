import { expect, test } from "@playwright/test";

const post = (id: number) => ({
  uuid: `post-uuid-${id}`,
  name: `Linked post ${id}`,
  slug: `post-${id}`,
  created_at: "2026-01-01",
  location: "Amsterdam",
  picture: "",
  content: `Body of post ${id}`,
  attachments: [],
  created_by: { first_name: "Lorenzo", last_name: "Spinelli" },
});

// The first page holds posts 1-5; the slug lookup returns any single post.
test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.includes("/blog/post/")) {
      const slug = url.searchParams.get("slug");
      const results = slug ? [post(Number(slug.split("-")[1]))] : [1, 2, 3, 4, 5].map(post);
      return route.fulfill({ json: { count: 9, next: null, previous: null, results } });
    }
    return route.fulfill({
      json: url.pathname.includes("/settings/") ? { hero_picture: null }
        : url.pathname.includes("skillcategory") ? []
        : { count: 0, results: [], next: null, previous: null },
    });
  });
});

for (const [label, id] of [["beyond the first page", 9], ["on the first page", 2]] as const) {
  test(`a deep link opens the detail card for a post ${label}`, async ({ page }) => {
    await page.goto(`/?post=post-${id}`);

    const card = page.locator(".bottom-sheet.opened #detail-card");
    await expect(card).toHaveCount(1);
    await expect(card).toContainText(`Body of post ${id}`);
    await expect(page).toHaveURL(new RegExp(`\\?post=post-${id}$`));
  });
}
