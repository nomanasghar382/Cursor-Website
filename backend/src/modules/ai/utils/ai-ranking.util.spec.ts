import { rankProductsByQuery, scoreLabelImageMatch } from "./ai-ranking.util";

describe("rankProductsByQuery", () => {
  const products = [
    {
      id: "1",
      name: "Nova Smart Hub",
      description: "AI-powered home automation hub",
      aiScore: 92,
      brand: "Nova",
      category: "Smart Home",
      price: 299,
      rating: 4.8,
      stock: 12,
    },
    {
      id: "2",
      name: "Pulse Headphones",
      description: "Wireless immersive audio",
      aiScore: 81,
      brand: "Pulse",
      category: "Audio",
      price: 199,
      rating: 4.2,
      stock: 0,
    },
  ];

  it("ranks products with higher token overlap first", () => {
    const ranked = rankProductsByQuery(products, "smart home hub");
    expect(ranked[0]?.id).toBe("1");
    expect(ranked[0]?.matchReasons.some((reason) => reason.startsWith("Matched:"))).toBe(true);
  });

  it("falls back to AI score when query is empty", () => {
    const ranked = rankProductsByQuery(products, "   ");
    expect(ranked[0]?.matchReasons).toContain("AI catalog confidence");
  });

  it("scores label image matches proportionally", () => {
    const score = scoreLabelImageMatch(["smart hub", "automation"], ["smart", "hub"]);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
