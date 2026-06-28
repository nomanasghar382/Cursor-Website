import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { CartRepository } from "../../cart/repositories/cart.repository";
import { CouponsService } from "../../coupons/services/coupons.service";
import { GiftCardsService } from "../../coupons/services/gift-cards.service";
import { StripeService } from "../../payments/services/stripe.service";
import { NotificationService } from "../../notifications/services/notification.service";
import { CheckoutCreateDto, CheckoutPreviewDto } from "../dto/checkout.dto";
import { CheckoutRepository } from "../repositories/checkout.repository";
import { PrismaService } from "../../../database/prisma.service";

type CheckoutLine = {
  variantId: string;
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  storeId: string;
};

@Injectable()
export class CheckoutService {
  constructor(
    private readonly checkoutRepository: CheckoutRepository,
    private readonly cartRepository: CartRepository,
    private readonly couponsService: CouponsService,
    private readonly giftCardsService: GiftCardsService,
    private readonly stripeService: StripeService,
    private readonly notificationService: NotificationService,
    private readonly prisma: PrismaService,
  ) {}

  async getShippingMethods() {
    const methods = await this.checkoutRepository.getShippingMethods();
    return {
      methods: methods.map((method) => ({
        id: method.id,
        name: method.name,
        carrier: method.carrier,
        serviceLevel: method.serviceLevel,
        price: Number(method.basePrice),
        currencyCode: method.currencyCode,
        estimatedDays: method.serviceLevel.includes("priority") ? 2 : 5,
      })),
    };
  }

  async preview(userId: string | undefined, dto: CheckoutPreviewDto) {
    const lines = await this.resolveLines(userId, dto.guestItems);
    const totals = await this.calculateTotals(userId ?? "guest", lines, dto);
    return { preview: totals };
  }

  async create(userId: string | undefined, dto: CheckoutCreateDto) {
    const resolvedUserId = userId ?? (await this.resolveGuestUser(dto.guestEmail!));
    const lines = await this.resolveLines(resolvedUserId, dto.guestItems);
    const totals = await this.calculateTotals(resolvedUserId, lines, dto);

    if (totals.grandTotal <= 0) {
      throw new BadRequestException("Order total must be greater than zero.");
    }

    const storeIds = [...new Set(lines.map((line) => line.storeId))];
    if (storeIds.length > 1) {
      throw new BadRequestException("Checkout currently supports one store per order.");
    }

    for (const line of lines) {
      const reserved = await this.checkoutRepository.reserveInventory(line.variantId, line.quantity);
      if (reserved.count === 0) {
        throw new BadRequestException(`Insufficient inventory for ${line.productName}.`);
      }
    }

    const orderNumber = await this.generateOrderNumber();
    const taxRate = await this.checkoutRepository.getTaxRate();

    let order;
    try {
      order = await this.prisma.$transaction(async (tx) => {
        const created = await tx.order.create({
          data: {
            orderNumber,
            userId: resolvedUserId,
            storeId: storeIds[0]!,
            status: "PENDING_PAYMENT",
            currencyCode: "USD",
            subtotal: totals.subtotal,
            taxTotal: totals.taxTotal,
            shippingTotal: totals.shippingTotal,
            discountTotal: totals.discountTotal,
            grandTotal: totals.grandTotal,
            metadata: {
              shippingAddress: { ...dto.shippingAddress },
              billingAddress: {
                ...(dto.billingSameAsShipping ? dto.shippingAddress : dto.billingAddress ?? dto.shippingAddress),
              },
              deliveryInstructions: dto.deliveryInstructions,
              paymentGateway: dto.paymentGateway ?? "STRIPE",
              guestEmail: dto.guestEmail,
            } satisfies Prisma.InputJsonObject,
          },
        });

        for (const line of lines) {
          await tx.orderItem.create({
            data: {
              orderId: created.id,
              productId: line.productId,
              variantId: line.variantId,
              productNameSnapshot: line.productName,
              skuSnapshot: line.sku,
              unitPrice: line.unitPrice,
              quantity: line.quantity,
              taxAmount: Number(((line.lineTotal / totals.subtotal) * totals.taxTotal || 0).toFixed(2)),
              discountAmount: 0,
              lineTotal: line.lineTotal,
              taxRateId: taxRate?.id,
            },
          });
        }

        if (totals.coupon?.id) {
          await tx.couponRedemption.create({
            data: {
              couponId: totals.coupon.id,
              userId: resolvedUserId,
              orderId: created.id,
              discountAmount: totals.couponDiscount,
            },
          });
        }

        if (totals.giftCard?.giftCardId) {
          await this.giftCardsService.redeem(totals.giftCard.giftCardId, created.id, totals.giftCard.appliedAmount);
        }

        await tx.shipment.create({
          data: {
            orderId: created.id,
            shippingMethodId: totals.shippingMethodId,
            carrier: totals.shippingCarrier,
            status: "PENDING",
            metadata: { estimatedDays: totals.estimatedDeliveryDays },
          },
        });

        await tx.invoice.create({
          data: {
            orderId: created.id,
            invoiceNumber: `INV-${orderNumber}`,
            status: "PUBLISHED",
            issuedAt: new Date(),
          },
        });

        return created;
      });
    } catch (error) {
      for (const line of lines) {
        await this.checkoutRepository.releaseInventory(line.variantId, line.quantity);
      }
      throw error;
    }

    const user = await this.checkoutRepository.getUserById(resolvedUserId);
    const paymentIntent = await this.stripeService.createPaymentIntent({
      amountCents: Math.round(totals.grandTotal * 100),
      currency: "USD",
      orderId: order.id,
      customerEmail: user?.email ?? dto.guestEmail!,
    });

    const payment = await this.prisma.payment.create({
      data: {
        orderId: order.id,
        gateway: "STRIPE",
        gatewayPaymentId: paymentIntent.id,
        status: "REQUIRES_ACTION",
        amount: totals.grandTotal,
        currencyCode: "USD",
        metadata: {
          clientSecret: paymentIntent.client_secret,
          supportedGateways: ["STRIPE", "PAYPAL", "APPLE_PAY", "GOOGLE_PAY"],
        },
      },
    });

    await this.prisma.paymentTransaction.create({
      data: {
        paymentId: payment.id,
        transactionType: "AUTHORIZE",
        gatewayTransactionId: paymentIntent.id,
        amount: totals.grandTotal,
        status: "REQUIRES_ACTION",
        rawResponse: paymentIntent as unknown as Prisma.InputJsonValue,
      },
    });

    if (userId) {
      const cart = await this.cartRepository.findByUserId(resolvedUserId);
      if (cart) {
        await this.cartRepository.clearItems(cart.id);
      }
    }

    await this.notificationService.notifyUser({
      userId: resolvedUserId,
      title: "Order received",
      body: `Your NOVAEX order ${order.orderNumber} is awaiting secure payment confirmation.`,
      email: user?.email ?? dto.guestEmail,
    });

    return {
      order: await this.toOrderSummary(order.id),
      payment: {
        id: payment.id,
        gateway: payment.gateway,
        status: payment.status,
        clientSecret: paymentIntent.client_secret,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? null,
        supportedGateways: ["STRIPE", "PAYPAL", "APPLE_PAY", "GOOGLE_PAY"],
      },
    };
  }

  async validateCoupon(userId: string, code: string, subtotal: number, shippingTotal: number) {
    return this.couponsService.validate(code, userId, subtotal, shippingTotal);
  }

  private async resolveLines(userId: string | undefined, guestItems?: CheckoutPreviewDto["guestItems"]) {
    if (guestItems?.length) {
      const variants = await this.checkoutRepository.getVariants(guestItems.map((item) => item.variantId));
      return guestItems
        .map((item) => {
          const variant = variants.find((entry) => entry.id === item.variantId);
          if (!variant) return null;
          const unitPrice = Number(variant.price);
          return {
            variantId: variant.id,
            productId: variant.productId,
            productName: variant.product.name,
            sku: variant.sku,
            unitPrice,
            quantity: item.quantity,
            lineTotal: Number((unitPrice * item.quantity).toFixed(2)),
            storeId: variant.product.storeId,
          } satisfies CheckoutLine;
        })
        .filter((line): line is CheckoutLine => Boolean(line));
    }

    if (!userId) {
      throw new BadRequestException("Cart items are required for guest checkout.");
    }

    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException("Your cart is empty.");
    }

    return cart.items.map((item) => {
      const unitPrice = Number(item.priceSnapshot);
      return {
        variantId: item.variantId,
        productId: item.variant.productId,
        productName: item.variant.product.name,
        sku: item.variant.sku,
        unitPrice,
        quantity: item.quantity,
        lineTotal: Number((unitPrice * item.quantity).toFixed(2)),
        storeId: item.variant.product.storeId,
      };
    });
  }

  private async calculateTotals(userId: string, lines: CheckoutLine[], dto: CheckoutPreviewDto) {
    if (lines.length === 0) {
      throw new BadRequestException("No valid checkout items were found.");
    }

    const subtotal = Number(lines.reduce((sum, line) => sum + line.lineTotal, 0).toFixed(2));
    const shippingMethod =
      (dto.shippingMethodId ? await this.checkoutRepository.getShippingMethod(dto.shippingMethodId) : null) ??
      (await this.checkoutRepository.getDefaultShippingMethod());

    if (!shippingMethod) {
      throw new NotFoundException("Shipping method not found.");
    }

    let shippingTotal = Number(shippingMethod.basePrice);
    if (subtotal >= 150) shippingTotal = 0;

    const taxRate = await this.checkoutRepository.getTaxRate();
    const taxMultiplier = taxRate ? Number(taxRate.rate) : 0.08875;
    let couponDiscount = 0;
    let shippingDiscount = 0;
    let coupon: { id: string; code: string } | undefined;
    let giftCard: { giftCardId: string; appliedAmount: number } | undefined;

    if (dto.couponCode && userId !== "guest") {
      const result = await this.couponsService.validate(dto.couponCode, userId, subtotal, shippingTotal);
      couponDiscount = result.discountAmount;
      shippingDiscount = result.shippingDiscount;
      shippingTotal = Math.max(0, shippingTotal - shippingDiscount);
      coupon = { id: result.coupon.id, code: result.coupon.code };
    }

    const taxableSubtotal = Math.max(0, subtotal - couponDiscount);
    const taxTotal = Number((taxableSubtotal * taxMultiplier).toFixed(2));
    let grandTotal = Number((taxableSubtotal + taxTotal + shippingTotal).toFixed(2));

    if (dto.giftCardCode) {
      const gift = await this.giftCardsService.validate(dto.giftCardCode, grandTotal);
      giftCard = { giftCardId: gift.giftCardId, appliedAmount: gift.appliedAmount };
      grandTotal = Number((grandTotal - gift.appliedAmount).toFixed(2));
    }

    return {
      lines,
      subtotal,
      taxTotal,
      shippingTotal,
      discountTotal: Number((couponDiscount + (giftCard?.appliedAmount ?? 0)).toFixed(2)),
      couponDiscount,
      grandTotal,
      coupon,
      giftCard,
      shippingMethodId: shippingMethod.id,
      shippingCarrier: shippingMethod.carrier,
      estimatedDeliveryDays: shippingMethod.serviceLevel.includes("priority") ? 2 : 5,
      aiSuggestions: [
        "NOVAEX Priority Air delivers in 2 business days for premium carts.",
        coupon ? "Coupon applied with AI confidence." : "Try NOVAEXVIP20 for launch savings.",
      ],
      crossSell: lines.slice(0, 2).map((line) => line.productName),
      upsell: lines[0] ? [`${lines[0].productName} protection plan`] : [],
    };
  }

  private async resolveGuestUser(email: string) {
    const existing = await this.checkoutRepository.getUserByEmail(email);
    if (existing) return existing.id;

    const created = await this.prisma.user.create({
      data: {
        email,
        passwordHash: await this.hashGuestPassword(email),
        status: "ACTIVE",
        profile: {
          create: {
            firstName: "NOVAEX",
            lastName: "Guest",
          },
        },
      },
    });
    return created.id;
  }

  private async hashGuestPassword(email: string) {
    const { randomBytes, scryptSync } = await import("crypto");
    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(`guest-${email}`, salt, 64).toString("hex");
    return `${salt}:${hash}`;
  }

  private async generateOrderNumber() {
    const count = await this.prisma.order.count();
    return `NX-${new Date().getFullYear()}-${String(count + 1).padStart(6, "0")}`;
  }

  private async toOrderSummary(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        payments: true,
        shipments: { include: { shippingMethod: true } },
        invoices: true,
      },
    });
    if (!order) throw new NotFoundException("Order not found.");

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      currencyCode: order.currencyCode,
      subtotal: Number(order.subtotal),
      taxTotal: Number(order.taxTotal),
      shippingTotal: Number(order.shippingTotal),
      discountTotal: Number(order.discountTotal),
      grandTotal: Number(order.grandTotal),
      items: order.items.map((item) => ({
        id: item.id,
        productName: item.productNameSnapshot,
        sku: item.skuSnapshot,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        lineTotal: Number(item.lineTotal),
      })),
      timeline: this.buildTimeline(order.status),
      estimatedDeliveryDays: (order.shipments[0]?.metadata as { estimatedDays?: number })?.estimatedDays ?? 5,
      invoiceNumber: order.invoices[0]?.invoiceNumber,
    };
  }

  private buildTimeline(status: string) {
    const steps = [
      { key: "PENDING_PAYMENT", label: "Payment pending" },
      { key: "CONFIRMED", label: "Order confirmed" },
      { key: "PROCESSING", label: "Preparing shipment" },
      { key: "SHIPPED", label: "Shipped" },
      { key: "DELIVERED", label: "Delivered" },
    ];
    const activeIndex = steps.findIndex((step) => step.key === status);
    return steps.map((step, index) => ({
      ...step,
      completed: activeIndex >= index,
      current: step.key === status,
    }));
  }
}
