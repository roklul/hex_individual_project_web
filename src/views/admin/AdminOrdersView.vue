<script setup>
import { onMounted, ref } from 'vue'
import { adminApi } from '@/api'
import { getErrorMessage } from '@/api/http'
import { useToastStore } from '@/stores/toast'
import { currency } from '@/utils/format'
import AppPagination from '@/components/common/AppPagination.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import StatusMessage from '@/components/common/StatusMessage.vue'
import OrderStatusBadge from '@/components/order/OrderStatusBadge.vue'

const STATUSES = ['待付款', '處理中', '已出貨', '已完成', '已取消']
const toast = useToastStore()
const orders = ref([])
const pagination = ref({ page: 1, totalPages: 1, total: 0 })
const page = ref(1)
const loading = ref(true)
const loadError = ref('')
const busyId = ref(null)
const expanded = ref(new Set())
let seq = 0

const fmtTime = (t) => new Date(t).toLocaleString('zh-TW', { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })

async function load() {
  const id = ++seq
  loading.value = true
  loadError.value = ''
  try {
    const res = await adminApi.listOrders({ page: page.value, limit: 10 })
    if (id !== seq) return
    orders.value = res.data
    pagination.value = res.pagination
  } catch (err) {
    if (id === seq) loadError.value = getErrorMessage(err, '訂單載入失敗')
  } finally {
    if (id === seq) loading.value = false
  }
}
onMounted(load)

function changePage(p) { page.value = p; expanded.value = new Set(); load() }
function toggleDetail(id) {
  const s = new Set(expanded.value)
  s.has(id) ? s.delete(id) : s.add(id)
  expanded.value = s
}

async function changeStatus(order, event) {
  const status = event.target.value
  if (status === order.status) return
  if (status === '已取消' && !confirm(`確定要取消訂單 ${order.orderNo} 嗎？\n取消後商品庫存會補回，且無法再變更狀態。`)) {
    event.target.value = order.status
    return
  }
  busyId.value = order.id
  try {
    const res = await adminApi.updateOrderStatus(order.id, status)
    Object.assign(order, { status: res.data.status, cancelledAt: res.data.cancelledAt, updatedAt: res.data.updatedAt })
    toast.success(`${order.orderNo}：${res.message}`)
  } catch (err) {
    event.target.value = order.status
    toast.error(getErrorMessage(err, '狀態更新失敗'))
    if (err.response?.status === 400) load() // 可能已被其他人取消，重新讀取最新狀態
  } finally {
    busyId.value = null
  }
}
</script>

<template>
  <section aria-labelledby="ao-heading">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h2 id="ao-heading" class="text-lg font-medium">所有訂單 <span class="text-sm font-normal text-ink/50">共 {{ pagination.total }} 筆</span></h2>
      <button type="button" class="btn-ghost" :disabled="loading" @click="load">↻ 重新整理</button>
    </div>

    <StatusMessage v-if="loadError" type="error" title="訂單載入失敗" :description="loadError" class="mt-6">
      <button type="button" class="btn-outline" @click="load">重新載入</button>
    </StatusMessage>
    <LoadingSpinner v-else-if="loading && !orders.length" label="讀取訂單…" />
    <StatusMessage v-else-if="!orders.length" title="目前還沒有訂單" description="會員在前台下單後，訂單會出現在這裡。" class="mt-6" />

    <ul v-else class="mt-6 space-y-4" :class="{ 'opacity-60': loading }" :aria-busy="loading">
      <li v-for="o in orders" :key="o.id" class="rounded-2xl bg-white ring-1 ring-sand">
        <div class="flex flex-wrap items-center gap-x-6 gap-y-3 p-4 sm:p-5">
          <div class="min-w-0 flex-1">
            <p class="flex flex-wrap items-center gap-2">
              <span class="font-mono text-sm font-medium">{{ o.orderNo }}</span>
              <OrderStatusBadge :status="o.status" />
            </p>
            <p class="mt-1 text-xs text-ink/60">
              {{ fmtTime(o.createdAt) }}・{{ o.user?.name || '（帳號已刪除）' }}<template v-if="o.user?.email"> &lt;{{ o.user.email }}&gt;</template>
            </p>
          </div>
          <div class="text-right">
            <p class="font-medium text-accent">{{ currency(o.total) }}</p>
            <p class="text-xs text-ink/60">{{ o.items.reduce((s, i) => s + i.quantity, 0) }} 件・{{ o.paymentMethod }}</p>
          </div>
          <div class="flex w-full items-center gap-2 sm:w-auto">
            <label :for="`ao-status-${o.id}`" class="shrink-0 text-xs text-ink/60">狀態</label>
            <select
              :id="`ao-status-${o.id}`"
              :value="o.status"
              class="input py-1.5"
              :disabled="o.status === '已取消' || busyId === o.id"
              @change="changeStatus(o, $event)"
            >
              <option v-for="s in STATUSES" :key="s" :value="s">{{ s }}</option>
            </select>
            <button type="button" class="btn-ghost shrink-0 px-3 py-1.5" :aria-expanded="expanded.has(o.id)" :aria-controls="`ao-detail-${o.id}`" @click="toggleDetail(o.id)">
              {{ expanded.has(o.id) ? '收合' : '明細' }}
            </button>
          </div>
        </div>

        <div v-if="expanded.has(o.id)" :id="`ao-detail-${o.id}`" class="grid gap-6 border-t border-sand p-4 text-sm sm:p-5 md:grid-cols-2">
          <ul class="divide-y divide-sand">
            <li v-for="i in o.items" :key="i.product" class="flex gap-3 py-2">
              <img :src="i.imageUrl" :alt="i.title" class="h-12 w-12 shrink-0 rounded-lg bg-white object-contain ring-1 ring-sand" loading="lazy" />
              <div class="min-w-0 flex-1">
                <p class="line-clamp-2">{{ i.title }}</p>
                <p class="text-ink/50">{{ currency(i.price) }} × {{ i.quantity }} {{ i.unit }}</p>
              </div>
              <p class="whitespace-nowrap">{{ currency(i.subtotal) }}</p>
            </li>
          </ul>
          <div class="space-y-4">
            <dl class="grid grid-cols-[5rem_1fr] gap-y-1">
              <dt class="text-ink/60">收件人</dt><dd>{{ o.recipient.name }}</dd>
              <dt class="text-ink/60">電話</dt><dd>{{ o.recipient.phone }}</dd>
              <dt class="text-ink/60">地址</dt><dd class="break-words">{{ o.recipient.address }}</dd>
              <template v-if="o.note"><dt class="text-ink/60">備註</dt><dd class="whitespace-pre-line break-words">{{ o.note }}</dd></template>
              <template v-if="o.cancelledAt"><dt class="text-ink/60">取消時間</dt><dd>{{ fmtTime(o.cancelledAt) }}</dd></template>
            </dl>
            <dl class="space-y-1 border-t border-sand pt-3">
              <div class="flex justify-between"><dt class="text-ink/60">商品小計</dt><dd>{{ currency(o.subtotal) }}</dd></div>
              <div class="flex justify-between"><dt class="text-ink/60">運費</dt><dd>{{ o.shippingFee ? currency(o.shippingFee) : '免運' }}</dd></div>
              <div class="flex justify-between font-medium"><dt>總計</dt><dd class="text-accent">{{ currency(o.total) }}</dd></div>
            </dl>
          </div>
        </div>
      </li>
    </ul>

    <AppPagination class="mt-6" :page="pagination.page" :total-pages="pagination.totalPages" @change="changePage" />
  </section>
</template>
