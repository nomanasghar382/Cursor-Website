import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import configuration from "./config/configuration";
import { validateEnvironment } from "./config/environment.schema";
import { AppController } from "./app.controller";
import { RequestContextMiddleware } from "./common/middlewares/request-context.middleware";
import { CsrfMiddleware } from "./common/middlewares/csrf.middleware";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { ResponseWrapperInterceptor } from "./common/interceptors/response-wrapper.interceptor";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";
import { PermissionsGuard } from "./common/guards/permissions.guard";
import { DatabaseModule } from "./database/database.module";
import { RedisModule } from "./shared/redis/redis.module";
import { AppCacheModule } from "./shared/cache/cache.module";
import { QueueModule } from "./queues/queue.module";
import { LogsModule } from "./logs/logs.module";
import { SecurityModule } from "./modules/security/security.module";
import { AuthModule } from "./modules/auth/auth.module";
import { AuthorizationModule } from "./modules/authorization/authorization.module";
import { SessionModule } from "./modules/session/session.module";
import { AuthContextMiddleware } from "./common/middlewares/auth-context.middleware";
import { ProductsModule } from "./modules/products/products.module";
import { CartModule } from "./modules/cart/cart.module";
import { WishlistModule } from "./modules/wishlist/wishlist.module";
import { CheckoutModule } from "./modules/checkout/checkout.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { CustomerModule } from "./modules/customer/customer.module";
import { AdminModule } from "./modules/admin/admin.module";
import { VendorModule } from "./modules/vendor/vendor.module";
import { AiModule } from "./modules/ai/ai.module";
import { FulfillmentModule } from "./modules/fulfillment/fulfillment.module";
import { CouponsModule } from "./modules/coupons/coupons.module";
import { AuditModule } from "./modules/audit/audit.module";
import { StorageModule } from "./modules/storage/storage.module";
import { MailModule } from "./modules/mail/mail.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { UploadsModule } from "./uploads/uploads.module";
import { HealthModule } from "./health/health.module";
import { WebsocketModule } from "./websocket/websocket.module";
import { CronModule } from "./cron/cron.module";
import { EventsModule } from "./events/events.module";
import { EmailsModule } from "./emails/emails.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV ?? "development"}`, ".env"],
      validate: validateEnvironment,
      load: [() => configuration(validateEnvironment(process.env))],
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.getOrThrow<number>("security.rateLimitTtlMs"),
            limit: configService.getOrThrow<number>("security.rateLimitMax"),
          },
        ],
      }),
    }),
    ScheduleModule.forRoot(),
    LogsModule,
    DatabaseModule,
    RedisModule,
    AppCacheModule,
    QueueModule,
    SecurityModule,
    AuthModule,
    SessionModule,
    AuthorizationModule,
    ProductsModule,
    CartModule,
    WishlistModule,
    CouponsModule,
    CheckoutModule,
    OrdersModule,
    CustomerModule,
    AdminModule,
    VendorModule,
    AiModule,
    FulfillmentModule,
    AuditModule,
    StorageModule,
    MailModule,
    NotificationsModule,
    PaymentsModule,
    UploadsModule,
    HealthModule,
    WebsocketModule,
    CronModule,
    EventsModule,
    EmailsModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseWrapperInterceptor },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestContextMiddleware, AuthContextMiddleware, CsrfMiddleware).forRoutes("*");
  }
}
