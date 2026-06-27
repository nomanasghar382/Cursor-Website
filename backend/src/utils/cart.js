export function getOrCreateCart(db, userId) {
  let cart = db.carts.find((entry) => entry.userId === userId);
  if (!cart) {
    cart = { userId, items: [] };
    db.carts.push(cart);
  }
  return cart;
}

export function getOrCreateWishlist(db, userId) {
  let wishlist = db.wishlists.find((entry) => entry.userId === userId);
  if (!wishlist) {
    wishlist = { userId, productIds: [] };
    db.wishlists.push(wishlist);
  }
  return wishlist;
}

export function cartToResponse(cart, products) {
  const enrichedItems = cart.items
    .map((item) => {
      const product = products.find((entry) => entry.id === item.productId);
      return product
        ? {
            productId: item.productId,
            quantity: item.quantity,
            product,
            lineTotal: product.price * item.quantity,
          }
        : null;
    })
    .filter(Boolean);

  const subtotal = enrichedItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const shipping = subtotal > 0 ? (subtotal >= 1000 ? 0 : 35) : 0;
  const tax = Number((subtotal * 0.08).toFixed(2));
  const total = Number((subtotal + shipping + tax).toFixed(2));
  const itemCount = enrichedItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items: enrichedItems.map((entry) => ({
      productId: entry.productId,
      quantity: entry.quantity,
      lineTotal: entry.lineTotal,
      product: entry.product,
    })),
    summary: {
      itemCount,
      subtotal,
      shipping,
      tax,
      total,
    },
  };
}
