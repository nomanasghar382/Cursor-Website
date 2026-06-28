import { generateSecureToken, hashSecret, secureCompare } from "./crypto.util";

describe("crypto.util", () => {
  it("hashes secrets deterministically", () => {
    expect(hashSecret("novaex")).toBe(hashSecret("novaex"));
    expect(hashSecret("novaex")).not.toBe(hashSecret("other"));
  });

  it("generates unique secure tokens", () => {
    const first = generateSecureToken();
    const second = generateSecureToken();
    expect(first).not.toBe(second);
    expect(first.length).toBeGreaterThan(20);
  });

  it("compares secrets in constant time", () => {
    expect(secureCompare("abc", "abc")).toBe(true);
    expect(secureCompare("abc", "abd")).toBe(false);
    expect(secureCompare("abc", "abcd")).toBe(false);
  });
});
