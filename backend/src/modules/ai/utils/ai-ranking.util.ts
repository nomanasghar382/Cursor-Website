import { tokenizeQuery } from "./ai-intent.util";

type RankableProduct = {
  id: string;
  name: string;
  description: string;
  aiScore: number | string;
  brand?: string | null;
  category?: string;
  price?: number;
  rating?: number;
  stock?: number;
};

export type RankedProduct<T extends RankableProduct> = T & {
  relevanceScore: number;
  matchReasons: string[];
};

export function rankProductsByQuery<T extends RankableProduct>(products: T[], query: string): RankedProduct<T>[] {
  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) {
    return products.map((product) => ({
      ...product,
      relevanceScore: Number(product.aiScore),
      matchReasons: ["AI catalog confidence"],
    }));
  }

  return products
    .map((product) => {
      const haystack = [product.name, product.description, product.brand ?? "", product.category ?? ""]
        .join(" ")
        .toLowerCase();
      const matchedTokens = tokens.filter((token) => haystack.includes(token));
      const tokenScore = (matchedTokens.length / tokens.length) * 60;
      const aiScore = Number(product.aiScore) * 0.3;
      const stockBoost = (product.stock ?? 0) > 0 ? 5 : 0;
      const ratingBoost = (product.rating ?? 0) >= 4.5 ? 5 : 0;
      const relevanceScore = Number((tokenScore + aiScore + stockBoost + ratingBoost).toFixed(2));

      const matchReasons = [
        ...(matchedTokens.length > 0 ? [`Matched: ${matchedTokens.slice(0, 4).join(", ")}`] : []),
        `AI confidence ${Number(product.aiScore).toFixed(0)}%`,
        ...(stockBoost ? ["In stock"] : []),
      ];

      return { ...product, relevanceScore, matchReasons };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

export function scoreLabelImageMatch(productLabels: string[], detectedLabels: string[]) {
  if (detectedLabels.length === 0) return 0;
  const normalizedProduct = productLabels.map((label) => label.toLowerCase());
  const matches = detectedLabels.filter((label) =>
    normalizedProduct.some((entry) => entry.includes(label.toLowerCase()) || label.toLowerCase().includes(entry)),
  );
  return Number(((matches.length / detectedLabels.length) * 100).toFixed(2));
}
