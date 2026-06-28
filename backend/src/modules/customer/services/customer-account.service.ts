import { Injectable } from "@nestjs/common";
import { UpdatePreferencesDto, UpdateSettingsDto } from "../dto/customer.dto";
import { CustomerRepository } from "../repositories/customer.repository";

@Injectable()
export class CustomerAccountService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async getNotifications(userId: string) {
    const notifications = await this.customerRepository.listNotifications(userId);
    return {
      notifications: notifications.map((entry) => ({
        id: entry.id,
        type: entry.type,
        channel: entry.channel,
        title: entry.title,
        body: entry.body,
        read: Boolean(entry.readAt),
        createdAt: entry.createdAt.toISOString(),
      })),
      unreadCount: notifications.filter((entry) => !entry.readAt).length,
    };
  }

  async markRead(userId: string, notificationId: string) {
    await this.customerRepository.markNotificationRead(userId, notificationId);
    return this.getNotifications(userId);
  }

  async getPreferences(userId: string) {
    const user = await this.customerRepository.getUserDashboardData(userId);
    const metadata = (user?.metadata ?? {}) as { preferences?: UpdatePreferencesDto };
    return {
      preferences: {
        emailOrderUpdates: true,
        emailPromotions: false,
        pushOrderUpdates: true,
        pushPromotions: false,
        smsAlerts: false,
        ...metadata.preferences,
      },
    };
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    await this.customerRepository.updateUserMetadata(userId, { preferences: dto });
    return this.getPreferences(userId);
  }

  async getSettings(userId: string) {
    const user = await this.customerRepository.getUserDashboardData(userId);
    const metadata = (user?.metadata ?? {}) as { settings?: UpdateSettingsDto };
    return {
      settings: {
        theme: "system",
        language: "en",
        currency: "USD",
        reducedMotion: false,
        marketingOptIn: true,
        ...metadata.settings,
      },
    };
  }

  async updateSettings(userId: string, dto: UpdateSettingsDto) {
    await this.customerRepository.updateUserMetadata(userId, { settings: dto });
    return this.getSettings(userId);
  }

  async getPayments(userId: string) {
    const [payments, invoices] = await Promise.all([
      this.customerRepository.listPayments(userId),
      this.customerRepository.listInvoices(userId),
    ]);

    return {
      savedMethods: [],
      architecture: ["STRIPE", "PAYPAL", "APPLE_PAY", "GOOGLE_PAY"],
      transactions: payments.map((payment) => ({
        id: payment.id,
        orderId: payment.orderId,
        orderNumber: payment.order.orderNumber,
        gateway: payment.gateway,
        status: payment.status,
        amount: Number(payment.amount),
        currencyCode: payment.currencyCode,
        createdAt: payment.createdAt.toISOString(),
      })),
      invoices: invoices.map((invoice) => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        orderId: invoice.orderId,
        orderNumber: invoice.order.orderNumber,
        issuedAt: invoice.issuedAt?.toISOString(),
        status: invoice.status,
      })),
      billingHistory: payments.map((payment) => ({
        id: payment.id,
        label: `Order ${payment.order.orderNumber}`,
        amount: Number(payment.amount),
        status: payment.status,
        date: payment.createdAt.toISOString(),
      })),
    };
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    await this.customerRepository.updateAvatar(userId, avatarUrl);
    return { avatarUrl };
  }

  async deleteAccount(userId: string) {
    await this.customerRepository.softDeleteAccount(userId);
    return { deleted: true };
  }
}
