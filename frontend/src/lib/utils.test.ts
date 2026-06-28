import { cn, formatCurrency } from "./utils";

describe("utils", () => {
  it("merges class names with tailwind precedence", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-sm", false && "hidden", "font-medium")).toBe("text-sm font-medium");
  });

  it("formats currency for USD by default", () => {
    expect(formatCurrency(1299)).toBe("$1,299");
    expect(formatCurrency(0)).toBe("$0");
  });
});
