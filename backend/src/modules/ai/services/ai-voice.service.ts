import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AI_CONFIG_KEY } from "../ai.config";
import { AiVoiceSearchDto } from "../dto/ai.dto";
import { AiRepository } from "../repositories/ai.repository";
import { AiUsageService } from "./ai-usage.service";
import { AiSearchService } from "./ai-search.service";

@Injectable()
export class AiVoiceService {
  constructor(
    private readonly aiRepository: AiRepository,
    private readonly aiSearchService: AiSearchService,
    private readonly aiUsageService: AiUsageService,
    private readonly configService: ConfigService,
  ) {}

  async search(userId: string | undefined, dto: AiVoiceSearchDto) {
    if (!this.configService.get<boolean>(`${AI_CONFIG_KEY}.voiceSearchEnabled`)) {
      throw new ServiceUnavailableException("Voice search is currently disabled.");
    }

    const audioAssetUrl = dto.audioAssetUrl ?? `transcript://${Date.now()}`;
    const voiceRecord = await this.aiRepository.recordVoiceSearch({
      userId,
      audioAssetUrl,
      transcript: dto.transcript,
      confidence: dto.confidence,
      metadata: { language: dto.language ?? "en-US", architecture: "client-stt-ready" },
    });

    const search = await this.aiSearchService.search(userId, {
      query: dto.transcript,
      limit: 12,
    });

    await this.aiUsageService.track("ai.voice.search", {
      userId,
      properties: { voiceSearchId: voiceRecord.id, transcriptLength: dto.transcript.length },
    });

    return {
      voiceSearchId: voiceRecord.id,
      transcript: dto.transcript,
      confidence: dto.confidence,
      architecture: {
        speechToText: "Client-side Web Speech API with server-side transcript processing",
        commandRouting: ["search", "add-to-cart-ready", "navigate-ready"],
      },
      ...search,
    };
  }
}
