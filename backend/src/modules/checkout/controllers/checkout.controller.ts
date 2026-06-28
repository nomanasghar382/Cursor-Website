import { BadRequestException, Body, Controller, Get, Post, VERSION_NEUTRAL } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Public } from "../../../common/decorators/public.decorator";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../../../common/types/authenticated-user.type";
import { CheckoutCreateDto, CheckoutPreviewDto, ValidateCouponDto } from "../dto/checkout.dto";
import { CheckoutService } from "../services/checkout.service";

@ApiTags("Checkout")
@Controller({ path: "checkout", version: ["1", VERSION_NEUTRAL] })
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Get("shipping-methods")
  @Public()
  getShippingMethods() {
    return this.checkoutService.getShippingMethods();
  }

  @Post("preview")
  preview(@CurrentUser() user: AuthenticatedUser, @Body() dto: CheckoutPreviewDto) {
    return this.checkoutService.preview(user.id, dto);
  }

  @Public()
  @Post("preview/guest")
  previewGuest(@Body() dto: CheckoutPreviewDto) {
    return this.checkoutService.preview(undefined, dto);
  }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CheckoutCreateDto) {
    return this.checkoutService.create(user.id, dto);
  }

  @Public()
  @Post("guest")
  createGuest(@Body() dto: CheckoutCreateDto) {
    if (!dto.guestEmail) {
      throw new BadRequestException("Guest email is required.");
    }
    return this.checkoutService.create(undefined, dto);
  }

  @Post("validate-coupon")
  validateCoupon(@CurrentUser() user: AuthenticatedUser, @Body() dto: ValidateCouponDto) {
    return this.checkoutService.validateCoupon(user.id, dto.code, 0, 19.95);
  }
}
