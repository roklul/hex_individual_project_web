import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { cartApi } from '@/api'

const empty = () => ({ items: [], total: 0, totalQuantity: 0, shippingFee: 0, grandTotal: 0, freeShippingThreshold: 500 })

/**
 * 購物車狀態一律以後端回傳結果為準：每次加入/修改/移除後，
 * 用 API 回應的完整購物車覆蓋本地狀態，確保前後端同步。
 */
export const useCartStore = defineStore('cart', () => {
  const cart = ref(empty())
  const loading = ref(false)
  const loaded = ref(false)
  const error = ref(null)
  const pending = ref(new Set()) // 正在更新的 productId

  const items = computed(() => cart.value.items)
  const count = computed(() => cart.value.totalQuantity)
  const total = computed(() => cart.value.total)
  // 運費與總計由後端計算，前端只負責顯示
  const shippingFee = computed(() => cart.value.shippingFee ?? 0)
  const grandTotal = computed(() => cart.value.grandTotal ?? cart.value.total)
  const freeShippingThreshold = computed(() => cart.value.freeShippingThreshold ?? 500)
  const isPending = (id) => pending.value.has(id)

  async function withPending(id, fn) {
    pending.value = new Set(pending.value).add(id)
    try {
      const res = await fn()
      cart.value = res.data
      return res
    } finally {
      const next = new Set(pending.value)
      next.delete(id)
      pending.value = next
    }
  }

  async function fetchCart() {
    loading.value = true
    error.value = null
    try {
      cart.value = (await cartApi.get()).data
      loaded.value = true
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  const addItem = (productId, quantity = 1) => withPending(productId, () => cartApi.add(productId, quantity))
  const updateItem = (productId, quantity) => withPending(productId, () => cartApi.update(productId, quantity))
  const removeItem = (productId) => withPending(productId, () => cartApi.remove(productId))
  const clearCart = () => withPending('__all__', () => cartApi.clear())

  function reset() {
    cart.value = empty()
    loaded.value = false
    error.value = null
  }

  return { cart, items, count, total, shippingFee, grandTotal, freeShippingThreshold, loading, loaded, error, isPending, fetchCart, addItem, updateItem, removeItem, clearCart, reset }
})
