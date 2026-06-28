import { apiRequest } from "@/lib/api/client";
import type { CheckoutAddress, CheckoutPayment, CheckoutPreview, GuestCartItem, OrderSummary, ShippingMethod } from "@/types/commerce";

export type CheckoutPreviewInput = {
  shippingMethodId?: string;
  couponCode?: string;
  giftCardCode?: string;
  guestItems?: GuestCartItem[];
};

export type CheckoutCreateInput = CheckoutPreviewInput & {
  shippingAddress: CheckoutAddress;
  billingAddress?: CheckoutAddress;
  billingSameAsShipping?: boolean;
  deliveryInstructions?: string;
  guestEmail?: string;
  paymentGateway?: string;
};

export const checkoutApi = {
  getShippingMethods() {
    return apiRequest<{ methods: ShippingMethod[] }>("checkout/shipping-methods", { method: "GET" });
  },
  preview(token: string | null, input: CheckoutPreviewInput) {
    const path = token ? "checkout/preview" : "checkout/preview/guest";
    return apiRequest<{ preview: CheckoutPreview }>(path, {
      method: "POST",
      token: token ?? undefined,
      body: input,
    });
  },
  create(token: string | null, input: CheckoutCreateInput) {
    const path = token ? "checkout" : "checkout/guest";
    return apiRequest<{ order: OrderSummary; payment: CheckoutPayment }>(path, {
      method: "POST",
      token: token ?? undefined,
      body: input,
    });
  },
  validateCoupon(token: string, code: string) {
    return apiRequest<{ coupon: { code: string }; discountAmount: number; message: string; aiSuggestion?: string }>(
      "checkout/validate-coupon",
      { method: "POST", token, body: { code } },
    );
  },
};
