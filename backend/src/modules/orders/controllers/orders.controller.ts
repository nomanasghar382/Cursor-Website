import { Body, Controller, Get, NotFoundException, Param, Post, VERSION_NEUTRAL } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../../../common/types/authenticated-user.type";
import { CreateReviewDto, ReturnRequestDto } from "../../customer/dto/customer.dto";
import { StripeService } from "../../payments/services/stripe.service";
import { PrismaService } from "../../../database/prisma.service";
import { OrdersService } from "../services/orders.service";

@ApiTags("Orders")
@Controller({ path: "orders", version: ["1", VERSION_NEUTRAL] })
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.ordersService.list(user.id);
  }

  @Get(":id")
  getById(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.ordersService.getById(user.id, id);
  }

  @Get(":id/invoice")
  getInvoice(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.ordersService.getInvoice(user.id, id);
  }

  @Post(":id/cancel")
  cancel(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.ordersService.cancel(user.id, id);
  }

  @Post(":id/return")
  requestReturn(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string, @Body() dto: ReturnRequestDto) {
    return this.ordersService.requestReturn(user.id, id, dto);
  }

  @Post(":id/reorder")
  reorder(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.ordersService.reorder(user.id, id);
  }

  @Post(":id/items/:itemId/review")
  review(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Param("itemId") itemId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.ordersService.createReview(user.id, id, itemId, dto);
  }

  @Post(":id/retry-payment")
  async retryPayment(@CurrentUser() user: AuthenticatedUser, @Param("id") orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId: user.id },
      include: { payments: true, user: true },
    });
    if (!order) throw new NotFoundException("Order not found.");

    const payment = order.payments[0];
    if (!payment || payment.status === "CAPTURED") {
      throw new NotFoundException("No retryable payment found.");
    }

    const paymentIntent = await this.stripeService.createPaymentIntent({
      amountCents: Math.round(Number(order.grandTotal) * 100),
      currency: order.currencyCode,
      orderId: order.id,
      customerEmail: order.user.email,
    });

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        gatewayPaymentId: paymentIntent.id,
        status: "REQUIRES_ACTION",
        metadata: { clientSecret: paymentIntent.client_secret },
      },
    });

    return {
      payment: {
        id: payment.id,
        clientSecret: paymentIntent.client_secret,
        status: "REQUIRES_ACTION",
      },
    };
  }
}
