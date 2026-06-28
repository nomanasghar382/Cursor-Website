import { Breadcrumb } from "@/components/common/breadcrumb";
import { OrderConfirmationClient } from "@/components/checkout/order-confirmation-client";
import { buildMetadata } from "@/lib/seo";

type ConfirmationPageProps = {
  params: Promise<{ orderId: string }>;
};

export async function generateMetadata({ params }: ConfirmationPageProps) {
  const { orderId } = await params;
  return buildMetadata({
    title: "Order confirmed",
    description: "Your NOVAEX order has been placed successfully.",
    path: `/checkout/confirmation/${orderId}`,
  });
}

export default async function OrderConfirmationPage({ params }: ConfirmationPageProps) {
  const { orderId } = await params;
  return (
    <div className="space-y-10">
      <Breadcrumb items={[{ label: "Checkout", href: "/checkout" }, { label: "Confirmation" }]} />
      <OrderConfirmationClient orderId={orderId} />
    </div>
  );
}
