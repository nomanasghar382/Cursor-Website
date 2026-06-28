import { Module } from "@nestjs/common";
import { CouponsRepository, CouponsService } from "./services/coupons.service";
import { GiftCardsService } from "./services/gift-cards.service";

@Module({
  providers: [CouponsRepository, CouponsService, GiftCardsService],
  exports: [CouponsService, GiftCardsService],
})
export class CouponsModule {}
