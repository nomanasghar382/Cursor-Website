import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  VERSION_NEUTRAL,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { Public } from "../../../common/decorators/public.decorator";
import { AuthenticatedUser } from "../../../common/types/authenticated-user.type";
import { FileValidationPipe } from "../../../uploads/pipes/file-validation.pipe";
import { ConfigService } from "@nestjs/config";
import { AI_CONFIG_KEY } from "../ai.config";
import {
  AiChatDto,
  AiCompareDto,
  AiRecommendationsQueryDto,
  AiSearchClickDto,
  AiSearchDto,
  AiSearchSuggestionsDto,
  AiVoiceSearchDto,
} from "../dto/ai.dto";
import { AiAssistantService } from "../services/ai-assistant.service";
import { AiImageService } from "../services/ai-image.service";
import { AiRecommendationsService } from "../services/ai-recommendations.service";
import { AiSearchService } from "../services/ai-search.service";
import { AiVoiceService } from "../services/ai-voice.service";

@ApiTags("AI Commerce")
@Controller({ path: "ai", version: ["1", VERSION_NEUTRAL] })
export class AiController {
  constructor(
    private readonly assistantService: AiAssistantService,
    private readonly searchService: AiSearchService,
    private readonly recommendationsService: AiRecommendationsService,
    private readonly voiceService: AiVoiceService,
    private readonly imageService: AiImageService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Get("config")
  getConfig() {
    return {
      modelName: this.configService.get<string>(`${AI_CONFIG_KEY}.modelName`),
      modelVersion: this.configService.get<string>(`${AI_CONFIG_KEY}.modelVersion`),
      features: {
        chat: this.configService.get<boolean>(`${AI_CONFIG_KEY}.chatEnabled`),
        semanticSearch: this.configService.get<boolean>(`${AI_CONFIG_KEY}.semanticSearchEnabled`),
        voiceSearch: this.configService.get<boolean>(`${AI_CONFIG_KEY}.voiceSearchEnabled`),
        imageSearch: this.configService.get<boolean>(`${AI_CONFIG_KEY}.imageSearchEnabled`),
      },
      architecture: {
        assistant: ["product-discovery", "comparison", "order-guidance", "conversation-history"],
        search: ["semantic-ranking", "suggestions", "autocomplete", "analytics"],
        recommendations: ["personalized", "cart", "recently-viewed", "purchase-history", "cross-sell", "upsell"],
        voice: ["speech-to-text-ready", "voice-commands-ready"],
        image: ["upload", "label-analysis", "visual-matching"],
      },
    };
  }

  @Public()
  @Post("chat")
  chat(@CurrentUser() user: AuthenticatedUser | undefined, @Body() dto: AiChatDto) {
    return this.assistantService.chat(user?.id, dto);
  }

  @ApiBearerAuth()
  @Get("chat/sessions")
  listSessions(@CurrentUser() user: AuthenticatedUser) {
    return this.assistantService.listSessions(user.id);
  }

  @ApiBearerAuth()
  @Get("chat/sessions/:id")
  getSession(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.assistantService.getSession(user.id, id);
  }

  @Public()
  @Post("compare")
  compare(@Body() dto: AiCompareDto) {
    return this.assistantService.compareProducts(dto.productIds);
  }

  @Public()
  @Post("search")
  search(@CurrentUser() user: AuthenticatedUser | undefined, @Body() dto: AiSearchDto) {
    return this.searchService.search(user?.id, dto);
  }

  @Public()
  @Get("search/suggestions")
  suggestions(@Query() query: AiSearchSuggestionsDto) {
    return this.searchService.getSuggestions(query.q, query.limit);
  }

  @Public()
  @Get("search/popular")
  popular(@Query("limit") limit?: string) {
    return this.searchService.getPopularSearches(limit ? Number(limit) : 10);
  }

  @ApiBearerAuth()
  @Get("search/history")
  history(@CurrentUser() user: AuthenticatedUser) {
    return this.searchService.getSearchHistory(user.id);
  }

  @Public()
  @Post("search/click")
  searchClick(@CurrentUser() user: AuthenticatedUser | undefined, @Body() dto: AiSearchClickDto) {
    return this.searchService.recordClick(user?.id, dto.searchHistoryId, dto.productId);
  }

  @Public()
  @Get("search/analytics")
  searchAnalytics() {
    return this.searchService.getAnalytics();
  }

  @Public()
  @Get("recommendations")
  recommendations(@CurrentUser() user: AuthenticatedUser | undefined, @Query() query: AiRecommendationsQueryDto) {
    return this.recommendationsService.getRecommendations(user?.id, query);
  }

  @Public()
  @Post("voice/search")
  voiceSearch(@CurrentUser() user: AuthenticatedUser | undefined, @Body() dto: AiVoiceSearchDto) {
    return this.voiceService.search(user?.id, dto);
  }

  @Public()
  @ApiConsumes("multipart/form-data")
  @Post("image/search")
  @UseInterceptors(FileInterceptor("image"))
  imageSearch(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @UploadedFile(FileValidationPipe)
    file: Express.Multer.File,
  ) {
    return this.imageService.search(user?.id, file);
  }
}
