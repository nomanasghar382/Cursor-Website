import { MonitoringService } from "./monitoring.service";

describe("MonitoringService", () => {
  it("exposes monitoring architecture metadata", () => {
    const configService = { get: jest.fn().mockReturnValue("info") };
    const service = new MonitoringService(configService as never);
    const architecture = service.getArchitecture();

    expect(architecture.healthChecks.liveness).toContain("/health/live");
    expect(architecture.logging.format).toBe("json");
    expect(architecture.errorTracking.recommended.length).toBeGreaterThan(0);
  });
});
