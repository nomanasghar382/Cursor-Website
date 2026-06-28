import { render, screen } from "@testing-library/react";
import type { ProductCard } from "@/types/catalog";
import { ProductCardView } from "./product-card";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

const product: ProductCard = {
  id: "product-1",
  slug: "nova-pulse-headphones",
  name: "Nova Pulse Headphones",
  description: "Immersive spatial audio with adaptive ANC.",
  price: 299,
  rating: 4.8,
  reviewCount: 128,
  stock: 12,
  aiMatch: 94,
  category: "Audio",
  categorySlug: "audio",
  badge: "Trending",
  badges: ["Trending"],
  gradient: "from-violet-600 to-fuchsia-500",
  imageUrl: "https://example.com/pulse.jpg",
  brand: "Nova",
  colors: ["black"],
  defaultVariantId: "variant-1",
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("ProductCardView", () => {
  it("renders product details and purchase link", () => {
    render(<ProductCardView product={product} />);

    expect(screen.getByText("Nova Pulse Headphones")).toBeInTheDocument();
    expect(screen.getByText("Immersive spatial audio with adaptive ANC.")).toBeInTheDocument();
    expect(screen.getByText("$299")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view/i })).toHaveAttribute("href", "/products/product-1");
  });
});
