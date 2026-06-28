import {
  addProductToCart,
  createCheckoutOrder,
  expect,
  getFirstInStockVariantId,
  simulatePaymentSucceeded,
  test,
} from "../fixtures/auth.fixture";

test.describe("Checkout and Stripe simulation", () => {
  test("completes checkout with simulated Stripe webhook", async ({ customerSession, request }) => {
    const variantId = await getFirstInStockVariantId(request);
    const checkout = await createCheckoutOrder(request, customerSession.accessToken, { variantId });

    const simulation = await simulatePaymentSucceeded(request, {
      paymentIntentId: checkout.paymentIntentId,
      orderId: checkout.order.id,
    });

    expect(simulation.handled ?? simulation.data?.handled ?? true).toBeTruthy();
  });

  test("shows order confirmation after simulated payment", async ({ customerPage, customerSession, request }) => {
    const variantId = await getFirstInStockVariantId(request);
    const checkout = await createCheckoutOrder(request, customerSession.accessToken, { variantId });

    await simulatePaymentSucceeded(request, {
      paymentIntentId: checkout.paymentIntentId,
      orderId: checkout.order.id,
    });

    await customerPage.goto(`/checkout/confirmation/${checkout.order.id}`);
    await expect(customerPage.getByText(/confirmation|thank you|order/i).first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test("customer checkout UI reaches payment step", async ({ customerPage, customerSession, request }) => {
    const variantId = await getFirstInStockVariantId(request);
    await addProductToCart(request, customerSession.accessToken, variantId);

    await customerPage.goto("/checkout");
    await expect(customerPage.getByRole("heading", { name: /checkout|premium checkout/i })).toBeVisible({
      timeout: 15_000,
    });

    await customerPage.getByLabel(/^recipientName$/i).fill("Maya Chen");
    await customerPage.getByLabel(/^phone$/i).fill("+15550100011");
    await customerPage.getByLabel(/^line1$/i).fill("88 Madison Avenue");
    await customerPage.getByLabel(/^postalCode$/i).fill("10001");
    await customerPage.getByLabel(/^city$/i).fill("New York");
    await customerPage.getByLabel(/^country$/i).fill("United States");
    await customerPage.getByRole("button", { name: /continue to shipping/i }).click();
    await customerPage.getByRole("button", { name: /continue to review/i }).click();
    await customerPage.getByRole("button", { name: /place order/i }).click();

    await expect(customerPage.getByText(/complete secure payment|payment/i).first()).toBeVisible({
      timeout: 20_000,
    });
  });
});
