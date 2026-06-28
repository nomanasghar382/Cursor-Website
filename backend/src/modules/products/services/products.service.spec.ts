import { ProductsService } from "./products.service";
import { ProductsRepository } from "../repositories/products.repository";

describe("ProductsService", () => {
  it("maps enterprise products to catalog cards", async () => {
    const repository = {
      findCatalog: jest.fn().mockResolvedValue({
        products: [
          {
            id: "product-1",
            slug: "nova-butler-x1",
            name: "NOVA Butler X1",
            description: "AI home assistant robot.",
            basePrice: 1299,
            createdAt: new Date(),
            aiScore: 97.5,
            category: { name: "Robotics", slug: "robotics" },
            brand: null,
            variants: [
              {
                price: 1299,
                compareAtPrice: null,
                inventoryItems: [{ availableQuantity: 9 }, { availableQuantity: 3 }],
                productAttributes: [],
                metadata: {},
                sku: "SKU1",
              },
            ],
            images: [],
            reviews: [{ rating: 5 }, { rating: 4 }],
            questions: [],
            specifications: [],
            assets360: [],
            models3d: [],
            arModels: [],
          },
        ],
        total: 1,
        page: 1,
        limit: 24,
      }),
      findFacets: jest.fn().mockResolvedValue({ categories: [], brands: [], minPrice: 0, maxPrice: 2000 }),
    } as unknown as ProductsRepository;

    const service = new ProductsService(repository);
    const result = await service.list({});

    expect(result.count).toBe(1);
    expect(result.products[0]).toMatchObject({
      id: "product-1",
      category: "Robotics",
      stock: 12,
      rating: 4.5,
      badge: "AI Recommended",
    });
  });
});
