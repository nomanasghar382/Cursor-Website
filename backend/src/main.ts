import "reflect-metadata";
import { Logger, ValidationPipe, VersioningType } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import compression from "compression";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configService = app.get(ConfigService);
  const logger = new Logger("Bootstrap");

  app.useLogger(logger);
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
      contentSecurityPolicy: configService.get<string>("app.nodeEnv") === "production" ? undefined : false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
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

  await app.listen(configService.getOrThrow<number>("app.port"), "0.0.0.0");
  logger.log(`NOVAEX API listening on ${await app.getUrl()}`);
}

void bootstrap();
