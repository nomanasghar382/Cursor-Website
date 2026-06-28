import { Body, Controller, Get, Param, Patch, Post, Query, VERSION_NEUTRAL } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../../../common/types/authenticated-user.type";
import {
  AddOrderNoteDto,
  FulfillmentAnalyticsQueryDto,
  OrderListQueryDto,
  ProcessRefundDto,
  UpdateOrderStatusAdminDto,
  UpdateShipmentDto,
} from "../dto/fulfillment.dto";
import { FulfillmentRepository } from "../repositories/fulfillment.repository";
import { InvoiceFulfillmentService } from "../services/invoice-fulfillment.service";
import { OrderLifecycleService } from "../services/order-lifecycle.service";
import { PaymentFulfillmentService } from "../services/payment-fulfillment.service";
import { ShippingFulfillmentService } from "../services/shipping-fulfillment.service";

@ApiTags("Fulfillment Admin")
@ApiBearerAuth()
@Controller({ path: "admin/fulfillment", version: ["1", VERSION_NEUTRAL] })
export class FulfillmentAdminController {
  constructor(
    private readonly lifecycleService: OrderLifecycleService,
    private readonly paymentService: PaymentFulfillmentService,
    private readonly shippingService: ShippingFulfillmentService,
    private readonly invoiceService: InvoiceFulfillmentService,
    private readonly fulfillmentRepository: FulfillmentRepository,
  ) {}

  @Get("orders")
  @Permissions("orders:read")
  listOrders(@Query() query: OrderListQueryDto) {
    return this.fulfillmentRepository.listOrdersAdmin(query).then(([orders, total]) => ({
      orders: orders.map((order) => this.lifecycleService.mapOrder(order)),
      total,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    }));
  }

  @Get("orders/:id")
  @Permissions("orders:read")
  getOrder(@Param("id") id: string) {
    return this.fulfillmentRepository.findOrderById(id).then((order) => {
      if (!order) return { order: null };
      return { order: this.lifecycleService.mapOrder(order) };
    });
  }

  @Patch("orders/:id/status")
  @Permissions("orders:write")
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdateOrderStatusAdminDto,
  ) {
    return this.lifecycleService.transitionOrder(id, dto.status, dto.note, user.email);
  }

  @Post("orders/:id/notes")
  @Permissions("orders:write")
  addNote(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string, @Body() dto: AddOrderNoteDto) {
    return this.lifecycleService.addNote(id, dto.note, user.email);
  }

  @Post("orders/:id/refund")
  @Permissions("orders:write")
  refund(@Param("id") id: string, @Body() dto: ProcessRefundDto) {
    return this.paymentService.processRefund(id, dto);
  }

  @Get("payments")
  @Permissions("orders:read")
  listPayments(@Query() query: OrderListQueryDto) {
    return this.paymentService.listPayments(query);
  }

  @Get("shipments")
  @Permissions("orders:read")
  listShipments(@Query() query: OrderListQueryDto) {
    return this.shippingService.listShipments(query);
  }

  @Patch("shipments/:id")
  @Permissions("orders:write")
  updateShipment(@Param("id") id: string, @Body() dto: UpdateShipmentDto) {
    return this.shippingService.updateShipment(id, dto);
  }

  @Get("orders/:id/invoice")
  @Permissions("orders:read")
  getInvoice(@Param("id") id: string) {
    return this.invoiceService.getInvoice(id);
  }

  @Get("analytics")
  @Permissions("orders:read")
  analytics(@Query() query: FulfillmentAnalyticsQueryDto) {
    return this.fulfillmentRepository.getFulfillmentAnalytics(query.days ?? 30).then(([orders, payments, shipments, refunds]) => ({
      orders: orders.map((entry) => ({ status: entry.status, count: entry._count })),
      payments: payments.map((entry) => ({
        status: entry.status,
        count: entry._count,
        amount: Number(entry._sum.amount ?? 0),
      })),
      shipments: shipments.map((entry) => ({ status: entry.status, count: entry._count })),
      refunds: {
        count: refunds._count,
        amount: Number(refunds._sum.amount ?? 0),
      },
    }));
  }
}
