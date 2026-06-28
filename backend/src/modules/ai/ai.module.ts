import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import aiConfig from "./ai.config";
import { AiController } from "./controllers/ai.controller";
import { AiRepository } from "./repositories/ai.repository";
import { AiAssistantService } from "./services/ai-assistant.service";
import { AiImageService } from "./services/ai-image.service";
import { AiRecommendationsService } from "./services/ai-recommendations.service";
import { AiSearchService } from "./services/ai-search.service";
import { AiUsageService } from "./services/ai-usage.service";
import { AiVoiceService } from "./services/ai-voice.service";
import { ProductsModule } from "../products/products.module";
import { CartModule } from "../cart/cart.module";
import { StorageModule } from "../storage/storage.module";

@Module({
  imports: [ConfigModule.forFeature(aiConfig), ProductsModule, CartModule, StorageModule],
  controllers: [AiController],
  providers: [
    AiRepository,
    AiUsageService,
    AiSearchService,
    AiAssistantService,
    AiRecommendationsService,
    AiVoiceService,
    AiImageService,
  ],
  exports: [AiSearchService, AiRecommendationsService, AiAssistantService],
})
export class AiModule {}
