import { isAllowedCorsOrigin, mergeWebOrigins } from "./cors.util";

describe("cors.util", () => {
  it("allows configured origins and vercel preview hosts", () => {
    expect(isAllowedCorsOrigin("https://cursor-website.vercel.app", ["http://localhost:3000"])).toBe(true);
    expect(isAllowedCorsOrigin("https://example.com", ["https://example.com"])).toBe(true);
    expect(isAllowedCorsOrigin("https://example.com", ["http://localhost:3000"])).toBe(false);
  });

  it("merges frontend url into web origins", () => {
    expect(mergeWebOrigins(["http://localhost:3000"], "https://cursor-website.vercel.app")).toEqual([
      "http://localhost:3000",
      "https://cursor-website.vercel.app",
    ]);
  });
});
