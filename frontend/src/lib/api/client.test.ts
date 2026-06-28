import { ApiError } from "@/types/api";
import { getApiErrorMessage, isApiError, isRateLimitError, isUnauthorizedError } from "./errors";

describe("api errors", () => {
  it("detects ApiError instances", () => {
    const error = new ApiError("Unauthorized", 401);
    expect(isApiError(error)).toBe(true);
    expect(getApiErrorMessage(error)).toBe("Unauthorized");
    expect(isUnauthorizedError(error)).toBe(true);
    expect(isRateLimitError(error)).toBe(false);
  });

  it("falls back for unknown errors", () => {
    expect(getApiErrorMessage(new Error("boom"))).toBe("boom");
    expect(getApiErrorMessage("nope", "fallback")).toBe("fallback");
  });
});

describe("apiRequest", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetModules();
  });

  it("unwraps successful API responses", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { ok: true } }),
    }) as typeof fetch;

    const { apiRequest } = await import("./client");
    await expect(apiRequest("health")).resolves.toEqual({ ok: true });
  });

  it("throws ApiError for failed responses", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: "Invalid input" }),
    }) as typeof fetch;

    const { apiRequest } = await import("./client");
    await expect(apiRequest("products")).rejects.toMatchObject({
      name: "ApiError",
      status: 400,
      message: "Invalid input",
    });
  });
});
