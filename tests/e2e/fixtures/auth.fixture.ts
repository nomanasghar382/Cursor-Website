import { test as base, type Page, type APIRequestContext } from "@playwright/test";

export const testUsers = {
  customer: {
    email: "maya.chen@example.com",
    password: "NOVAEX-Customer-2026!",
    name: "Maya Chen",
  },
  admin: {
    email: "admin@novaex.ai",
    password: "NOVAEX-Admin-2026!",
    name: "Ariana Sterling",
  },
} as const;

export type AuthSession = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    roles: string[];
    permissions: string[];
    emailVerified: boolean;
    status: string;
  };
};

export const apiBaseUrl = process.env.PLAYWRIGHT_API_URL ?? "http://localhost:4000/api/v1";

export async function loginWithApi(
  request: APIRequestContext,
  payload: { email: string; password: string; audience?: string },
): Promise<AuthSession> {
  const path =
    payload.audience === "vendor"
      ? "auth/vendor/login"
      : payload.audience === "super-admin"
        ? "auth/super-admin/login"
        : payload.audience === "admin"
          ? "auth/admin/login"
          : "auth/login";

  const response = await request.post(`${apiBaseUrl}/${path}`, {
    data: {
      email: payload.email,
      password: payload.password,
      rememberMe: true,
    },
  });

  if (!response.ok()) {
    throw new Error(`Login failed (${response.status()}): ${await response.text()}`);
  }

  const json = await response.json();
  const session = (json.data ?? json) as AuthSession;
  if (!session.accessToken || !session.user) {
    throw new Error("Login response did not include access token and user.");
  }

  return session;
}

export async function seedAuthState(page: Page, session: AuthSession) {
  await page.addInitScript((value) => {
    window.localStorage.setItem(
      "novaex-auth",
      JSON.stringify({
        state: {
          accessToken: value.accessToken,
          user: value.user,
        },
        version: 0,
      }),
    );
  }, session);
}

export async function addProductToCart(request: APIRequestContext, token: string, variantId: string) {
  const response = await request.post(`${apiBaseUrl}/cart/items`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    data: { variantId, quantity: 1 },
  });

  if (!response.ok()) {
    throw new Error(`Add to cart failed (${response.status()}): ${await response.text()}`);
  }
}

export async function getFirstInStockVariantId(request: APIRequestContext) {
  const response = await request.get(`${apiBaseUrl}/products?limit=5`);
  if (!response.ok()) {
    throw new Error(`Products list failed (${response.status()}): ${await response.text()}`);
  }

  const json = await response.json();
  const payload = json.data ?? json;
  const product = payload.products?.find((entry: { defaultVariantId?: string; stock?: number }) => entry.defaultVariantId && (entry.stock ?? 0) > 0);
  if (!product?.defaultVariantId) {
    throw new Error("No in-stock seeded product variant found for E2E checkout.");
  }

  return product.defaultVariantId as string;
}

export async function simulatePaymentSucceeded(
  request: APIRequestContext,
  input: { paymentIntentId: string; orderId: string },
) {
  const response = await request.post(`${apiBaseUrl}/payments/test/simulate-succeeded`, {
    data: input,
  });

  if (!response.ok()) {
    throw new Error(`Payment simulation failed (${response.status()}): ${await response.text()}`);
  }

  return response.json();
}

export async function createCheckoutOrder(
  request: APIRequestContext,
  token: string,
  input: {
    variantId: string;
    shippingMethodId?: string;
  },
) {
  await addProductToCart(request, token, input.variantId);

  const shippingResponse = await request.get(`${apiBaseUrl}/checkout/shipping-methods`);
  const shippingJson = await shippingResponse.json();
  const shippingMethods = (shippingJson.data ?? shippingJson).methods as Array<{ id: string }>;
  const shippingMethodId = input.shippingMethodId ?? shippingMethods[0]?.id;
  if (!shippingMethodId) {
    throw new Error("No shipping methods available for checkout E2E.");
  }

  const response = await request.post(`${apiBaseUrl}/checkout`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    data: {
      shippingMethodId,
      shippingAddress: {
        recipientName: "Maya Chen",
        phone: "+15550100011",
        line1: "88 Madison Avenue",
        line2: "",
        postalCode: "10001",
        city: "New York",
        country: "United States",
      },
      billingSameAsShipping: true,
      paymentGateway: "STRIPE",
    },
  });

  if (!response.ok()) {
    throw new Error(`Checkout create failed (${response.status()}): ${await response.text()}`);
  }

  const json = await response.json();
  const payload = (json.data ?? json) as {
    order: { id: string; orderNumber: string };
    payment: { clientSecret: string | null };
  };

  const paymentIntentId = payload.payment.clientSecret?.split("_secret")[0];
  if (!paymentIntentId) {
    throw new Error("Checkout response did not include a simulated payment intent.");
  }

  return {
    order: payload.order,
    paymentIntentId,
  };
}

type AuthenticatedFixtures = {
  customerSession: AuthSession;
  adminSession: AuthSession;
  vendorSession: AuthSession;
  customerPage: Page;
  adminPage: Page;
  vendorPage: Page;
};

export const test = base.extend<AuthenticatedFixtures>({
  customerSession: async ({ request }, use) => {
    const session = await loginWithApi(request, testUsers.customer);
    await use(session);
  },
  adminSession: async ({ request }, use) => {
    const session = await loginWithApi(request, { ...testUsers.admin, audience: "super-admin" });
    await use(session);
  },
  vendorSession: async ({ request }, use) => {
    const session = await loginWithApi(request, { ...testUsers.admin, audience: "vendor" });
    await use(session);
  },
  customerPage: async ({ page, customerSession }, use) => {
    await seedAuthState(page, customerSession);
    await use(page);
  },
  adminPage: async ({ page, adminSession }, use) => {
    await seedAuthState(page, adminSession);
    await use(page);
  },
  vendorPage: async ({ page, vendorSession }, use) => {
    await seedAuthState(page, vendorSession);
    await use(page);
  },
});

export { expect } from "@playwright/test";
