"use client";

import { Package, Truck } from "lucide-react";
import { Timeline } from "@/components/common/timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/fulfillment/order-status-badge";
import type { OrderTracking } from "@/types/fulfillment";

export function OrderTrackingPanel({ tracking }: { tracking: OrderTracking }) {
  const shipment = tracking.shipments[0];

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-3 text-lg">
            <Package className="h-5 w-5 text-primary" />
            Order {tracking.orderNumber}
            <OrderStatusBadge status={tracking.status} />
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Estimated delivery in {tracking.estimatedDeliveryDays} business days.
        </CardContent>
      </Card>

      {tracking.timeline.length > 0 ? (
        <Timeline
          items={tracking.timeline.map((step) => ({
            title: step.label,
            description: step.completed ? "Completed" : step.current ? "In progress" : "Upcoming",
            timestamp: step.current ? "Current step" : step.completed ? "Done" : "Pending",
            active: step.current,
          }))}
        />
      ) : null}

      {shipment ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Truck className="h-5 w-5 text-primary" />
              Shipment tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid gap-2 md:grid-cols-2">
              <p>
                <span className="text-muted-foreground">Carrier:</span> {shipment.carrier}
              </p>
              <p>
                <span className="text-muted-foreground">Method:</span> {shipment.method}
              </p>
              <p>
                <span className="text-muted-foreground">Tracking:</span> {shipment.trackingNumber ?? "Pending"}
              </p>
              <p>
                <span className="text-muted-foreground">Status:</span> {shipment.status.replaceAll("_", " ")}
              </p>
            </div>
            {shipment.events.length > 0 ? (
              <div className="space-y-2 rounded-xl border border-border/60 p-4">
                {shipment.events.map((event) => (
                  <div key={event.id} className="flex flex-wrap justify-between gap-2">
                    <span>{event.description ?? event.status}</span>
                    <span className="text-muted-foreground">{new Date(event.occurredAt).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Tracking events will appear once the carrier scans your package.</p>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
