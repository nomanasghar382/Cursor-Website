jest.mock("@/lib/api/cart", () => ({
  cartApi: {
    get: jest.fn(),
    addItem: jest.fn(),
    updateItem: jest.fn(),
    removeItem: jest.fn(),
    sync: jest.fn(),
    saveForLater: jest.fn(),
    moveSavedToCart: jest.fn(),
  },
}));

jest.mock("@/lib/api/wishlist", () => ({
  wishlistApi: {
    list: jest.fn(),
    toggle: jest.fn(),
  },
}));

import { cartApi } from "@/lib/api/cart";
import { useCommerceStore } from "./commerce-store";

describe("commerce store", () => {
  beforeEach(() => {
    useCommerceStore.setState({
      guestCart: [],
      cart: null,
      wishlists: [],
      wishlistNotes: {},
      compareList: [],
      recentlyRemoved: null,
      drawerOpen: false,
    });
    jest.clearAllMocks();
  });

  it("counts guest cart items", () => {
    useCommerceStore.setState({
      guestCart: [
        { variantId: "v1", productId: "p1", quantity: 2 },
        { variantId: "v2", productId: "p2", quantity: 1 },
      ],
    });
    expect(useCommerceStore.getState().cartCount()).toBe(3);
  });

  it("counts authenticated cart items from server cart", () => {
    useCommerceStore.setState({
      cart: {
        id: "cart-1",
        currencyCode: "USD",
        itemCount: 5,
        subtotal: 500,
        items: [],
        savedForLater: [],
        estimatedTax: 0,
        shippingEstimate: 0,
        aiSuggestions: [],
        crossSell: [],
        upsell: [],
      },
    });
    expect(useCommerceStore.getState().cartCount()).toBe(5);
  });

  it("merges guest add-to-cart lines locally", async () => {
    await useCommerceStore.getState().addToCart({ variantId: "v1", productId: "p1", quantity: 1 });
    await useCommerceStore.getState().addToCart({ variantId: "v1", productId: "p1", quantity: 2 });

    const guestCart = useCommerceStore.getState().guestCart;
    expect(guestCart).toHaveLength(1);
    expect(guestCart[0]?.quantity).toBe(3);
    expect(useCommerceStore.getState().drawerOpen).toBe(true);
  });

  it("uses cart API when token is present", async () => {
    (cartApi.addItem as jest.Mock).mockResolvedValue({
      cart: {
        id: "cart-1",
        currencyCode: "USD",
        itemCount: 1,
        subtotal: 99,
        items: [],
        savedForLater: [],
        estimatedTax: 0,
        shippingEstimate: 0,
        aiSuggestions: [],
        crossSell: [],
        upsell: [],
      },
    });

    await useCommerceStore.getState().addToCart({ token: "token-1", variantId: "v1", productId: "p1" });
    expect(cartApi.addItem).toHaveBeenCalledWith("token-1", "v1", 1);
  });

  it("limits compare list to three products", () => {
    const store = useCommerceStore.getState();
    store.toggleCompare("p1");
    store.toggleCompare("p2");
    store.toggleCompare("p3");
    store.toggleCompare("p4");

    expect(useCommerceStore.getState().compareList).toHaveLength(3);
    expect(useCommerceStore.getState().compareList).not.toContain("p1");
  });
});
