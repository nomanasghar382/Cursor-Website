import { INestApplication, ValidationPipe, VersioningType } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import compression from "compression";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { AppModule } from "../../src/app.module";
import { applyTestEnvironment } from "../test-env";

export async function createIntegrationApp(): Promise<INestApplication> {
  applyTestEnvironment();

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication({ rawBody: true });
  const configService = app.get(ConfigService);

  app.setGlobalPrefix(configService.getOrThrow<string>("app.globalPrefix"));
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
      hsts: false,
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

  await app.init();
  return app;
}

export function apiPath(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `/api/v1${normalized}`;
}
