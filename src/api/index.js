import http from './http.js'

export const authApi = {
  register: (payload) => http.post('/auth/register', payload).then((r) => r.data.data),
  login: (payload) => http.post('/auth/login', payload).then((r) => r.data.data),
  me: () => http.get('/auth/me').then((r) => r.data.data.user),
  forgotPassword: (email) => http.post('/auth/forgot-password', { email }).then((r) => r.data),
  resetPassword: (payload) => http.post('/auth/reset-password', payload).then((r) => r.data.data),
  changePassword: (payload) => http.patch('/auth/password', payload).then((r) => r.data.data),
}

export const productApi = {
  list: (params, config) => http.get('/products', { params, ...config }).then((r) => r.data),
  get: (id) => http.get(`/products/${id}`).then((r) => r.data.data),
  categories: () => http.get('/products/categories').then((r) => r.data.data),
}

export const cartApi = {
  get: () => http.get('/cart').then((r) => r.data),
  add: (productId, quantity) => http.post('/cart/items', { productId, quantity }).then((r) => r.data),
  update: (productId, quantity) => http.patch(`/cart/items/${productId}`, { quantity }).then((r) => r.data),
  remove: (productId) => http.delete(`/cart/items/${productId}`).then((r) => r.data),
  clear: () => http.delete('/cart').then((r) => r.data),
}

export const orderApi = {
  create: (payload, sessionVersion) => http.post('/orders', payload, { sessionVersion }).then((r) => r.data),
  list: (params) => http.get('/orders', { params }).then((r) => r.data),
  get: (id) => http.get(`/orders/${id}`).then((r) => r.data.data),
  cancel: (id) => http.post(`/orders/${id}/cancel`).then((r) => r.data),
  reportTransfer: (id, last5) => http.post(`/orders/${id}/transfer-report`, { last5 }).then((r) => r.data),
}

export const adminApi = {
  listProducts: (params) => http.get('/admin/products', { params }).then((r) => r.data),
  createProduct: (payload) => http.post('/admin/products', payload).then((r) => r.data),
  updateProduct: (id, payload) => http.patch(`/admin/products/${id}`, payload).then((r) => r.data),
  deleteProduct: (id) => http.delete(`/admin/products/${id}`).then((r) => r.data),
  listOrders: (params) => http.get('/admin/orders', { params }).then((r) => r.data),
  updateOrderStatus: (id, status) => http.patch(`/admin/orders/${id}`, { status }).then((r) => r.data),
}
