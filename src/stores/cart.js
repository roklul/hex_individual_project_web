import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { cartApi } from '../api/index.js'
import { isCurrentSession, requireSession, session } from '../api/session.js'

const empty = () => ({ items: [], total: 0, totalQuantity: 0, shippingFee: 0, grandTotal: 0, freeShippingThreshold: 500, cartVersion: -1, quoteVersion: '' })

/**
 * 購物車狀態一律以後端回傳結果為準：每次加入/修改/移除後，
 * 用 API 回應的完整購物車覆蓋本地狀態，確保前後端同步。
 */
export const useCartStore = defineStore('cart', () => {
  const cart = ref(empty())
  const loading = ref(false)
  const loaded = ref(false)
  const error = ref(null)
  const pending = ref(new Map()) // 各 productId 尚未完成的更新數
  const updating = computed(() => pending.value.size > 0)
  let nextRequest = 0
  let appliedRequest = 0
  let latestRead = 0

  const items = computed(() => cart.value.items)
  const count = computed(() => cart.value.totalQuantity)
  const total = computed(() => cart.value.total)
  // 運費與總計由後端計算，前端只負責顯示
  const shippingFee = computed(() => cart.value.shippingFee ?? 0)
  const grandTotal = computed(() => cart.value.grandTotal ?? cart.value.total)
  const freeShippingThreshold = computed(() => cart.value.freeShippingThreshold ?? 500)
  const isPending = (id) => pending.value.has(id)

  function applyCart(data, request) {
    if (!Number.isSafeInteger(data?.cartVersion) || data.cartVersion < 0 ||
        typeof data.quoteVersion !== 'string' || !data.quoteVersion) {
      throw new Error('購物車回應缺少報價版本')
    }
    // 同一購物車版本也可能因商品調價取得新報價；此時以請求發起順序決定。
    if (data.cartVersion < cart.value.cartVersion ||
        (data.cartVersion === cart.value.cartVersion && request < appliedRequest)) return
    cart.value = data
    appliedRequest = request
    loaded.value = true
    error.value = null
  }

  async function withPending(id, fn) {
    const version = session.value.version
    const request = ++nextRequest
    pending.value.set(id, (pending.value.get(id) || 0) + 1)
    try {
      const res = await fn()
      requireSession(version)
      applyCart(res.data, request)
      return res
    } finally {
      if (isCurrentSession(version)) {
        const remaining = pending.value.get(id) - 1
        if (remaining > 0) pending.value.set(id, remaining)
        else pending.value.delete(id)
      }
    }
  }

  async function fetchCart() {
    const version = session.value.version
    const request = ++nextRequest
    latestRead = request
    loading.value = true
    error.value = null
    try {
      const res = await cartApi.get()
      requireSession(version)
      applyCart(res.data, request)
      return cart.value
    } catch (err) {
      if (isCurrentSession(version) && request === latestRead && request >= appliedRequest) error.value = err
      throw err
    } finally {
      if (isCurrentSession(version) && request === latestRead) loading.value = false
    }
  }

  const addItem = (productId, quantity = 1) => withPending(productId, () => cartApi.add(productId, quantity))
  const updateItem = (productId, quantity) => withPending(productId, () => cartApi.update(productId, quantity))
  const removeItem = (productId) => withPending(productId, () => cartApi.remove(productId))
  const clearCart = () => withPending('__all__', () => cartApi.clear())

  function reset() {
    cart.value = empty()
    loading.value = false
    loaded.value = false
    error.value = null
    pending.value.clear()
    appliedRequest = 0
    latestRead = 0
  }

  watch(session, reset, { flush: 'sync' })

  return { cart, items, count, total, shippingFee, grandTotal, freeShippingThreshold, loading, loaded, updating, error, isPending, fetchCart, addItem, updateItem, removeItem, clearCart, reset }
})
