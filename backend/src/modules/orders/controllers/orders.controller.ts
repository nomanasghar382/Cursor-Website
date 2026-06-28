import { Body, Controller, Get, Param, Post, Query, VERSION_NEUTRAL } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../../../common/types/authenticated-user.type";
import { CreateReviewDto, ReturnRequestDto } from "../../customer/dto/customer.dto";
import { OrderListQueryDto, RefundRequestDto } from "../../fulfillment/dto/fulfillment.dto";
import { OrdersService } from "../services/orders.service";

@ApiTags("Orders")
@Controller({ path: "orders", version: ["1", VERSION_NEUTRAL] })
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser, @Query() query: OrderListQueryDto) {
    return this.ordersService.list(user.id, query);
  }

  @Get(":id")
  getById(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.ordersService.getById(user.id, id);
  }

  @Get(":id/track")
  track(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.ordersService.track(user.id, id);
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

  @Post(":id/refund-request")
  requestRefund(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string, @Body() dto: RefundRequestDto) {
    return this.ordersService.requestRefund(user.id, id, dto.reason);
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
  retryPayment(@CurrentUser() user: AuthenticatedUser, @Param("id") orderId: string) {
    return this.ordersService.retryPayment(user.id, orderId);
  }
}
