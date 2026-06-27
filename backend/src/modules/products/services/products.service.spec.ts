import { ProductsService } from "./products.service";
import { ProductsRepository } from "../repositories/products.repository";

describe("ProductsService", () => {
  it("maps enterprise products to catalog cards", async () => {
    const repository = {
      findCatalog: jest.fn().mockResolvedValue([
        {
          id: "product-1",
          name: "NOVA Butler X1",
          description: "AI home assistant robot.",
          basePrice: 1299,
          aiScore: { greaterThan: (value: number) => value < 97, toString: () => "97.5", valueOf: () => 97.5 },
          category: { slug: "robotics" },
          variants: [{ price: 1299, inventoryItems: [{ availableQuantity: 9 }, { availableQuantity: 3 }] }],
          reviews: [{ rating: 5 }, { rating: 4 }],
        },
      ]),
    } as unknown as ProductsRepository;

    const service = new ProductsService(repository);
    const result = await service.list({});

    expect(result.count).toBe(1);
    expect(result.products[0]).toMatchObject({
      id: "product-1",
      category: "robotics",
      stock: 12,
      rating: 4.5,
      badge: "AI Best Match",
    });
  });
});
