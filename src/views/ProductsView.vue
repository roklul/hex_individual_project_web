<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productApi } from '@/api'
import { getErrorMessage } from '@/api/http'
import ProductGrid from '@/components/product/ProductGrid.vue'
import CategoryFilter from '@/components/product/CategoryFilter.vue'
import SearchBar from '@/components/product/SearchBar.vue'
import AppPagination from '@/components/common/AppPagination.vue'
import StatusMessage from '@/components/common/StatusMessage.vue'

const route = useRoute()
const router = useRouter()
const listTop = ref(null)

const products = ref([])
const pagination = ref({ page: 1, totalPages: 1, total: 0 })
const categories = ref([])
const loading = ref(true)
const error = ref('')

// 篩選條件以網址 query 為唯一來源：可分享、可上一頁、重新整理不遺失
const query = computed(() => ({
  page: Math.max(1, parseInt(route.query.page) || 1),
  category: route.query.category || '',
  keyword: route.query.keyword || '',
  sort: route.query.sort || 'newest',
}))

function updateQuery(patch) {
  const next = { ...query.value, ...patch }
  if (!('page' in patch)) next.page = 1
  router.push({
    query: {
      ...(next.page > 1 && { page: next.page }),
      ...(next.category && { category: next.category }),
      ...(next.keyword && { keyword: next.keyword }),
      ...(next.sort !== 'newest' && { sort: next.sort }),
    },
  })
}

let controller
async function load() {
  controller?.abort()
  controller = new AbortController()
  loading.value = true
  error.value = ''
  try {
    const { page, category, keyword, sort } = query.value
    const res = await productApi.list({ page, limit: 12, category: category || undefined, keyword: keyword || undefined, sort }, { signal: controller.signal })
    products.value = res.data
    pagination.value = res.pagination
    if (page > res.pagination.totalPages) updateQuery({ page: res.pagination.totalPages })
  } catch (err) {
    if (err.code === 'ERR_CANCELED') return
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}

function changePage(p) {
  updateQuery({ page: p })
  listTop.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

watch(query, load, { deep: true })
onMounted(async () => {
  load()
  try {
    categories.value = await productApi.categories()
  } catch {
    /* 分類載入失敗不影響列表 */
  }
})

const hasFilter = computed(() => query.value.category || query.value.keyword)
const heading = computed(() => query.value.category || '全部商品')
</script>

<template>
  <div class="container-page py-8 sm:py-12">
    <header ref="listTop" class="scroll-mt-20">
      <nav aria-label="麵包屑" class="text-sm text-ink/50">
        <ol class="flex gap-2"><li><RouterLink to="/" class="hover:text-brand">首頁</RouterLink></li><li aria-hidden="true">/</li><li aria-current="page">商品列表</li></ol>
      </nav>
      <h1 class="mt-2 font-serif text-3xl text-brand">{{ heading }}</h1>
    </header>

    <section aria-label="篩選條件" class="mt-6 space-y-4">
      <CategoryFilter :categories="categories" :model-value="query.category" @update:model-value="updateQuery({ category: $event })" />
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar :model-value="query.keyword" @update:model-value="updateQuery({ keyword: $event })" />
        <div class="flex items-center justify-between gap-3 sm:justify-end">
          <p class="text-sm text-ink/60" aria-live="polite">
            <template v-if="!loading && !error">共 {{ pagination.total }} 件商品</template>
          </p>
          <label class="flex items-center gap-2 text-sm">
            <span class="text-ink/60">排序</span>
            <select class="input w-auto py-2" :value="query.sort" @change="updateQuery({ sort: $event.target.value })">
              <option value="newest">最新上架</option>
              <option value="price_asc">價格低到高</option>
              <option value="price_desc">價格高到低</option>
            </select>
          </label>
        </div>
      </div>
    </section>

    <section aria-label="商品列表" class="mt-8">
      <StatusMessage v-if="error" type="error" title="商品載入失敗" :description="error">
        <button type="button" class="btn-outline" @click="load">重新載入</button>
      </StatusMessage>
      <StatusMessage
        v-else-if="!loading && products.length === 0"
        title="查無符合條件的商品"
        :description="query.keyword ? `找不到與「${query.keyword}」相關的商品，換個關鍵字試試？` : '此分類目前沒有商品'"
      >
        <button v-if="hasFilter" type="button" class="btn-outline" @click="router.push({ name: 'products' })">清除篩選條件</button>
      </StatusMessage>
      <template v-else>
        <ProductGrid :products="products" :loading="loading" :skeleton-count="12" />
        <AppPagination v-if="!loading" class="mt-10" :page="pagination.page" :total-pages="pagination.totalPages" @change="changePage" />
      </template>
    </section>
  </div>
</template>
