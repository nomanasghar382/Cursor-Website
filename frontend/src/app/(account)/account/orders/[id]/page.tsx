import { Breadcrumb } from "@/components/common/breadcrumb";
import { OrderDetailClient } from "@/components/account/order-detail-client";
import { buildMetadata } from "@/lib/seo";

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: OrderDetailPageProps) {
  const { id } = await params;
  return buildMetadata({ title: "Order details", path: `/account/orders/${id}` });
}

export default async function AccountOrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  return (
    <div className="space-y-10">
      <Breadcrumb items={[{ label: "Account", href: "/account" }, { label: "Orders", href: "/account/orders" }, { label: "Details" }]} />
      <OrderDetailClient orderId={id} />
    </div>
  );
}
