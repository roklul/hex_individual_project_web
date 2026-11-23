<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useToastStore } from '@/stores/toast'
import { getErrorMessage } from '@/api/http'
import { currency } from '@/utils/format'
import CartItem from '@/components/cart/CartItem.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import StatusMessage from '@/components/common/StatusMessage.vue'

const cart = useCartStore()
const toast = useToastStore()
const router = useRouter()

onMounted(() => cart.fetchCart().catch(() => {}))

const hasIssue = computed(() => cart.items.some((i) => !i.available || i.quantity > i.maxQuantity))

async function run(fn, success) {
  try {
    const res = await fn()
    toast.success(success || res.message)
  } catch (err) {
    toast.error(getErrorMessage(err))
    // 失敗時重新抓取，確保畫面與後端一致
    cart.fetchCart().catch(() => {})
  }
}

const update = (item, qty) => run(() => cart.updateItem(item.productId, qty), `已將「${item.product.title}」數量更新為 ${qty}`)
const remove = (item) => run(() => cart.removeItem(item.productId), `已移除「${item.product.title}」`)
function clearAll() {
  if (confirm('確定要清空購物車嗎？')) run(() => cart.clearCart())
}
function checkout() {
  router.push({ name: 'checkout' })
}
</script>

<template>
  <div class="container-page py-8 sm:py-12">
    <h1 class="font-serif text-3xl text-brand">購物車</h1>

    <LoadingSpinner v-if="cart.loading && !cart.loaded" label="購物車載入中…" />
    <StatusMessage v-else-if="cart.error && !cart.loaded" type="error" title="購物車載入失敗" :description="getErrorMessage(cart.error)" class="mt-8">
      <button type="button" class="btn-outline" @click="cart.fetchCart().catch(() => {})">重新載入</button>
    </StatusMessage>
    <StatusMessage v-else-if="cart.items.length === 0" title="購物車是空的" description="去逛逛，把喜歡的器物帶回家吧！" class="mt-8">
      <RouterLink to="/products" class="btn-primary">開始購物</RouterLink>
    </StatusMessage>

    <div v-else class="mt-8 grid gap-8 lg:grid-cols-3">
      <section class="rounded-2xl bg-white px-4 ring-1 ring-sand sm:px-6 lg:col-span-2" aria-label="購物車商品">
        <header class="flex items-center justify-between border-b border-sand py-4">
          <h2 class="font-medium">共 {{ cart.count }} 件商品</h2>
          <button type="button" class="text-sm text-ink/50 hover:text-red-700" :disabled="cart.isPending('__all__')" @click="clearAll">清空購物車</button>
        </header>
        <ul class="divide-y divide-sand">
          <li v-for="item in cart.items" :key="item.productId">
            <CartItem :item="item" :pending="cart.isPending(item.productId) || cart.isPending('__all__')" @update="update(item, $event)" @remove="remove(item)" />
          </li>
        </ul>
      </section>

      <aside class="h-fit rounded-2xl bg-white p-6 ring-1 ring-sand lg:sticky lg:top-24" aria-labelledby="summary-title">
        <h2 id="summary-title" class="font-medium">訂單摘要</h2>
        <dl class="mt-4 space-y-2 text-sm">
          <div class="flex justify-between"><dt class="text-ink/60">商品小計</dt><dd>{{ currency(cart.total) }}</dd></div>
          <div class="flex justify-between"><dt class="text-ink/60">運費</dt><dd>{{ cart.shippingFee ? currency(cart.shippingFee) : '免運' }}</dd></div>
          <div class="flex justify-between border-t border-sand pt-3 text-base font-medium"><dt>總計</dt><dd class="text-accent">{{ currency(cart.grandTotal) }}</dd></div>
        </dl>
        <p v-if="cart.shippingFee" class="mt-3 text-xs text-ink/50">再買 {{ currency(cart.freeShippingThreshold - cart.total) }} 即可免運</p>
        <p v-if="hasIssue" class="mt-3 text-xs text-red-700">部分商品庫存不足或已下架，請先調整</p>
        <button type="button" class="btn-primary mt-6 w-full" :disabled="hasIssue || cart.updating || cart.loading" @click="checkout">前往結帳</button>
        <RouterLink to="/products" class="mt-3 block text-center text-sm text-accent hover:underline">繼續購物</RouterLink>
      </aside>
    </div>
  </div>
</template>
