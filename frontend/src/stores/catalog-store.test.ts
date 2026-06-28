import { useCatalogStore } from "./catalog-store";

describe("catalog store", () => {
  beforeEach(() => {
    useCatalogStore.setState({
      viewMode: "grid",
      recentSearches: [],
      recentlyViewed: [],
      popularSearches: [],
    });
  });

  it("deduplicates recent searches and caps at eight", () => {
    const store = useCatalogStore.getState();
    for (let index = 0; index < 10; index += 1) {
      store.addRecentSearch(`query-${index}`);
    }
    store.addRecentSearch("query-1");

    const searches = useCatalogStore.getState().recentSearches;
    expect(searches[0]).toBe("query-1");
    expect(searches.length).toBeLessThanOrEqual(8);
    expect(searches.filter((entry) => entry === "query-1").length).toBe(1);
  });

  it("tracks recently viewed products with cap", () => {
    const store = useCatalogStore.getState();
    for (let index = 0; index < 15; index += 1) {
      store.addRecentlyViewed(`product-${index}`);
    }
    expect(useCatalogStore.getState().recentlyViewed.length).toBeLessThanOrEqual(12);
  });

  it("ignores blank search queries", () => {
    useCatalogStore.getState().addRecentSearch("   ");
    expect(useCatalogStore.getState().recentSearches).toEqual([]);
  });
});
