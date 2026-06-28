import { test, expect } from "@playwright/test";

test.describe("Commerce journeys", () => {
  test("cart page is accessible", async ({ page }) => {
    await page.goto("/cart");
    await expect(page.getByRole("heading", { name: /cart/i })).toBeVisible();
  });

  test("checkout requires authentication or shows checkout UI", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page.locator("main")).toBeVisible();
  });

  test("AI marketing page is reachable", async ({ page }) => {
    await page.goto("/ai");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
