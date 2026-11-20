<script setup>
import { onMounted, ref } from 'vue'
import { productApi } from '@/api'
import { getErrorMessage } from '@/api/http'
import ProductGrid from '@/components/product/ProductGrid.vue'
import StatusMessage from '@/components/common/StatusMessage.vue'

const latest = ref([])
const categories = ref([])
const loading = ref(true)
const error = ref('')

const icons = { '微控制器・處理器': '🧠', '邏輯・介面IC': '🔲', '類比・驅動IC': '📈', '電源・穩壓': '🔋', '光耦・繼電器': '💡', '開關・連接器': '🔌', '模組・配件': '🧰' }

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [list, cats] = await Promise.all([productApi.list({ limit: 8 }), productApi.categories()])
    latest.value = list.data
    categories.value = cats
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}
onMounted(load)
</script>

<template>
  <section class="relative overflow-hidden bg-brand text-cream" aria-labelledby="hero-title">
    <div class="hero-grid pointer-events-none absolute inset-0 opacity-20" aria-hidden="true" />
    <div class="container-page relative grid items-center gap-10 py-14 md:grid-cols-2 md:py-24">
      <div>
        <p class="text-sm tracking-[0.3em] text-accent">EMMA COLLECTION · ELECTRONIC PARTS</p>
        <h1 id="hero-title" class="mt-4 text-3xl font-bold leading-tight sm:text-5xl">庫存電子零件<br />小量也能<span class="text-accent">即時採購</span></h1>
        <p class="mt-5 max-w-md text-cream/75">IC、穩壓器、光耦合器、繼電器、連接器到功能模組，原廠庫存實拍出貨，維修、打樣、小批量生產都適用。</p>
        <div class="mt-8 flex flex-wrap gap-3">
          <RouterLink to="/products" class="btn bg-accent text-white hover:bg-accent/90">瀏覽全部零件</RouterLink>
          <a href="#categories" class="btn border border-cream/40 text-cream hover:bg-cream/10">依分類找</a>
        </div>
      </div>
      <figure class="hidden grid-cols-2 gap-3 md:grid" aria-hidden="true">
        <img v-for="(p, i) in latest.slice(0, 4)" :key="p.id" :src="p.imageUrl" alt="" class="aspect-square w-full rounded-2xl bg-white object-contain p-3" :class="{ 'translate-y-6': i % 2 }" />
      </figure>
    </div>
  </section>

  <section id="categories" class="container-page py-14" aria-labelledby="cat-title">
    <h2 id="cat-title" class="font-serif text-2xl text-brand">依分類找零件</h2>
    <ul class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      <li v-for="c in categories" :key="c.name">
        <RouterLink :to="{ name: 'products', query: { category: c.name } }" class="flex flex-col items-center gap-2 rounded-2xl bg-white p-5 ring-1 ring-sand transition hover:-translate-y-0.5 hover:ring-brand">
          <span class="text-3xl" aria-hidden="true">{{ icons[c.name] || '🛍️' }}</span>
          <span class="font-medium">{{ c.name }}</span>
          <span class="text-xs text-ink/50">{{ c.count }} 件商品</span>
        </RouterLink>
      </li>
    </ul>
  </section>

  <section class="container-page pb-6" aria-labelledby="new-title">
    <div class="flex items-end justify-between">
      <h2 id="new-title" class="font-serif text-2xl text-brand">最新上架</h2>
      <RouterLink to="/products" class="text-sm text-accent hover:underline">看全部零件 →</RouterLink>
    </div>
    <div class="mt-6">
      <StatusMessage v-if="error" type="error" title="商品載入失敗" :description="error">
        <button type="button" class="btn-outline" @click="load">重新載入</button>
      </StatusMessage>
      <ProductGrid v-else :products="latest" :loading="loading" />
    </div>
  </section>

  <section class="container-page py-14" aria-label="服務特色">
    <ul class="grid gap-4 rounded-2xl bg-brand p-8 text-cream sm:grid-cols-3">
      <li><h3 class="font-medium">📷 實拍出貨</h3><p class="mt-1 text-sm text-cream/70">每件商品皆為實品拍攝，出貨前核對型號</p></li>
      <li><h3 class="font-medium">🔢 小量可購</h3><p class="mt-1 text-sm text-cream/70">單顆起售，維修、打樣不必整盤採購</p></li>
      <li><h3 class="font-medium">🚚 滿 NT$500 免運</h3><p class="mt-1 text-sm text-cream/70">工作日快速出貨，有問題隨時聯繫</p></li>
    </ul>
  </section>
</template>

<style scoped>
.hero-grid {
  background-image: linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px);
  background-size: 32px 32px;
}
</style>
