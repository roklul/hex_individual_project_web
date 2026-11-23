<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { orderApi } from '@/api'
import { getErrorMessage } from '@/api/http'
import { currency } from '@/utils/format'
import OrderStatusBadge from '@/components/order/OrderStatusBadge.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import StatusMessage from '@/components/common/StatusMessage.vue'
import AppPagination from '@/components/common/AppPagination.vue'

const route = useRoute()
const router = useRouter()
const orders = ref([])
const pagination = ref({ page: 1, totalPages: 1, total: 0 })
const loading = ref(true)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await orderApi.list({ page: Number(route.query.page) || 1, limit: 10 })
    orders.value = res.data
    pagination.value = res.pagination
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}
watch(() => route.query.page, load, { immediate: true })
const formatDate = (d) => new Date(d).toLocaleDateString('zh-TW')
</script>

<template>
  <div class="container-page py-8 sm:py-12">
    <h1 class="font-serif text-3xl text-brand">我的訂單</h1>

    <LoadingSpinner v-if="loading" label="訂單載入中…" />
    <StatusMessage v-else-if="error" type="error" title="訂單載入失敗" :description="error" class="mt-8">
      <button type="button" class="btn-outline" @click="load">重新載入</button>
    </StatusMessage>
    <StatusMessage v-else-if="orders.length === 0" title="還沒有任何訂單" description="挑選需要的零件，結帳後就能在這裡追蹤訂單狀態。" class="mt-8">
      <RouterLink to="/products" class="btn-primary">開始購物</RouterLink>
    </StatusMessage>

    <template v-else>
      <ul class="mt-8 space-y-4">
        <li v-for="o in orders" :key="o.id">
          <article class="rounded-2xl bg-white p-5 ring-1 ring-sand transition hover:ring-brand">
            <RouterLink :to="{ name: 'order', params: { id: o.id } }" class="block">
              <header class="flex flex-wrap items-center justify-between gap-2">
                <h2 class="font-medium">{{ o.orderNo }}</h2>
                <OrderStatusBadge :status="o.status" />
              </header>
              <div class="mt-3 flex items-center gap-2">
                <img v-for="i in o.items.slice(0, 4)" :key="i.product" :src="i.imageUrl" :alt="i.title" class="h-12 w-12 rounded-lg bg-white object-contain ring-1 ring-sand" />
                <span v-if="o.items.length > 4" class="text-sm text-ink/50">+{{ o.items.length - 4 }}</span>
              </div>
              <footer class="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-ink/60">
                <span>{{ formatDate(o.createdAt) }}・{{ o.items.reduce((s, i) => s + i.quantity, 0) }} 件・{{ o.paymentMethod }}</span>
                <strong class="text-base text-accent">{{ currency(o.total) }}</strong>
              </footer>
            </RouterLink>
          </article>
        </li>
      </ul>
      <AppPagination class="mt-8" :page="pagination.page" :total-pages="pagination.totalPages" @change="(p) => router.push({ query: { page: p } })" />
    </template>
  </div>
</template>
