import { Body, Controller, Get, NotFoundException, Param, Post, Query, VERSION_NEUTRAL } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { Public } from "../../../common/decorators/public.decorator";
import { AuthenticatedUser } from "../../../common/types/authenticated-user.type";
import { ConfirmPaymentDto, OrderListQueryDto, RefundRequestDto } from "../dto/fulfillment.dto";
import { InvoiceFulfillmentService } from "../services/invoice-fulfillment.service";
import { OrderLifecycleService } from "../services/order-lifecycle.service";
import { PaymentFulfillmentService } from "../services/payment-fulfillment.service";
import { ShippingFulfillmentService } from "../services/shipping-fulfillment.service";
import { FulfillmentRepository } from "../repositories/fulfillment.repository";

@ApiTags("Fulfillment")
@Controller({ path: "fulfillment", version: ["1", VERSION_NEUTRAL] })
export class FulfillmentController {
  constructor(
    private readonly lifecycleService: OrderLifecycleService,
    private readonly paymentService: PaymentFulfillmentService,
    private readonly shippingService: ShippingFulfillmentService,
    private readonly invoiceService: InvoiceFulfillmentService,
    private readonly fulfillmentRepository: FulfillmentRepository,
  ) {}

  @Public()
  @Get("shipping")
  getShippingCatalog() {
    return this.shippingService.getShippingCatalog();
  }

  @ApiBearerAuth()
  @Get("orders")
  listOrders(@CurrentUser() user: AuthenticatedUser, @Query() query: OrderListQueryDto) {
    return this.fulfillmentRepository.listOrdersForUser(user.id, query).then(([orders, total]) => ({
      orders: orders.map((order) => this.lifecycleService.mapOrder(order)),
      total,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      hasMore: (query.page ?? 1) * (query.limit ?? 20) < total,
    }));
  }

  @ApiBearerAuth()
  @Get("orders/:id/track")
  trackOrder(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.fulfillmentRepository.findOrderForUser(user.id, id).then((order) => {
      if (!order) throw new NotFoundException("Order not found.");
      const mapped = this.lifecycleService.mapOrder(order);
      return {
        tracking: {
          orderNumber: mapped.orderNumber,
          status: mapped.status,
          timeline: mapped.timeline,
          shipments: mapped.shipments,
          estimatedDeliveryDays: mapped.estimatedDeliveryDays,
        },
      };
    });
  }

  @ApiBearerAuth()
  @Get("orders/:id/invoice")
  getInvoice(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.invoiceService.getInvoice(id, user.id);
  }

  @ApiBearerAuth()
  @Post("orders/:id/refund-request")
  requestRefund(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string, @Body() dto: RefundRequestDto) {
    return this.lifecycleService.addNote(id, `Refund requested: ${dto.reason}`, user.email);
  }

  @ApiBearerAuth()
  @Post("payments/confirm")
  confirmPayment(@Body() dto: ConfirmPaymentDto) {
    return this.paymentService.confirmPayment(dto.paymentIntentId);
  }
}
