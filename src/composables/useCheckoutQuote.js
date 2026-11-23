import { computed, onScopeDispose, ref, shallowRef } from 'vue'
import { orderApi } from '../api/index.js'
import { getErrorMessage } from '../api/http.js'
import { isCurrentSession, session } from '../api/session.js'
import { useCartStore } from '../stores/cart.js'

export function useCheckoutQuote() {
  const cart = useCartStore()
  const sessionVersion = session.value.version
  const quote = shallowRef(null)
  const loading = ref(false)
  const loadError = ref('')
  const submitting = ref(false)
  const orderError = ref('')
  let active = true
  onScopeDispose(() => { active = false })

  const hasIssue = computed(() => quote.value?.items.some((i) => !i.available || i.quantity > i.maxQuantity))
  const canSubmit = computed(() => Boolean(quote.value?.items.length) &&
    !hasIssue.value && !cart.updating && !submitting.value && !loading.value)

  async function refreshQuote() {
    if (!active || loading.value || !isCurrentSession(sessionVersion)) return
    loading.value = true
    quote.value = null
    loadError.value = ''
    try {
      const snapshot = await cart.fetchCart()
      if (active && isCurrentSession(sessionVersion)) quote.value = snapshot
    } catch (err) {
      if (active && isCurrentSession(sessionVersion)) loadError.value = getErrorMessage(err, '無法取得購物車報價，請重新載入')
    } finally {
      loading.value = false
    }
  }

  async function placeOrder(payload, displayedVersion) {
    if (!active || !isCurrentSession(sessionVersion) || !canSubmit.value || displayedVersion !== quote.value.quoteVersion) return
    submitting.value = true
    orderError.value = ''
    try {
      const result = await orderApi.create({ ...payload, quoteVersion: displayedVersion }, sessionVersion)
      if (!isCurrentSession(sessionVersion)) return
      quote.value = null
      cart.fetchCart().catch(() => {})
      if (active) return result
    } catch (err) {
      if (!active || !isCurrentSession(sessionVersion)) return
      orderError.value = err.response?.status === 409
        ? '購物車內容或報價已變更。請核對最新商品、數量與應付金額，再次確認下單。'
        : getErrorMessage(err, '下單失敗，請確認訂單與購物車後再試')
      await refreshQuote()
    } finally {
      submitting.value = false
    }
  }

  return { quote, loading, loadError, orderError, submitting, hasIssue, canSubmit, refreshQuote, placeOrder }
}
