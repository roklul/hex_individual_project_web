<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { orderApi } from '@/api'
import { getErrorMessage } from '@/api/http'
import { useToastStore } from '@/stores/toast'
import { currency } from '@/utils/format'
import CheckoutSteps from '@/components/order/CheckoutSteps.vue'
import OrderStatusBadge from '@/components/order/OrderStatusBadge.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import StatusMessage from '@/components/common/StatusMessage.vue'
import AtmTransferPanel from '@/components/order/AtmTransferPanel.vue'

const route = useRoute()
const toast = useToastStore()
const order = ref(null)
const loading = ref(true)
const error = ref('')
const notFound = ref(false)
const cancelling = ref(false)

const justPlaced = computed(() => route.query.success === '1')
const canCancel = computed(() => ['待付款', '處理中'].includes(order.value?.status))
const showAtm = computed(() => order.value?.paymentMethod === 'ATM 轉帳' && (order.value.status === '待付款' || order.value.transferReport?.last5))
const onAtmUpdated = (o) => (o ? (order.value = o) : load())
const formatDate = (d) => new Date(d).toLocaleString('zh-TW', { hour12: false })

async function load() {
  loading.value = true
  error.value = ''
  notFound.value = false
  try {
    order.value = await orderApi.get(route.params.id)
  } catch (err) {
    if ([400, 404].includes(err.response?.status)) notFound.value = true
    else error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}
watch(() => route.params.id, (id) => id && load(), { immediate: true })

async function cancel() {
  if (!confirm(`確定要取消訂單 ${order.value.orderNo} 嗎？`)) return
  cancelling.value = true
  try {
    const res = await orderApi.cancel(order.value.id)
    order.value = res.data
    toast.success('訂單已取消，商品庫存已退回')
  } catch (err) {
    toast.error(getErrorMessage(err, '取消失敗'))
    load()
  } finally {
    cancelling.value = false
  }
}
</script>

<template>
  <div class="container-page py-8 sm:py-12">
    <LoadingSpinner v-if="loading" label="訂單載入中…" />
    <StatusMessage v-else-if="notFound" title="找不到這筆訂單" description="訂單不存在，或不屬於目前登入的帳號。">
      <RouterLink to="/orders" class="btn-outline">查看我的訂單</RouterLink>
    </StatusMessage>
    <StatusMessage v-else-if="error" type="error" title="訂單載入失敗" :description="error">
      <button type="button" class="btn-outline" @click="load">重新載入</button>
    </StatusMessage>

    <template v-else-if="order">
      <template v-if="justPlaced">
        <CheckoutSteps :current="3" />
        <section class="mt-6 rounded-2xl bg-brand p-6 text-cream sm:p-8" aria-labelledby="done-title">
          <p class="text-3xl" aria-hidden="true">✓</p>
          <h1 id="done-title" class="mt-2 text-2xl font-bold">訂單已成立，感謝你的購買！</h1>
          <p class="mt-2 text-cream/80">訂單編號 <strong class="text-cream">{{ order.orderNo }}</strong></p>
          <p v-if="order.paymentMethod === 'ATM 轉帳'" class="mt-3 text-sm text-cream/80">
            請依「ATM 轉帳資訊」於期限內轉帳 {{ currency(order.total) }}，完成後回報帳號末五碼，我們確認入帳後會盡快出貨。
          </p>
          <p v-else class="mt-3 text-sm text-cream/80">我們會盡快為你出貨，商品送達時再付款即可。</p>
        </section>
      </template>
      <nav v-else aria-label="麵包屑" class="text-sm text-ink/50">
        <ol class="flex gap-2"><li><RouterLink to="/orders" class="hover:text-brand">我的訂單</RouterLink></li><li aria-hidden="true">/</li><li aria-current="page">{{ order.orderNo }}</li></ol>
      </nav>

      <article class="mt-8 grid gap-6 lg:grid-cols-3">
        <section class="rounded-2xl bg-white p-6 ring-1 ring-sand lg:col-span-2" aria-labelledby="od-items">
          <header class="flex flex-wrap items-center justify-between gap-2 border-b border-sand pb-4">
            <h2 id="od-items" class="font-medium">訂單 {{ order.orderNo }}</h2>
            <OrderStatusBadge :status="order.status" />
          </header>
          <ul class="divide-y divide-sand">
            <li v-for="i in order.items" :key="i.product" class="flex gap-3 py-4">
              <img :src="i.imageUrl" :alt="i.title" class="h-16 w-16 shrink-0 rounded-lg bg-white object-contain ring-1 ring-sand" />
              <div class="min-w-0 flex-1 text-sm">
                <RouterLink :to="{ name: 'product', params: { id: i.product } }" class="line-clamp-2 hover:text-brand">{{ i.title }}</RouterLink>
                <p class="text-ink/50">{{ currency(i.price) }} × {{ i.quantity }} {{ i.unit }}</p>
              </div>
              <p class="whitespace-nowrap text-sm font-medium">{{ currency(i.subtotal) }}</p>
            </li>
          </ul>
          <dl class="space-y-2 border-t border-sand pt-4 text-sm">
            <div class="flex justify-between"><dt class="text-ink/60">商品小計</dt><dd>{{ currency(order.subtotal) }}</dd></div>
            <div class="flex justify-between"><dt class="text-ink/60">運費</dt><dd>{{ order.shippingFee ? currency(order.shippingFee) : '免運' }}</dd></div>
            <div class="flex justify-between text-base font-medium"><dt>總計</dt><dd class="text-accent">{{ currency(order.total) }}</dd></div>
          </dl>
        </section>

        <aside class="space-y-6">
          <AtmTransferPanel v-if="showAtm" :order="order" @updated="onAtmUpdated" />
          <section class="rounded-2xl bg-white p-6 text-sm ring-1 ring-sand" aria-labelledby="od-info">
            <h2 id="od-info" class="font-medium">訂單資訊</h2>
            <dl class="mt-3 space-y-2">
              <div><dt class="text-ink/50">下單時間</dt><dd>{{ formatDate(order.createdAt) }}</dd></div>
              <div><dt class="text-ink/50">付款方式</dt><dd>{{ order.paymentMethod }}</dd></div>
              <div><dt class="text-ink/50">收件人</dt><dd>{{ order.recipient.name }}・{{ order.recipient.phone }}</dd></div>
              <div><dt class="text-ink/50">收件地址</dt><dd>{{ order.recipient.address }}</dd></div>
              <div v-if="order.note"><dt class="text-ink/50">備註</dt><dd class="whitespace-pre-line">{{ order.note }}</dd></div>
              <div v-if="order.cancelledAt"><dt class="text-ink/50">取消時間</dt><dd>{{ formatDate(order.cancelledAt) }}</dd></div>
            </dl>
          </section>
          <div class="flex flex-col gap-3">
            <button v-if="canCancel" type="button" class="btn border border-red-300 text-red-700 hover:bg-red-50" :disabled="cancelling" @click="cancel">
              {{ cancelling ? '取消中…' : '取消訂單' }}
            </button>
            <RouterLink to="/products" class="btn-primary">繼續購物</RouterLink>
            <RouterLink to="/orders" class="btn-ghost">查看所有訂單</RouterLink>
          </div>
        </aside>
      </article>
    </template>
  </div>
</template>
