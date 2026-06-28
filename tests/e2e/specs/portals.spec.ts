import { test, expect } from "@playwright/test";

test.describe("Admin and vendor portals", () => {
  test("admin login page loads", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("vendor login page loads", async ({ page }) => {
    await page.goto("/vendor/login");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });
});
