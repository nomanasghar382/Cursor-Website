"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Download, RotateCcw, Star, Undo2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Timeline } from "@/components/common/timeline";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { ordersApi } from "@/lib/api/orders";
import type { OrderSummary } from "@/types/commerce";
import { formatCurrency } from "@/lib/utils";

export function OrderDetailClient({ orderId }: { orderId: string }) {
  const { token, ready } = useRequireAuth(`/login?next=/account/orders/${orderId}`);
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [returnOpen, setReturnOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [reviewItemId, setReviewItemId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");

  const loadOrder = async () => {
    if (!token) return;
    const result = await ordersApi.getById(token, orderId);
    setOrder(result.order);
  };

  useEffect(() => {
    if (!ready || !token) return;
    void loadOrder();
  }, [ready, token, orderId]);

  const cancelOrder = async () => {
    if (!token) return;
    await ordersApi.cancel(token, orderId);
    toast.success("Order cancelled");
    await loadOrder();
  };

  const requestReturn = async () => {
    if (!token) return;
    await ordersApi.requestReturn(token, orderId, returnReason);
    setReturnOpen(false);
    setReturnReason("");
    toast.success("Return requested");
    await loadOrder();
  };

  const reorder = async () => {
    if (!token) return;
    await ordersApi.reorder(token, orderId);
    toast.success("Items added to cart");
  };

  const downloadInvoice = async () => {
    if (!token) return;
    const result = await ordersApi.getInvoice(token, orderId);
    const blob = new Blob([JSON.stringify(result.invoice, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${order?.orderNumber ?? "invoice"}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Invoice downloaded");
  };

  const submitReview = async () => {
    if (!token || !reviewItemId) return;
    await ordersApi.review(token, orderId, reviewItemId, {
      rating: reviewRating,
      title: reviewTitle,
      body: reviewBody,
    });
    setReviewOpen(false);
    setReviewTitle("");
    setReviewBody("");
    toast.success("Review submitted");
  };

  if (!order) return <p className="text-muted-foreground">Loading order...</p>;

  const canCancel = ["PENDING_PAYMENT", "CONFIRMED"].includes(order.status);
  const canReturn = order.status === "DELIVERED";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold">{order.orderNumber}</h1>
          <Badge className="mt-2" variant="secondary">
            {order.status}
          </Badge>
        </div>
        <p className="font-display text-3xl font-semibold">{formatCurrency(order.grandTotal)}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {canCancel ? (
          <Button variant="outline" onClick={() => void cancelOrder()}>
            <XCircle className="mr-2 h-4 w-4" />
            Cancel order
          </Button>
        ) : null}
        {canReturn ? (
          <Button variant="outline" onClick={() => setReturnOpen(true)}>
            <Undo2 className="mr-2 h-4 w-4" />
            Request return
          </Button>
        ) : null}
        <Button variant="outline" onClick={() => void reorder()}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reorder
        </Button>
        <Button variant="outline" onClick={() => void downloadInvoice()}>
          <Download className="mr-2 h-4 w-4" />
          Download invoice
        </Button>
      </div>

      {order.timeline?.length ? (
        <Timeline
          items={order.timeline.map((step) => ({
            title: step.label,
            description: step.completed ? "Completed" : step.current ? "In progress" : "Upcoming",
            timestamp: step.current ? "Current step" : step.completed ? "Done" : "Pending",
            active: step.current,
          }))}
        />
      ) : null}

      <div className="space-y-3 rounded-[1.5rem] border border-border/60 p-5">
        {order.items?.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <span>
              {item.productName} × {item.quantity}
            </span>
            <div className="flex items-center gap-3">
              <span>{formatCurrency(item.lineTotal)}</span>
              {order.status === "DELIVERED" ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setReviewItemId(item.id);
                    setReviewOpen(true);
                  }}
                >
                  <Star className="mr-1 h-3.5 w-3.5" />
                  Review
                </Button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <Button asChild variant="outline">
        <Link href="/account/orders">Back to orders</Link>
      </Button>

      <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request return</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="return-reason">Reason</Label>
              <Textarea
                id="return-reason"
                value={returnReason}
                onChange={(event) => setReturnReason(event.target.value)}
                placeholder="Describe the issue with your order"
              />
            </div>
            <Button variant="gradient" onClick={() => void requestReturn()}>
              Submit return request
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="review-rating">Rating (1-5)</Label>
              <Input
                id="review-rating"
                type="number"
                min={1}
                max={5}
                value={reviewRating}
                onChange={(event) => setReviewRating(Number(event.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="review-title">Title</Label>
              <Input id="review-title" value={reviewTitle} onChange={(event) => setReviewTitle(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="review-body">Review</Label>
              <Textarea id="review-body" value={reviewBody} onChange={(event) => setReviewBody(event.target.value)} />
            </div>
            <Button variant="gradient" onClick={() => void submitReview()}>
              Submit review
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
