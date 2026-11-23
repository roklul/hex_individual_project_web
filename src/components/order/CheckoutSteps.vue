<script setup>
defineProps({ current: { type: Number, required: true } })
const steps = ['購物車', '填寫資料', '訂單完成']
</script>
<template>
  <nav aria-label="結帳步驟">
    <ol class="flex items-center gap-2 text-xs sm:text-sm">
      <li v-for="(s, i) in steps" :key="s" class="flex items-center gap-2" :aria-current="i + 1 === current ? 'step' : undefined">
        <span
          class="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
          :class="i + 1 < current ? 'bg-brand/80 text-cream' : i + 1 === current ? 'bg-accent text-white' : 'bg-sand text-ink/50'"
        >{{ i + 1 < current ? '✓' : i + 1 }}</span>
        <span :class="i + 1 === current ? 'font-medium' : 'text-ink/50'">{{ s }}</span>
        <span v-if="i < steps.length - 1" class="mx-1 h-px w-6 bg-sand sm:w-10" aria-hidden="true" />
      </li>
    </ol>
  </nav>
</template>
