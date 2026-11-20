<script setup>
// 共用的「查無結果 / 錯誤」提示區塊
defineProps({
  type: { type: String, default: 'empty' }, // empty | error
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>
<template>
  <div class="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-sand bg-white/50 px-6 py-14 text-center" :role="type === 'error' ? 'alert' : 'status'">
    <span class="text-4xl" aria-hidden="true">{{ type === 'error' ? '⚠️' : '🔍' }}</span>
    <p class="font-medium" :class="type === 'error' ? 'text-red-700' : ''">{{ title }}</p>
    <p v-if="description" class="max-w-md text-sm text-ink/60">{{ description }}</p>
    <div class="mt-2"><slot /></div>
  </div>
</template>
