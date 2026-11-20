<script setup>
import { computed } from 'vue'
import { currency } from '@/utils/format'
import { useAddToCart } from '@/composables/useAddToCart'

const props = defineProps({ product: { type: Object, required: true } })
const { addToCart, isAdding } = useAddToCart()
const soldOut = computed(() => props.product.stock <= 0)
const onSale = computed(() => props.product.originPrice > props.product.price)
</script>

<template>
  <article class="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-sand transition hover:shadow-md">
    <RouterLink :to="{ name: 'product', params: { id: product.id } }" class="relative block">
      <figure class="aspect-square overflow-hidden bg-white">
        <img :src="product.imageUrl" :alt="product.title" loading="lazy" class="h-full w-full object-contain p-2 transition duration-500 group-hover:scale-105" />
      </figure>
      <span v-if="soldOut" class="absolute left-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-xs text-white">已售完</span>
      <span v-else-if="onSale" class="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-xs text-white">特價</span>
    </RouterLink>
    <div class="flex flex-1 flex-col gap-1 p-3 sm:p-4">
      <p class="truncate text-xs text-ink/50">{{ product.brand || product.category }}</p>
      <h3 class="line-clamp-2 text-sm font-medium sm:text-base">
        <RouterLink :to="{ name: 'product', params: { id: product.id } }" class="hover:text-brand">{{ product.title }}</RouterLink>
      </h3>
      <p class="mt-auto flex flex-wrap items-baseline gap-x-2 pt-2">
        <strong class="text-accent">{{ currency(product.price) }}</strong>
        <del v-if="onSale" class="text-xs text-ink/40">{{ currency(product.originPrice) }}</del>
      </p>
      <button
        type="button"
        class="btn-outline mt-2 w-full px-3 py-2"
        :disabled="soldOut || isAdding(product.id)"
        @click="addToCart(product)"
      >
        <span v-if="isAdding(product.id)" class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
        {{ soldOut ? '已售完' : isAdding(product.id) ? '加入中…' : '加入購物車' }}
      </button>
    </div>
  </article>
</template>
