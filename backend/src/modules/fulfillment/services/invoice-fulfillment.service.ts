import { Injectable, NotFoundException } from "@nestjs/common";
import { FulfillmentRepository } from "../repositories/fulfillment.repository";

@Injectable()
export class InvoiceFulfillmentService {
  constructor(private readonly fulfillmentRepository: FulfillmentRepository) {}

  async getInvoice(orderId: string, userId?: string) {
    const order = userId
      ? await this.fulfillmentRepository.findOrderForUser(userId, orderId)
      : await this.fulfillmentRepository.findOrderById(orderId);
    if (!order) throw new NotFoundException("Order not found.");

    const invoice = order.invoices[0];
    if (!invoice) throw new NotFoundException("Invoice not found.");

    const metadata = (order.metadata ?? {}) as {
      shippingAddress?: Record<string, string>;
      billingAddress?: Record<string, string>;
    };

    const payload = {
      invoiceNumber: invoice.invoiceNumber,
      issuedAt: invoice.issuedAt?.toISOString(),
      orderNumber: order.orderNumber,
      status: invoice.status,
      currencyCode: order.currencyCode,
      billing: metadata.billingAddress ?? metadata.shippingAddress,
      shipping: metadata.shippingAddress,
      subtotal: Number(order.subtotal),
      taxTotal: Number(order.taxTotal),
      shippingTotal: Number(order.shippingTotal),
      discountTotal: Number(order.discountTotal),
      grandTotal: Number(order.grandTotal),
      items: order.items.map((item) => ({
        name: item.productNameSnapshot,
        sku: item.skuSnapshot,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        taxAmount: Number(item.taxAmount),
        lineTotal: Number(item.lineTotal),
      })),
      payments: order.payments.map((payment) => ({
        gateway: payment.gateway,
        status: payment.status,
        amount: Number(payment.amount),
      })),
      pdf: {
        architecture: "Server-side PDF renderer ready (Puppeteer / PDFKit hook)",
        template: "invoice-v1",
        downloadUrl: invoice.pdfUrl ?? null,
        renderEndpoint: `/api/v1/fulfillment/orders/${order.id}/invoice/pdf`,
      },
    };

    return { invoice: payload, receipt: this.buildReceipt(payload) };
  }

  private buildReceipt(invoice: {
    invoiceNumber: string;
    orderNumber: string;
    issuedAt?: string;
    grandTotal: number;
    currencyCode: string;
    items: Array<{ name: string; quantity: number; lineTotal: number }>;
  }) {
    return {
      title: "NOVAEX Order Receipt",
      reference: invoice.invoiceNumber,
      orderNumber: invoice.orderNumber,
      issuedAt: invoice.issuedAt,
      lineItems: invoice.items.map((item) => `${item.name} × ${item.quantity}`),
      total: invoice.grandTotal,
      currencyCode: invoice.currencyCode,
    };
  }
}
