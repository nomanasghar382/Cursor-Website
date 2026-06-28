import { afterEach, describe, expect, it, vi } from "vitest";
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
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("unwraps successful API responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: { ok: true } }),
      }),
    );

    const { apiRequest } = await import("./client");
    await expect(apiRequest("health")).resolves.toEqual({ ok: true });
  });

  it("throws ApiError for failed responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ message: "Invalid input" }),
      }),
    );

    const { apiRequest } = await import("./client");
    await expect(apiRequest("products")).rejects.toMatchObject({
      name: "ApiError",
      status: 400,
      message: "Invalid input",
    });
  });
});
