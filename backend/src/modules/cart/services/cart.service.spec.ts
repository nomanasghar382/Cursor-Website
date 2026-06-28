import { BadRequestException, NotFoundException } from "@nestjs/common";
import { CartService } from "./cart.service";
import { CartRepository } from "../repositories/cart.repository";

describe("CartService", () => {
  const cartRepository = {
    findOrCreate: jest.fn(),
    findVariant: jest.fn(),
    findByUserId: jest.fn(),
    upsertItem: jest.fn(),
    updateItemQuantity: jest.fn(),
    removeItem: jest.fn(),
  } as unknown as CartRepository;

  const service = new CartService(cartRepository);

  const product = {
    id: "product-1",
    name: "Nova Hub",
    slug: "nova-hub",
    images: [{ url: "https://example.com/hub.jpg" }],
    category: { slug: "smart-home" },
    brand: { name: "Nova" },
  };

  const variant = {
    id: "variant-1",
    sku: "SKU-1",
    price: 99.99,
    product,
    inventoryItems: [{ availableQuantity: 10 }],
  };

  const cart = {
    id: "cart-1",
    currencyCode: "USD",
    items: [],
    metadata: {},
  };

  const cartLine = {
    id: "line-1",
    variantId: "variant-1",
    quantity: 2,
    priceSnapshot: 99.99,
    variant,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (cartRepository.findOrCreate as jest.Mock).mockResolvedValue(cart);
    (cartRepository.findVariant as jest.Mock).mockResolvedValue(variant);
    (cartRepository.findByUserId as jest.Mock).mockResolvedValue({
      ...cart,
      items: [cartLine],
    });
  });

  it("throws when variant is missing", async () => {
    (cartRepository.findVariant as jest.Mock).mockResolvedValue(null);
    await expect(service.addItem("user-1", { variantId: "missing" })).rejects.toBeInstanceOf(NotFoundException);
  });

  it("throws when inventory is insufficient", async () => {
    (cartRepository.findVariant as jest.Mock).mockResolvedValue({
      ...variant,
      inventoryItems: [{ availableQuantity: 1 }],
    });

    await expect(service.addItem("user-1", { variantId: "variant-1", quantity: 5 })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("adds item and returns refreshed cart view", async () => {
    const result = await service.addItem("user-1", { variantId: "variant-1", quantity: 1 });
    expect(cartRepository.upsertItem).toHaveBeenCalledWith("cart-1", "variant-1", 1, 99.99);
    expect(result.cart.itemCount).toBe(2);
    expect(result.cart.items[0]?.name).toBe("Nova Hub");
  });

  it("removes missing cart line with NotFoundException", async () => {
    await expect(service.removeItem("user-1", "missing-variant")).rejects.toBeInstanceOf(NotFoundException);
  });
});
