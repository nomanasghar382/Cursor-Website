import { test, expect } from "@playwright/test";

test.describe("Authentication journeys", () => {
  test("login page renders form fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("registration page renders form fields", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByLabel(/first name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();
  });

  test("forgot password flow is reachable", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: /forgot password/i }).click();
    await expect(page).toHaveURL(/forgot-password/);
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });
});
