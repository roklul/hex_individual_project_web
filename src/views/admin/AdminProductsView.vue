<script setup>
import { nextTick, onMounted, reactive, ref } from 'vue'
import { adminApi, productApi } from '@/api'
import { getErrorMessage } from '@/api/http'
import { useToastStore } from '@/stores/toast'
import { currency } from '@/utils/format'
import AppPagination from '@/components/common/AppPagination.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import StatusMessage from '@/components/common/StatusMessage.vue'
import ProductFormDialog from '@/components/admin/ProductFormDialog.vue'

const toast = useToastStore()
const categories = ref([])
const products = ref([])
const pagination = ref({ page: 1, totalPages: 1, total: 0 })
const loading = ref(true)
const loadError = ref('')
const query = reactive({ page: 1, keyword: '', category: '' })
const keywordInput = ref('')
const busyId = ref(null)
const editing = ref(null)
const formDialog = ref(null)
let seq = 0

async function load() {
  const id = ++seq
  loading.value = true
  loadError.value = ''
  try {
    const res = await adminApi.listProducts({ page: query.page, limit: 10, keyword: query.keyword || undefined, category: query.category || undefined })
    if (id !== seq) return
    products.value = res.data
    pagination.value = res.pagination
    // 刪除最後一頁的最後一筆後，退回上一頁
    if (!res.data.length && query.page > 1) { query.page = res.pagination.totalPages; return load() }
  } catch (err) {
    if (id === seq) loadError.value = getErrorMessage(err, '商品載入失敗')
  } finally {
    if (id === seq) loading.value = false
  }
}

onMounted(async () => {
  load()
  try { categories.value = (await productApi.categories()).map((c) => c.name) } catch { /* 表單會提示需選分類 */ }
})

function search() { query.keyword = keywordInput.value.trim(); query.page = 1; load() }
function changeCategory() { query.page = 1; load() }
function changePage(p) { query.page = p; load() }

async function openForm(product = null) {
  editing.value = product
  await nextTick()
  formDialog.value.open()
}
function onSaved(res) {
  toast.success(res.message)
  if (!editing.value) query.page = 1
  load()
}

async function toggle(p) {
  busyId.value = p.id
  try {
    const res = await adminApi.updateProduct(p.id, { isEnabled: !p.isEnabled })
    Object.assign(p, res.data)
    toast.success(p.isEnabled ? `「${p.title}」已上架` : `「${p.title}」已下架`)
  } catch (err) {
    toast.error(getErrorMessage(err, '更新失敗'))
  } finally {
    busyId.value = null
  }
}

async function remove(p) {
  if (!confirm(`確定要刪除「${p.title}」嗎？\n刪除後無法復原，也會從所有購物車移除。已成立的訂單不受影響。`)) return
  busyId.value = p.id
  try {
    const res = await adminApi.deleteProduct(p.id)
    toast.success(res.message)
    await load()
  } catch (err) {
    toast.error(getErrorMessage(err, '刪除失敗'))
  } finally {
    busyId.value = null
  }
}
</script>

<template>
  <section aria-labelledby="ap-heading">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h2 id="ap-heading" class="text-lg font-medium">商品列表 <span class="text-sm font-normal text-ink/50">共 {{ pagination.total }} 筆（含已下架）</span></h2>
      <button type="button" class="btn-primary" @click="openForm()">＋ 新增商品</button>
    </div>

    <div class="mt-4 flex flex-col gap-3 sm:flex-row">
      <form role="search" class="flex flex-1 gap-2" @submit.prevent="search">
        <label for="ap-keyword" class="sr-only">搜尋商品</label>
        <input id="ap-keyword" v-model="keywordInput" type="search" class="input" placeholder="搜尋名稱、品牌或簡述" maxlength="50" />
        <button type="submit" class="btn-outline shrink-0">搜尋</button>
      </form>
      <label for="ap-category" class="sr-only">分類</label>
      <select id="ap-category" v-model="query.category" class="input sm:w-56" @change="changeCategory">
        <option value="">全部分類</option>
        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
      </select>
    </div>

    <StatusMessage v-if="loadError" type="error" title="商品載入失敗" :description="loadError" class="mt-6">
      <button type="button" class="btn-outline" @click="load">重新載入</button>
    </StatusMessage>
    <LoadingSpinner v-else-if="loading && !products.length" label="讀取商品…" />
    <StatusMessage v-else-if="!products.length" title="沒有符合的商品" description="換個關鍵字或分類，或新增一筆商品。" class="mt-6" />

    <div v-else class="mt-6 overflow-hidden rounded-2xl bg-white ring-1 ring-sand" :class="{ 'opacity-60': loading }" :aria-busy="loading">
      <table class="w-full text-sm">
        <thead class="hidden bg-sand/50 text-left text-xs text-ink/60 lg:table-header-group">
          <tr>
            <th scope="col" class="px-4 py-3 font-medium">商品</th>
            <th scope="col" class="px-4 py-3 font-medium">分類</th>
            <th scope="col" class="px-4 py-3 text-right font-medium">售價</th>
            <th scope="col" class="px-4 py-3 text-right font-medium">庫存</th>
            <th scope="col" class="px-4 py-3 font-medium">狀態</th>
            <th scope="col" class="px-4 py-3 text-right font-medium">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-sand">
          <tr v-for="p in products" :key="p.id" class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 p-4 lg:table-row lg:p-0">
            <td class="row-span-3 lg:px-4 lg:py-3">
              <div class="flex items-center gap-3">
                <img :src="p.imageUrl" :alt="p.title" class="h-14 w-14 shrink-0 rounded-lg bg-white object-contain ring-1 ring-sand" loading="lazy" />
                <div class="hidden min-w-0 lg:block">
                  <p class="line-clamp-2 font-medium">{{ p.title }}</p>
                  <p v-if="p.brand" class="text-xs text-ink/50">{{ p.brand }}</p>
                </div>
              </div>
            </td>
            <td class="lg:hidden"><p class="line-clamp-2 font-medium">{{ p.title }}</p></td>
            <td class="text-xs text-ink/60 lg:whitespace-nowrap lg:px-4 lg:py-3 lg:text-sm">{{ p.category }}</td>
            <td class="lg:px-4 lg:py-3 lg:text-right">
              <span class="whitespace-nowrap font-medium">{{ currency(p.price) }}</span>
              <span class="ml-3 text-xs lg:hidden" :class="p.stock ? 'text-ink/60' : 'text-red-700'">庫存 {{ p.stock }}</span>
            </td>
            <td class="hidden lg:table-cell lg:px-4 lg:py-3 lg:text-right" :class="p.stock ? '' : 'text-red-700'">{{ p.stock }}</td>
            <td class="col-span-2 lg:px-4 lg:py-3">
              <span class="inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium" :class="p.isEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'">{{ p.isEnabled ? '上架中' : '已下架' }}</span>
            </td>
            <td class="col-span-2 lg:px-4 lg:py-3">
              <div class="flex flex-wrap gap-1 lg:flex-nowrap lg:justify-end">
                <button type="button" class="btn-ghost whitespace-nowrap px-3 py-1.5" :disabled="busyId === p.id" @click="openForm(p)">編輯</button>
                <button type="button" class="btn-ghost whitespace-nowrap px-3 py-1.5" :disabled="busyId === p.id" @click="toggle(p)">{{ p.isEnabled ? '下架' : '上架' }}</button>
                <button type="button" class="btn-ghost whitespace-nowrap px-3 py-1.5 text-red-700 hover:bg-red-50" :disabled="busyId === p.id" @click="remove(p)">刪除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AppPagination class="mt-6" :page="pagination.page" :total-pages="pagination.totalPages" @change="changePage" />

    <ProductFormDialog ref="formDialog" :product="editing" :categories="categories" @saved="onSaved" />
  </section>
</template>
