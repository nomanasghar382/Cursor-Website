import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AI_CONFIG_KEY } from "../ai.config";
import { AiRepository } from "../repositories/ai.repository";

@Injectable()
export class AiUsageService {
  private readonly logger = new Logger(AiUsageService.name);

  constructor(
    private readonly aiRepository: AiRepository,
    private readonly configService: ConfigService,
  ) {}

  async track(
    eventName: string,
    input?: {
      userId?: string;
      productId?: string;
      sessionId?: string;
      properties?: Record<string, unknown>;
    },
  ) {
    try {
      await this.aiRepository.logUsage({
        userId: input?.userId,
        eventName,
        productId: input?.productId,
        sessionId: input?.sessionId,
        properties: {
          modelVersion: this.configService.get<string>(`${AI_CONFIG_KEY}.modelVersion`),
          ...input?.properties,
        },
      });
    } catch (error) {
      this.logger.warn(`Failed to track AI usage event ${eventName}: ${(error as Error).message}`);
    }
  }

  estimateTokens(text: string) {
    return Math.max(1, Math.ceil(text.length / 4));
  }
}
