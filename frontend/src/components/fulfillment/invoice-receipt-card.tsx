"use client";

import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InvoicePayload } from "@/types/fulfillment";
import { formatCurrency } from "@/lib/utils";

export function InvoiceReceiptCard({ invoice }: { invoice: InvoicePayload }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-primary" />
          Invoice {invoice.invoiceNumber}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="grid gap-2 md:grid-cols-2">
          <p>
            <span className="text-muted-foreground">Order:</span> {invoice.orderNumber}
          </p>
          <p>
            <span className="text-muted-foreground">Issued:</span>{" "}
            {invoice.issuedAt ? new Date(invoice.issuedAt).toLocaleDateString() : "Pending"}
          </p>
        </div>

        <div className="space-y-2 rounded-xl border border-border/60 p-4">
          {invoice.items.map((item, index) => (
            <div key={`${item.name}-${index}`} className="flex justify-between gap-3">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>{formatCurrency(item.lineTotal)}</span>
            </div>
          ))}
        </div>

        <div className="space-y-1 text-right">
          <p>Subtotal: {formatCurrency(invoice.subtotal)}</p>
          <p>Tax: {formatCurrency(invoice.taxTotal)}</p>
          <p>Shipping: {formatCurrency(invoice.shippingTotal)}</p>
          {invoice.discountTotal > 0 ? <p>Discount: -{formatCurrency(invoice.discountTotal)}</p> : null}
          <p className="font-display text-lg font-semibold">Total: {formatCurrency(invoice.grandTotal)}</p>
        </div>

        <p className="text-xs text-muted-foreground">{invoice.pdf.architecture}</p>
      </CardContent>
    </Card>
  );
}
