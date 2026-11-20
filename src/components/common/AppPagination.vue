<script setup>
import { computed } from 'vue'

const props = defineProps({
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true },
})
const emit = defineEmits(['change'])

// 頁碼過多時顯示省略號：1 … 4 5 6 … 10
const pages = computed(() => {
  const { page, totalPages: n } = props
  if (n <= 7) return Array.from({ length: n }, (_, i) => i + 1)
  const set = new Set([1, n, page - 1, page, page + 1].filter((p) => p >= 1 && p <= n))
  const sorted = [...set].sort((a, b) => a - b)
  return sorted.flatMap((p, i) => (i && p - sorted[i - 1] > 1 ? ['…', p] : [p]))
})
const go = (p) => p >= 1 && p <= props.totalPages && p !== props.page && emit('change', p)
</script>

<template>
  <nav v-if="totalPages > 1" aria-label="分頁" class="flex justify-center">
    <ul class="flex items-center gap-1 text-sm">
      <li>
        <button type="button" class="rounded-full px-3 py-2 hover:bg-sand disabled:opacity-30" :disabled="page <= 1" @click="go(page - 1)">
          <span aria-hidden="true">‹</span><span class="sr-only">上一頁</span>
        </button>
      </li>
      <li v-for="(p, i) in pages" :key="i">
        <span v-if="p === '…'" class="px-2 text-ink/40">…</span>
        <button
          v-else
          type="button"
          class="h-9 min-w-9 rounded-full px-2"
          :class="p === page ? 'bg-brand text-cream' : 'hover:bg-sand'"
          :aria-current="p === page ? 'page' : undefined"
          @click="go(p)"
        >{{ p }}</button>
      </li>
      <li>
        <button type="button" class="rounded-full px-3 py-2 hover:bg-sand disabled:opacity-30" :disabled="page >= totalPages" @click="go(page + 1)">
          <span aria-hidden="true">›</span><span class="sr-only">下一頁</span>
        </button>
      </li>
    </ul>
  </nav>
</template>
