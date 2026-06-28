import { Body, Controller, NotFoundException, Post, VERSION_NEUTRAL } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import { IsString, MinLength } from "class-validator";
import { Public } from "../../../common/decorators/public.decorator";
import { PaymentFulfillmentService } from "../services/payment-fulfillment.service";

class SimulatePaymentDto {
  @IsString()
  @MinLength(8)
  paymentIntentId!: string;

  @IsString()
  @MinLength(8)
  orderId!: string;
}

@ApiTags("Payments")
@Controller({ path: "payments/test", version: ["1", VERSION_NEUTRAL] })
export class TestPaymentsController {
  constructor(
    private readonly configService: ConfigService,
    private readonly paymentFulfillmentService: PaymentFulfillmentService,
  ) {}

  private assertEnabled() {
    const enabled =
      this.configService.get<string>("app.nodeEnv") === "test" &&
      this.configService.get<boolean>("stripe.enableTestSimulation") === true;

    if (!enabled) {
      throw new NotFoundException();
    }
  }

  @Public()
  @Post("simulate-succeeded")
  async simulateSucceeded(@Body() dto: SimulatePaymentDto) {
    this.assertEnabled();
    return this.paymentFulfillmentService.handleStripePaymentSucceeded(dto.paymentIntentId, dto.orderId);
  }

  @Public()
  @Post("simulate-failed")
  async simulateFailed(@Body() dto: Pick<SimulatePaymentDto, "paymentIntentId">) {
    this.assertEnabled();
    await this.paymentFulfillmentService.handleStripePaymentFailed(dto.paymentIntentId);
    return { handled: true };
  }
}
