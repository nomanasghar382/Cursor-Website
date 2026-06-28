import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MonitoringService {
  constructor(private readonly configService: ConfigService) {}

  getArchitecture() {
    return {
      logging: {
        provider: "nestjs-logger",
        format: "json",
        fields: ["requestId", "method", "path", "statusCode", "durationMs", "ip", "userAgent"],
        level: this.configService.get<string>("app.logLevel", "info"),
      },
      errorTracking: {
        recommended: ["Sentry", "Datadog", "OpenTelemetry"],
        current: "GlobalExceptionFilter + structured request logs",
      },
      performanceMonitoring: {
        recommended: ["Prometheus", "Grafana", "New Relic"],
        current: "LoggingInterceptor durationMs",
      },
      healthChecks: {
        liveness: "/api/v1/health/live",
        readiness: "/api/v1/health/ready",
        aggregate: "/api/v1/health",
      },
      databaseMonitoring: {
        recommended: ["pg_stat_statements", "Prisma metrics"],
        current: "readiness probe SELECT 1",
      },
      apiMonitoring: {
        recommended: ["reverse-proxy access logs", "APM tracing"],
        current: "audit queue + analytics events",
      },
      alerts: {
        recommended: ["PagerDuty", "Slack webhooks", "CloudWatch alarms"],
        triggers: ["readiness degraded", "error rate spike", "queue backlog"],
      },
    };
  }
}
