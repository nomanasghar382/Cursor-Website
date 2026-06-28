import { Injectable } from "@nestjs/common";
import { EmailTemplateService } from "../../../emails/email-template.service";
import { MailService } from "../../mail/services/mail.service";
import { SendMarketingEmailDto } from "../dto/growth.dto";

type EmailTemplateKey = "welcome" | "abandoned_cart" | "product_recommendation" | "campaign" | "newsletter";

@Injectable()
export class EmailEngagementService {
  constructor(
    private readonly mailService: MailService,
    private readonly emailTemplateService: EmailTemplateService,
  ) {}

  getEmailArchitecture() {
    return {
      templates: [
        { key: "welcome", label: "Welcome email", trigger: "user.registered" },
        { key: "newsletter", label: "Newsletter confirmation", trigger: "newsletter.subscribed" },
        { key: "abandoned_cart", label: "Abandoned cart recovery", trigger: "cart.abandoned" },
        { key: "product_recommendation", label: "Product recommendations", trigger: "recommendation.batch" },
        { key: "campaign", label: "Marketing campaign blast", trigger: "campaign.scheduled" },
      ],
      analytics: ["open_rate", "click_rate", "conversion_rate", "unsubscribe_rate"],
      queueIntegration: "EventsModule + MailModule",
    };
  }

  async sendMarketingEmail(dto: SendMarketingEmailDto) {
    const content = this.resolveTemplate(dto.template as EmailTemplateKey, dto.metadata);
    await this.mailService.sendEmail({
      to: dto.to,
      subject: content.subject,
      html: this.emailTemplateService.renderTransactional({
        title: content.title,
        body: content.body,
        ctaLabel: content.ctaLabel,
        ctaUrl: content.ctaUrl,
      }),
    });
    return { sent: true, template: dto.template };
  }

  async sendWelcomeEmail(to: string, name?: string) {
    return this.sendMarketingEmail({
      template: "welcome",
      to,
      metadata: { name: name ?? "there" },
    });
  }

  async sendNewsletterConfirmation(to: string) {
    return this.sendMarketingEmail({
      template: "newsletter",
      to,
    });
  }

  async sendAbandonedCartEmail(to: string, metadata?: Record<string, unknown>) {
    return this.sendMarketingEmail({
      template: "abandoned_cart",
      to,
      metadata,
    });
  }

  async sendProductRecommendationEmail(to: string, metadata?: Record<string, unknown>) {
    return this.sendMarketingEmail({
      template: "product_recommendation",
      to,
      metadata,
    });
  }

  private resolveTemplate(template: EmailTemplateKey, metadata?: Record<string, unknown>) {
    const name = String(metadata?.name ?? "there");
    const productName = String(metadata?.productName ?? "your next favorite product");
    const campaignName = String(metadata?.campaignName ?? "NOVAEX campaign");

    switch (template) {
      case "welcome":
        return {
          subject: "Welcome to NOVAEX",
          title: `Welcome, ${name}`,
          body: "Your account is ready. Explore AI-native commerce curated for premium buyers.",
          ctaLabel: "Start shopping",
          ctaUrl: "/products",
        };
      case "newsletter":
        return {
          subject: "You're subscribed to NOVAEX updates",
          title: "Thanks for subscribing",
          body: "You'll receive product launches, collection drops, and enterprise insights.",
          ctaLabel: "Browse catalog",
          ctaUrl: "/products",
        };
      case "abandoned_cart":
        return {
          subject: "Your cart is waiting",
          title: "Complete your purchase",
          body: "Items in your cart are still available. Return now to secure your order.",
          ctaLabel: "Return to cart",
          ctaUrl: "/cart",
        };
      case "product_recommendation":
        return {
          subject: `Recommended for you: ${productName}`,
          title: "Curated for you by NovaAI",
          body: `We think you'll love ${productName}. Discover more personalized picks inside NOVAEX.`,
          ctaLabel: "View recommendation",
          ctaUrl: String(metadata?.productUrl ?? "/products"),
        };
      case "campaign":
        return {
          subject: `${campaignName} is live`,
          title: campaignName,
          body: String(metadata?.body ?? "A new promotion is available for a limited time."),
          ctaLabel: "Shop the campaign",
          ctaUrl: String(metadata?.campaignUrl ?? "/products"),
        };
      default:
        return {
          subject: "NOVAEX update",
          title: "NOVAEX",
          body: "Thanks for being part of NOVAEX.",
        };
    }
  }
}
