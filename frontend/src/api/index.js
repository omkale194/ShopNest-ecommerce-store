import api from "./client";

const clean = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined));
const data = (promise) => promise.then((r) => r.data);

export const AuthApi = {
  login: (body) => data(api.post("/auth/login", body)),
  register: (body) => data(api.post("/auth/register", body)),
  me: () => data(api.get("/auth/me")),
};

export const CatalogApi = {
  categories: () => data(api.get("/categories")),
  products: (params) => data(api.get("/products", { params: clean(params) })),
  featured: () => data(api.get("/products/featured")),
  product: (id) => data(api.get(`/products/${id}`)),
};

// Cart lines are identified by the product id.
export const CartApi = {
  get: () => data(api.get("/cart")),
  add: (productId, quantity) => data(api.post("/cart/items", { productId, quantity })),
  update: (productId, quantity) => data(api.put(`/cart/items/${productId}`, { quantity })),
  remove: (productId) => data(api.delete(`/cart/items/${productId}`)),
  clear: () => data(api.delete("/cart")),
};

export const OrderApi = {
  place: (body) => data(api.post("/orders", body)),
  mine: () => data(api.get("/orders")),
  get: (id) => data(api.get(`/orders/${id}`)),
  cancel: (id) => data(api.post(`/orders/${id}/cancel`)),
};

export const AdminApi = {
  stats: () => data(api.get("/admin/stats")),
  products: (params) => data(api.get("/admin/products", { params: clean(params) })),
  createProduct: (body) => data(api.post("/admin/products", body)),
  updateProduct: (id, body) => data(api.put(`/admin/products/${id}`, body)),
  hideProduct: (id) => data(api.delete(`/admin/products/${id}`)),
  createCategory: (body) => data(api.post("/admin/categories", body)),
  updateCategory: (id, body) => data(api.put(`/admin/categories/${id}`, body)),
  deleteCategory: (id) => data(api.delete(`/admin/categories/${id}`)),
  orders: () => data(api.get("/admin/orders")),
  setStatus: (id, status) => data(api.put(`/admin/orders/${id}/status`, { status })),
};
