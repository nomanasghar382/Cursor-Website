import "reflect-metadata";
import { Logger, LogLevel, ValidationPipe, VersioningType } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import compression from "compression";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { AppModule } from "./app.module";

function resolveLogLevels(level: string): LogLevel[] {
  const map: Record<string, LogLevel[]> = {
    error: ["error"],
    warn: ["error", "warn"],
    log: ["error", "warn", "log"],
    info: ["error", "warn", "log"],
    debug: ["error", "warn", "log", "debug"],
    verbose: ["error", "warn", "log", "debug", "verbose"],
  };
  return map[level] ?? map.log;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true, rawBody: true });
  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>("app.nodeEnv", "development");
  const isProduction = nodeEnv === "production";
  const logger = new Logger("Bootstrap");

  app.useLogger(resolveLogLevels(configService.get<string>("app.logLevel", "info")));
  app.enableShutdownHooks();
  app.setGlobalPrefix(configService.getOrThrow<string>("app.globalPrefix"));
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });
  app.enableCors({
    origin: configService.getOrThrow<string[]>("app.webOrigins"),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "x-request-id", "x-csrf-token"],
  });
  app.use(
    helmet({
      contentSecurityPolicy: isProduction ? undefined : false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
      hsts: isProduction ? { maxAge: 31_536_000, includeSubDomains: true, preload: true } : false,
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      frameguard: { action: "deny" },
      noSniff: true,
    }),
  );
  app.use(compression());
  app.use(cookieParser(configService.getOrThrow<string>("auth.cookieSecret")));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  if (!isProduction) {
    const openApi = new DocumentBuilder()
      .setTitle("NOVAEX Enterprise API")
      .setDescription("AI powered enterprise ecommerce backend APIs.")
      .setVersion("1.0.0")
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, openApi);
    SwaggerModule.setup(`${configService.getOrThrow<string>("app.globalPrefix")}/docs`, app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  await app.listen(configService.getOrThrow<number>("app.port"), "0.0.0.0");
  logger.log(`NOVAEX API listening on ${await app.getUrl()}`);
}

void bootstrap();
