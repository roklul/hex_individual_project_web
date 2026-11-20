<script setup>
defineProps({
  categories: { type: Array, default: () => [] },
  modelValue: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <nav aria-label="商品分類">
    <ul class="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      <li>
        <button type="button" class="chip" :class="{ active: !modelValue }" :aria-pressed="!modelValue" @click="emit('update:modelValue', '')">全部</button>
      </li>
      <li v-for="c in categories" :key="c.name">
        <button type="button" class="chip" :class="{ active: modelValue === c.name }" :aria-pressed="modelValue === c.name" @click="emit('update:modelValue', c.name)">
          {{ c.name }} <span class="text-xs opacity-60">{{ c.count }}</span>
        </button>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
@reference '../../style.css';
.chip { @apply whitespace-nowrap rounded-full border border-sand bg-white px-4 py-2 text-sm transition hover:border-brand; }
.chip.active { @apply border-brand bg-brand text-cream; }
</style>
