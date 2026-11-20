<script setup>
import { computed } from 'vue'
import QuantityStepper from '@/components/common/QuantityStepper.vue'
import { currency } from '@/utils/format'

const props = defineProps({
  item: { type: Object, required: true },
  pending: Boolean,
})
const emit = defineEmits(['update', 'remove'])
const p = computed(() => props.item.product)
</script>

<template>
  <article class="flex gap-3 py-4 sm:gap-4" :class="{ 'opacity-60': pending }" :aria-busy="pending">
    <RouterLink :to="{ name: 'product', params: { id: p.id } }" class="shrink-0">
      <img :src="p.imageUrl" :alt="p.title" class="h-20 w-20 rounded-xl bg-white object-contain ring-1 ring-sand sm:h-24 sm:w-24" />
    </RouterLink>
    <div class="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
      <div class="min-w-0 flex-1">
        <h3 class="truncate font-medium">
          <RouterLink :to="{ name: 'product', params: { id: p.id } }" class="hover:text-brand">{{ p.title }}</RouterLink>
        </h3>
        <p class="text-sm text-ink/60">{{ currency(p.price) }} / {{ p.unit }}</p>
        <p v-if="!item.available" class="text-sm text-red-700">此商品已售完或下架，結帳時不列入計算</p>
        <p v-else-if="item.quantity > item.maxQuantity" class="text-sm text-red-700">庫存僅剩 {{ item.maxQuantity }}，請調整數量</p>
      </div>
      <div class="flex items-center justify-between gap-4 sm:justify-end">
        <QuantityStepper
          :model-value="item.quantity"
          :max="Math.max(item.maxQuantity, 1)"
          :disabled="pending || !item.available"
          :label="`${p.title} 數量`"
          @update:model-value="emit('update', $event)"
        />
        <strong class="whitespace-nowrap text-right text-accent sm:w-24">{{ currency(item.subtotal) }}</strong>
        <button type="button" class="rounded-full p-2 text-ink/50 hover:bg-sand hover:text-red-700" :disabled="pending" :aria-label="`移除 ${p.title}`" @click="emit('remove')">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </button>
      </div>
    </div>
  </article>
</template>
