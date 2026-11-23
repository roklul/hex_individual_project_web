import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'
import { setImmediate } from 'node:timers/promises'
import { createPinia, setActivePinia } from 'pinia'
import { effectScope } from 'vue'

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: { getItem: () => 'member' },
})

const { default: http } = await import('../src/api/http.js')
const { useCartStore } = await import('../src/stores/cart.js')
const { useCheckoutQuote } = await import('../src/composables/useCheckoutQuote.js')

function snapshot(cartVersion, quoteVersion, total) {
  return { items: [{ available: true, quantity: 1, maxQuantity: 3 }], totalQuantity: 1, grandTotal: total, cartVersion, quoteVersion }
}

let requests, cart, checkout, scope
beforeEach(() => {
  requests = []
  http.defaults.adapter = (config) => new Promise((resolve, reject) => {
    requests.push({
      url: config.url,
      body: config.data && JSON.parse(config.data),
      succeed: (data) => resolve({ config, status: 200, data: { data } }),
      fail: (status) => reject(Object.assign(new Error('Request failed'), { config, response: { status } })),
    })
  })
  setActivePinia(createPinia())
  cart = useCartStore()
  scope = effectScope()
  checkout = scope.run(useCheckoutQuote)
})
afterEach(() => scope.stop())

test('cart versions order concurrent reads and writes, including late higher versions', async () => {
  const read = cart.fetchCart()
  const firstEdit = cart.updateItem('one', 1)
  const lastEdit = cart.updateItem('two', 1)
  requests[2].succeed(snapshot(2, 'second', 200))
  await lastEdit
  requests[0].succeed(snapshot(1, 'old', 100))
  assert.equal((await read).grandTotal, 200)
  requests[1].succeed(snapshot(3, 'third', 300))
  await firstEdit
  assert.equal(cart.grandTotal, 300)
  assert.equal(cart.updating, false)
})

test('two prices for the same cart version keep the later request’s quote', async () => {
  const first = cart.fetchCart()
  const second = cart.fetchCart()
  requests[1].succeed(snapshot(3, 'new-price', 120))
  await second
  requests[0].succeed(snapshot(3, 'old-price', 100))
  assert.equal((await first).quoteVersion, 'new-price')
  assert.equal(cart.grandTotal, 120)
})

test('initial load errors end the spinner, block checkout and can be retried', async () => {
  const initial = checkout.refreshQuote()
  requests[0].fail(503)
  await initial
  assert.equal(checkout.loading.value, false)
  assert.ok(checkout.loadError.value)
  assert.equal(checkout.canSubmit.value, false)
  const retry = checkout.refreshQuote()
  requests[1].succeed(snapshot(1, 'first', 100))
  await retry
  assert.equal(checkout.loadError.value, '')
  assert.equal(checkout.canSubmit.value, true)
})

test('a conflict refreshes the displayed quote and requires a second explicit submit', async () => {
  const initial = checkout.refreshQuote()
  requests[0].succeed(snapshot(1, 'shown', 100))
  await initial
  const background = cart.fetchCart()
  requests[1].succeed(snapshot(1, 'updated', 150))
  await background
  assert.equal(checkout.quote.value.grandTotal, 100)

  const attempt = checkout.placeOrder({ paymentMethod: '貨到付款' }, 'shown')
  assert.deepEqual(requests[2].body, { paymentMethod: '貨到付款', quoteVersion: 'shown' })
  await checkout.placeOrder({}, 'shown')
  assert.equal(requests.length, 3)
  requests[2].fail(409)
  await setImmediate()
  assert.equal(requests[3].url, '/cart')
  assert.equal(checkout.canSubmit.value, false)
  requests[3].fail(503)
  await attempt
  assert.ok(checkout.loadError.value)
  assert.equal(checkout.quote.value, null)
  await checkout.placeOrder({}, 'shown')
  assert.equal(requests.length, 4)

  const retry = checkout.refreshQuote()
  requests[4].succeed(snapshot(1, 'updated', 150))
  await retry
  assert.match(checkout.orderError.value, /再次確認/)
  assert.equal(checkout.quote.value.grandTotal, 150)
  await checkout.placeOrder({}, 'shown')
  assert.equal(requests.length, 5)
  const confirmed = checkout.placeOrder({}, 'updated')
  assert.deepEqual(requests[5].body, { quoteVersion: 'updated' })
  requests[5].succeed({ id: 'accepted' })
  assert.equal((await confirmed).data.id, 'accepted')
  requests[6].succeed({ ...snapshot(2, 'empty', 0), items: [] })
})
