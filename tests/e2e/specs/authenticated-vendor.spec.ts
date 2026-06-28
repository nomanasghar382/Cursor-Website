import { apiBaseUrl, expect, test } from "../fixtures/auth.fixture";

test.describe("Authenticated vendor journeys", () => {
  test("loads vendor dashboard for vendor-admin user", async ({ vendorPage, vendorSession }) => {
    await vendorPage.goto("/vendor");
    await expect(vendorPage.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 15_000 });
    await expect(vendorPage.getByText(/orders|products|vendor|revenue/i).first()).toBeVisible();
    await expect(vendorPage.getByText(vendorSession.user.email, { exact: false })).toBeVisible();
  });

  test("opens vendor product management", async ({ vendorPage }) => {
    await vendorPage.goto("/vendor/products");
    await expect(vendorPage.locator("main")).toBeVisible();
  });

  test("opens vendor orders workspace", async ({ vendorPage }) => {
    await vendorPage.goto("/vendor/orders");
    await expect(vendorPage.locator("main")).toBeVisible();
  });
});

test.describe("Authenticated vendor API session", () => {
  test("vendor dashboard API responds", async ({ vendorSession, request }) => {
    const response = await request.get(`${apiBaseUrl}/vendor/dashboard`, {
      headers: { Authorization: `Bearer ${vendorSession.accessToken}` },
    });
    expect(response.ok()).toBeTruthy();
  });
});
