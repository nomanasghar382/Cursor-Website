import { Module } from "@nestjs/common";
import { EmailsModule } from "../../emails/emails.module";
import { MailModule } from "../mail/mail.module";
import { GrowthAdminController } from "./controllers/growth-admin.controller";
import { GrowthPublicController } from "./controllers/growth-public.controller";
import { GrowthRepository } from "./repositories/growth.repository";
import { CmsService } from "./services/cms.service";
import { EmailEngagementService } from "./services/email-engagement.service";
import { GrowthAnalyticsService } from "./services/growth-analytics.service";
import { MarketingService } from "./services/marketing.service";
import { SeoService } from "./services/seo.service";

@Module({
  imports: [MailModule, EmailsModule],
  controllers: [GrowthPublicController, GrowthAdminController],
  providers: [
    GrowthRepository,
    CmsService,
    MarketingService,
    SeoService,
    GrowthAnalyticsService,
    EmailEngagementService,
  ],
  exports: [CmsService, MarketingService, SeoService, GrowthAnalyticsService, EmailEngagementService],
})
export class GrowthModule {}
