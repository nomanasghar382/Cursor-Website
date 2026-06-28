import { AdminOrderDetailClient } from "@/components/admin/admin-orders-client";

type AdminOrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const { id } = await params;
  return <AdminOrderDetailClient orderId={id} />;
}
