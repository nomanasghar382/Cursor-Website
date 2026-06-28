import { apiBaseUrl, expect, test } from "../fixtures/auth.fixture";

test.describe("Authenticated admin journeys", () => {
  test("loads admin dashboard for super-admin user", async ({ adminPage, adminSession }) => {
    await adminPage.goto("/admin");
    await expect(adminPage.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 15_000 });
    await expect(adminPage.getByText(/orders|revenue|products|admin/i).first()).toBeVisible();
    await expect(adminPage.getByText(adminSession.user.email, { exact: false })).toBeVisible();
  });

  test("opens admin products management", async ({ adminPage }) => {
    await adminPage.goto("/admin/products");
    await expect(adminPage.locator("main")).toBeVisible();
    await expect(adminPage.getByText(/product/i).first()).toBeVisible();
  });

  test("opens admin orders management", async ({ adminPage }) => {
    await adminPage.goto("/admin/orders");
    await expect(adminPage.locator("main")).toBeVisible();
  });
});

test.describe("Authenticated admin API session", () => {
  test("admin dashboard API responds for super-admin", async ({ adminSession, request }) => {
    const response = await request.get(`${apiBaseUrl}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminSession.accessToken}` },
    });
    expect(response.ok()).toBeTruthy();
  });
});
