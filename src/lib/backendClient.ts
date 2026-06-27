import type { ProductItem } from '../data/catalog';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

type RequestOptions = Omit<RequestInit, 'headers'> & {
  token?: string;
  body?: unknown;
};

type CartItemResponse = {
  productId: string;
  quantity: number;
  lineTotal: number;
  product: ProductItem;
};

type CartResponse = {
  items: CartItemResponse[];
  summary: {
    itemCount: number;
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  };
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, body, ...rest } = options;
  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: typeof body === 'undefined' ? undefined : JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message ?? `Request failed with ${response.status}`);
  }
  return payload as T;
}

export function getApiBaseUrl() {
  return API_BASE;
}

export function createDemoSession() {
  return request<{ token: string; user: { id: string; email: string; role: string; name: string } }>('/auth/demo', {
    method: 'POST',
  });
}

export function getCurrentUser(token: string) {
  return request<{ user: { id: string; email: string; role: string; name: string } }>('/auth/me', {
    method: 'GET',
    token,
  });
}

export function fetchProducts(params: { search?: string; category?: string; sort?: string } = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.category) query.set('category', params.category);
  if (params.sort) query.set('sort', params.sort);

  const suffix = query.toString() ? `?${query.toString()}` : '';
  return request<{ products: ProductItem[]; count: number }>(`/products${suffix}`, { method: 'GET' });
}

export function fetchWishlist(token: string) {
  return request<{ productIds: string[] }>('/wishlist', { method: 'GET', token });
}

export function addWishlistItem(token: string, productId: string) {
  return request<{ productIds: string[] }>(`/wishlist/${productId}`, { method: 'POST', token });
}

export function removeWishlistItem(token: string, productId: string) {
  return request<{ productIds: string[] }>(`/wishlist/${productId}`, { method: 'DELETE', token });
}

export function fetchCart(token: string) {
  return request<CartResponse>('/cart', { method: 'GET', token });
}

export function addCartItem(token: string, productId: string, quantity = 1) {
  return request<CartResponse>('/cart/items', { method: 'POST', token, body: { productId, quantity } });
}

export function patchCartItem(token: string, productId: string, quantityDelta: number) {
  return request<CartResponse>(`/cart/items/${productId}`, {
    method: 'PATCH',
    token,
    body: { quantityDelta },
  });
}

export function loadDemoCart(token: string) {
  return request<CartResponse>('/cart/demo', {
    method: 'POST',
    token,
  });
}

export function createCheckout(token: string, payload: { fullName: string; email: string; city: string; country: string; cardNumber: string }) {
  return request<{ order: unknown; message: string }>('/checkout/create', {
    method: 'POST',
    token,
    body: payload,
  });
}
