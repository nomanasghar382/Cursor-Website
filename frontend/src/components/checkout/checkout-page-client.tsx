"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, CreditCard, MapPin, Package, Sparkles, Truck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { checkoutApi } from "@/lib/api/checkout";
import { useAuthStore } from "@/stores/auth-store";
import { useCommerceStore } from "@/stores/commerce-store";
import type { CheckoutAddress, CheckoutPreview, ShippingMethod } from "@/types/commerce";
import { formatCurrency } from "@/lib/utils";

const steps = [
  { id: "address", label: "Address", icon: MapPin },
  { id: "shipping", label: "Shipping", icon: Truck },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "review", label: "Review", icon: Package },
] as const;

type StepId = (typeof steps)[number]["id"];

export function CheckoutPageClient() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const token = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const cart = useCommerceStore((state) => state.cart);
  const guestCart = useCommerceStore((state) => state.guestCart);
  const hydrateCart = useCommerceStore((state) => state.hydrateCart);

  const [step, setStep] = useState<StepId>("address");
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  const [shippingMethodId, setShippingMethodId] = useState<string>();
  const [couponCode, setCouponCode] = useState("");
  const [giftCardCode, setGiftCardCode] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [address, setAddress] = useState<CheckoutAddress>({
    recipientName: user?.name ?? "",
    phone: "",
    line1: "",
    line2: "",
    postalCode: "",
    city: "",
    country: "United States",
  });
  const [guestEmail, setGuestEmail] = useState(user?.email ?? "");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  useEffect(() => {
    const init = async () => {
      if (token) await hydrateCart(token);
      const state = useCommerceStore.getState();
      const count = state.cart?.items.length ?? state.guestCart.length;
      if (count === 0) {
        router.replace("/cart");
        return;
      }
      void checkoutApi.getShippingMethods().then((result) => {
        setShippingMethods(result.methods);
        setShippingMethodId(result.methods[0]?.id);
      });
    };
    void init();
  }, [token, hydrateCart, router]);

  const refreshPreview = async () => {
    const result = await checkoutApi.preview(token, {
      shippingMethodId,
      couponCode: couponCode || undefined,
      giftCardCode: giftCardCode || undefined,
      guestItems: token ? undefined : guestCart,
    });
    setPreview(result.preview);
  };

  useEffect(() => {
    if ((cart?.items.length ?? 0) > 0 || guestCart.length > 0) {
      void refreshPreview();
    }
  }, [shippingMethodId, couponCode, giftCardCode, cart?.items.length, guestCart.length, token]);

  const stripePromise = useMemo(
    () => (publishableKey ? loadStripe(publishableKey) : null),
    [publishableKey],
  );

  const placeOrder = async () => {
    try {
      const result = await checkoutApi.create(token, {
        shippingMethodId,
        couponCode: couponCode || undefined,
        giftCardCode: giftCardCode || undefined,
        guestItems: token ? undefined : guestCart,
        shippingAddress: address,
        billingSameAsShipping: true,
        deliveryInstructions,
        guestEmail: token ? undefined : guestEmail,
        paymentGateway: "STRIPE",
      });
      setClientSecret(result.payment.clientSecret);
      setPublishableKey(result.payment.publishableKey);
      setOrderId(result.order.id);
      setStep("payment");
      toast.success("Order created. Complete secure payment to confirm.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Checkout failed");
    }
  };

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Checkout"
        title="Premium checkout"
        description="A multi-step, secure experience with AI savings suggestions and express-ready payment architecture."
      />

      <div className="grid gap-3 md:grid-cols-4">
        {steps.map((entry, index) => {
          const Icon = entry.icon;
          const active = entry.id === step;
          const completed = steps.findIndex((item) => item.id === step) > index;
          return (
            <div
              key={entry.id}
              className={`rounded-[1.25rem] border px-4 py-3 ${active ? "border-primary bg-primary/10" : "border-border/60"}`}
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                {completed ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Icon className="h-4 w-4" />}
                {entry.label}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-10 xl:grid-cols-[1.1fr_0.9fr]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={prefersReducedMotion ? false : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, x: -20 }}
            className="space-y-6 rounded-[2rem] border border-border/60 bg-card/40 p-6"
          >
            {step === "address" ? (
              <div className="space-y-4">
                {!token ? (
                  <div className="space-y-2">
                    <Label htmlFor="guest-email">Email for guest checkout</Label>
                    <Input id="guest-email" type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} />
                  </div>
                ) : null}
                {(["recipientName", "phone", "line1", "line2", "postalCode", "city", "country"] as const).map((field) => (
                  <div key={field} className="space-y-2">
                    <Label htmlFor={field}>{field}</Label>
                    <Input
                      id={field}
                      value={address[field] ?? ""}
                      onChange={(event) => setAddress((current) => ({ ...current, [field]: event.target.value }))}
                    />
                  </div>
                ))}
                <div className="space-y-2">
                  <Label htmlFor="delivery-instructions">Delivery instructions</Label>
                  <Textarea
                    id="delivery-instructions"
                    value={deliveryInstructions}
                    onChange={(event) => setDeliveryInstructions(event.target.value)}
                  />
                </div>
                <Button variant="gradient" onClick={() => setStep("shipping")}>
                  Continue to shipping
                </Button>
              </div>
            ) : null}

            {step === "shipping" ? (
              <div className="space-y-4">
                {shippingMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    className={`flex w-full items-center justify-between rounded-[1.25rem] border px-4 py-4 text-left ${
                      shippingMethodId === method.id ? "border-primary bg-primary/5" : "border-border/60"
                    }`}
                    onClick={() => setShippingMethodId(method.id)}
                  >
                    <div>
                      <p className="font-medium">{method.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {method.carrier} · {method.estimatedDays} business days
                      </p>
                    </div>
                    <p className="font-semibold">{method.price === 0 ? "Free" : formatCurrency(method.price)}</p>
                  </button>
                ))}
                <Button variant="gradient" onClick={() => setStep("review")}>
                  Continue to review
                </Button>
              </div>
            ) : null}

            {step === "review" ? (
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <Input placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} aria-label="Coupon code" />
                  <Input placeholder="Gift card code" value={giftCardCode} onChange={(e) => setGiftCardCode(e.target.value)} aria-label="Gift card code" />
                </div>
                {preview?.aiSuggestions[0] ? (
                  <div className="rounded-[1.25rem] border border-primary/20 bg-primary/5 p-4 text-sm">
                    <div className="mb-2 flex items-center gap-2 font-medium text-primary">
                      <Sparkles className="h-4 w-4" />
                      AI checkout assistant
                    </div>
                    {preview.aiSuggestions[0]}
                  </div>
                ) : null}
                <Button variant="gradient" size="lg" onClick={() => void placeOrder()}>
                  Place order & continue to payment
                </Button>
              </div>
            ) : null}

            {step === "payment" && clientSecret && stripePromise ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutPaymentForm
                  orderId={orderId}
                  onSuccess={() => router.push(`/checkout/confirmation/${orderId}`)}
                />
              </Elements>
            ) : null}
          </motion.div>
        </AnimatePresence>

        <aside className="space-y-4 rounded-[2rem] border border-border/60 bg-card/40 p-6 lg:sticky lg:top-28">
          <h2 className="font-display text-2xl font-semibold">Order summary</h2>
          {preview ? (
            <div className="space-y-2 text-sm">
              {preview.lines.map((line) => (
                <div key={line.variantId} className="flex justify-between gap-4">
                  <span>
                    {line.productName} × {line.quantity}
                  </span>
                  <span>{formatCurrency(line.lineTotal)}</span>
                </div>
              ))}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(preview.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(preview.taxTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{preview.shippingTotal === 0 ? "Free" : formatCurrency(preview.shippingTotal)}</span>
              </div>
              {preview.discountTotal > 0 ? (
                <div className="flex justify-between text-emerald-400">
                  <span>Discounts</span>
                  <span>-{formatCurrency(preview.discountTotal)}</span>
                </div>
              ) : null}
              <div className="flex justify-between font-display text-xl font-semibold">
                <span>Total</span>
                <span>{formatCurrency(preview.grandTotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Estimated delivery in {preview.estimatedDeliveryDays} business days
              </p>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function CheckoutPaymentForm({ orderId, onSuccess }: { orderId: string | null; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });
    setLoading(false);
    if (result.error) {
      toast.error(result.error.message ?? "Payment failed");
      return;
    }
    toast.success("Payment confirmed");
    onSuccess();
  };

  return (
    <div className="space-y-4">
      <PaymentElement />
      <p className="text-xs text-muted-foreground">
        Secure payment via Stripe. Architecture also supports PayPal, Apple Pay, Google Pay, and local gateways.
      </p>
      <Button variant="gradient" size="lg" disabled={loading || !orderId} onClick={() => void submit()}>
        {loading ? "Processing..." : "Complete secure payment"}
      </Button>
    </div>
  );
}
