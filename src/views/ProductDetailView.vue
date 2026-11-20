<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { productApi } from '@/api'
import { getErrorMessage } from '@/api/http'
import { currency } from '@/utils/format'
import { useAddToCart } from '@/composables/useAddToCart'
import { useCartStore } from '@/stores/cart'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import StatusMessage from '@/components/common/StatusMessage.vue'
import QuantityStepper from '@/components/common/QuantityStepper.vue'

const route = useRoute()
const cart = useCartStore()
const { addToCart, isAdding } = useAddToCart()

const product = ref(null)
const loading = ref(true)
const error = ref('')
const notFound = ref(false)
const qty = ref(1)
const activeImage = ref('')

const images = computed(() => (product.value ? [product.value.imageUrl, ...(product.value.imagesUrl || [])] : []))
const inCart = computed(() => cart.items.find((i) => i.productId === product.value?.id)?.quantity || 0)
const maxQty = computed(() => Math.max(0, Math.min(product.value?.stock ?? 0, 99) - inCart.value))
const onSale = computed(() => product.value?.originPrice > product.value?.price)

async function load() {
  loading.value = true
  error.value = ''
  notFound.value = false
  try {
    product.value = await productApi.get(route.params.id)
    activeImage.value = product.value.imageUrl
    qty.value = 1
    document.title = `${product.value.title}｜EMMA 電子零件`
  } catch (err) {
    const s = err.response?.status
    if (s === 404 || s === 400) notFound.value = true
    else error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}
watch(() => route.params.id, (id) => id && load(), { immediate: true })

async function add() {
  if (await addToCart(product.value, qty.value)) qty.value = 1
}
</script>

<template>
  <div class="container-page py-8 sm:py-12">
    <LoadingSpinner v-if="loading" label="商品載入中…" />
    <StatusMessage v-else-if="notFound" title="找不到這件商品" description="商品可能已下架或網址有誤。">
      <RouterLink to="/products" class="btn-outline">回到商品列表</RouterLink>
    </StatusMessage>
    <StatusMessage v-else-if="error" type="error" title="商品載入失敗" :description="error">
      <button type="button" class="btn-outline" @click="load">重新載入</button>
    </StatusMessage>

    <article v-else-if="product" class="grid gap-8 md:grid-cols-2 md:gap-12">
      <nav aria-label="麵包屑" class="text-sm text-ink/50 md:col-span-2">
        <ol class="flex flex-wrap gap-2">
          <li><RouterLink to="/" class="hover:text-brand">首頁</RouterLink></li><li aria-hidden="true">/</li>
          <li><RouterLink :to="{ name: 'products', query: { category: product.category } }" class="hover:text-brand">{{ product.category }}</RouterLink></li><li aria-hidden="true">/</li>
          <li aria-current="page" class="text-ink/70">{{ product.title }}</li>
        </ol>
      </nav>

      <section aria-label="商品圖片">
        <figure class="overflow-hidden rounded-2xl bg-white ring-1 ring-sand">
          <img :src="activeImage" :alt="product.title" class="aspect-square w-full object-contain p-4" />
        </figure>
        <ul v-if="images.length > 1" class="mt-3 flex gap-3">
          <li v-for="src in images" :key="src">
            <button type="button" class="overflow-hidden rounded-xl ring-2 transition" :class="activeImage === src ? 'ring-brand' : 'ring-transparent opacity-70 hover:opacity-100'" :aria-label="`檢視圖片`" @click="activeImage = src">
              <img :src="src" alt="" class="h-16 w-16 object-cover sm:h-20 sm:w-20" />
            </button>
          </li>
        </ul>
      </section>

      <section aria-labelledby="product-title" class="flex flex-col">
        <p class="text-sm text-accent">{{ product.category }}<span v-if="product.brand" class="text-ink/50"> ・ {{ product.brand }}</span></p>
        <h1 id="product-title" class="mt-1 font-serif text-2xl text-brand sm:text-3xl">{{ product.title }}</h1>
        <p class="mt-4 flex items-baseline gap-3">
          <strong class="text-2xl text-accent">{{ currency(product.price) }}</strong>
          <del v-if="onSale" class="text-ink/40">{{ currency(product.originPrice) }}</del>
        </p>
        <p class="mt-4 text-ink/70">{{ product.description }}</p>

        <div class="mt-6 space-y-4 rounded-2xl bg-white p-5 ring-1 ring-sand">
          <p class="text-sm" :class="product.stock > 0 ? 'text-ink/60' : 'text-red-700'">
            {{ product.stock > 0 ? `庫存 ${product.stock} ${product.unit}` : '目前已售完' }}
            <span v-if="inCart" class="ml-2 text-brand">（購物車已有 {{ inCart }} {{ product.unit }}）</span>
          </p>
          <div v-if="product.stock > 0" class="flex flex-wrap items-center gap-3">
            <QuantityStepper v-model="qty" :max="Math.max(maxQty, 1)" :disabled="maxQty === 0" />
            <button type="button" class="btn-primary flex-1 sm:flex-none sm:px-8" :disabled="maxQty === 0 || isAdding(product.id)" @click="add">
              <span v-if="isAdding(product.id)" class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
              {{ maxQty === 0 ? '已達購買上限' : isAdding(product.id) ? '加入中…' : '加入購物車' }}
            </button>
          </div>
        </div>

        <section class="mt-8" aria-labelledby="detail-title">
          <h2 id="detail-title" class="font-medium">商品說明</h2>
          <p class="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink/70">{{ product.content }}</p>
        </section>
      </section>
    </article>
  </div>
</template>
