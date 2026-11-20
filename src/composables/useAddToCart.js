import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useToastStore } from '@/stores/toast'
import { getErrorMessage } from '@/api/http'

export function useAddToCart() {
  const auth = useAuthStore()
  const cart = useCartStore()
  const toast = useToastStore()
  const router = useRouter()
  const route = useRoute()

  async function addToCart(product, quantity = 1) {
    if (!auth.isLoggedIn) {
      toast.info('請先登入會員，即可將商品加入購物車')
      router.push({ name: 'login', query: { redirect: route.fullPath } })
      return false
    }
    try {
      const res = await cart.addItem(product.id, quantity)
      toast.success(res.message || '已加入購物車')
      return true
    } catch (err) {
      toast.error(getErrorMessage(err, '加入購物車失敗'))
      return false
    }
  }

  return { addToCart, isAdding: (id) => cart.isPending(id) }
}
