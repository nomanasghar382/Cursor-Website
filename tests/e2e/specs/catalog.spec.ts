import { test, expect } from "@playwright/test";

test.describe("Marketing and catalog journeys", () => {
  test("homepage loads with navigation and hero content", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/NOVAEX/i);
    await expect(page.getByRole("navigation")).toBeVisible();
    await expect(page.getByRole("link", { name: /products/i }).first()).toBeVisible();
  });

  test("browse products catalog", async ({ page }) => {
    await page.goto("/products");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
  });

  test("search products from catalog", async ({ page }) => {
    await page.goto("/products");
    const search = page.getByPlaceholder(/search/i).first();
    if (await search.isVisible()) {
      await search.fill("headphones");
      await search.press("Enter");
      await expect(page).toHaveURL(/search|products/);
    }
  });
});
