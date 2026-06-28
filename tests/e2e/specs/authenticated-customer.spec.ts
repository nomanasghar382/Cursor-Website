import {
  addProductToCart,
  apiBaseUrl,
  expect,
  getFirstInStockVariantId,
  test,
} from "../fixtures/auth.fixture";

test.describe("Authenticated customer journeys", () => {
  test("accesses account dashboard after seeded login", async ({ customerPage, customerSession }) => {
    await customerPage.goto("/account");
    await expect(customerPage.getByRole("heading", { name: /account|dashboard|welcome/i }).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(customerPage.getByText(customerSession.user.email, { exact: false })).toBeVisible();
  });

  test("adds a product to cart and opens cart page", async ({ customerPage, customerSession, request }) => {
    const variantId = await getFirstInStockVariantId(request);
    await addProductToCart(request, customerSession.accessToken, variantId);

    await customerPage.goto("/cart");
    await expect(customerPage.getByRole("heading", { name: /cart/i })).toBeVisible();
    await expect(customerPage.getByRole("link", { name: /checkout|proceed/i }).first()).toBeVisible();
  });

  test("views order history in account area", async ({ customerPage }) => {
    await customerPage.goto("/account/orders");
    await expect(customerPage.locator("main")).toBeVisible();
  });
});

test.describe("Authenticated customer API session", () => {
  test("auth/me returns seeded profile", async ({ customerSession, request }) => {
    const response = await request.get(`${apiBaseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${customerSession.accessToken}` },
    });
    expect(response.ok()).toBeTruthy();
    const json = await response.json();
    const user = (json.data ?? json).user ?? json.data ?? json;
    expect(user.email).toBe("maya.chen@example.com");
  });
});
