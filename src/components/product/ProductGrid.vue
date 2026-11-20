<script setup>
import ProductCard from './ProductCard.vue'
defineProps({
  products: { type: Array, default: () => [] },
  loading: Boolean,
  skeletonCount: { type: Number, default: 8 },
})
</script>

<template>
  <ul v-if="loading" class="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4" aria-busy="true" aria-label="商品載入中">
    <li v-for="n in skeletonCount" :key="n" class="animate-pulse overflow-hidden rounded-2xl bg-white ring-1 ring-sand">
      <div class="aspect-square bg-sand" />
      <div class="space-y-2 p-4">
        <div class="h-3 w-1/3 rounded bg-sand" />
        <div class="h-4 w-4/5 rounded bg-sand" />
        <div class="h-4 w-1/2 rounded bg-sand" />
      </div>
    </li>
  </ul>
  <ul v-else class="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
    <li v-for="p in products" :key="p.id" class="flex"><ProductCard :product="p" class="w-full" /></li>
  </ul>
</template>
