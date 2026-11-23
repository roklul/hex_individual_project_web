import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'
import { createPinia, setActivePinia } from 'pinia'

const storage = new Map()
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  },
})

const { session, TOKEN_KEY, checkStoredSession } = await import('../src/api/session.js')
const { default: http, setUnauthorizedHandler } = await import('../src/api/http.js')
const { orderApi } = await import('../src/api/index.js')
const { useAuthStore } = await import('../src/stores/auth.js')
const { useCartStore } = await import('../src/stores/cart.js')

const response = (config, data) => ({ status: 200, data, config })

beforeEach(() => {
  setActivePinia(createPinia())
  storage.clear()
  storage.set(TOKEN_KEY, 'first')
  session.value = { token: 'first', version: 0, invalidated: false }
  setUnauthorizedHandler(null)
  http.defaults.adapter = () => { throw new Error('Unexpected request') }
})

test('checkout dispatches with the identity that supplied the form', async () => {
  let sent
  http.defaults.adapter = async (config) => {
    sent = config
    return response(config, { data: { id: 'order' } })
  }
  const result = await orderApi.create({ paymentMethod: '貨到付款', quoteVersion: 'a'.repeat(64) }, session.value.version)
  assert.equal(result.data.id, 'order')
  assert.equal(sent.headers.Authorization, 'Bearer first')
})

test('a storage change blocks checkout even before the browser delivers its event', async () => {
  const formVersion = session.value.version
  const cart = useCartStore()
  cart.cart.totalQuantity = 3
  storage.set(TOKEN_KEY, 'second')
  let sent = false
  http.defaults.adapter = async (config) => {
    sent = true
    return response(config, {})
  }
  await assert.rejects(orderApi.create({}, formVersion), /登入狀態已變更/)
  assert.equal(sent, false)
  assert.equal(session.value.invalidated, true)
  assert.equal(cart.count, 0)
  assert.equal(storage.get(TOKEN_KEY), 'second')
})

test('late cart and profile responses cannot refill a logged-out page', async () => {
  const replies = new Map()
  http.defaults.adapter = (config) => new Promise((resolve) => {
    replies.set(config.url, (data) => resolve(response(config, data)))
  })
  const cart = useCartStore()
  const auth = useAuthStore()
  const profile = auth.init()
  const read = cart.fetchCart()
  const change = cart.addItem('sample')

  storage.delete(TOKEN_KEY)
  checkStoredSession()
  assert.equal(cart.isPending('sample'), false)
  assert.equal(cart.loading, false)

  replies.get('/auth/me')({ data: { user: { name: 'First' } } })
  const oldCart = { data: { items: [], totalQuantity: 12 } }
  replies.get('/cart')(oldCart)
  replies.get('/cart/items')(oldCart)
  await profile
  await assert.rejects(read, /登入狀態已變更/)
  await assert.rejects(change, /登入狀態已變更/)
  assert.equal(auth.user, null)
  assert.equal(cart.count, 0)
  assert.equal(cart.loaded, false)
  assert.equal(cart.error, null)
})

test('an old 401 and a retained form cannot affect a subsequent sign-in', async () => {
  const auth = useAuthStore()
  const formVersion = session.value.version
  let rejectOldRequest
  let ordersSent = 0
  http.defaults.adapter = (config) => {
    if (config.url === '/auth/login') {
      return Promise.resolve(response(config, { data: { token: 'second', user: { name: 'Second' } } }))
    }
    if (config.url === '/orders') {
      ordersSent++
      return Promise.resolve(response(config, {}))
    }
    return new Promise((_, reject) => {
      rejectOldRequest = () => reject(Object.assign(new Error('Unauthorized'), { config, response: { status: 401 } }))
    })
  }
  setUnauthorizedHandler(() => auth.logout())
  const pending = http.get('/cart')
  auth.logout()
  await auth.login({})
  rejectOldRequest()
  await assert.rejects(pending, /登入狀態已變更/)
  await assert.rejects(orderApi.create({}, formVersion), /登入狀態已變更/)
  assert.equal(ordersSent, 0)
  assert.equal(auth.user.name, 'Second')
  assert.equal(storage.get(TOKEN_KEY), 'second')
})
