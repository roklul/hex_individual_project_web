import http from './http'

export const authApi = {
  register: (payload) => http.post('/auth/register', payload).then((r) => r.data.data),
  login: (payload) => http.post('/auth/login', payload).then((r) => r.data.data),
  me: () => http.get('/auth/me').then((r) => r.data.data.user),
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
  create: (payload) => http.post('/orders', payload).then((r) => r.data),
  list: (params) => http.get('/orders', { params }).then((r) => r.data),
  get: (id) => http.get(`/orders/${id}`).then((r) => r.data.data),
  cancel: (id) => http.post(`/orders/${id}/cancel`).then((r) => r.data),
}
