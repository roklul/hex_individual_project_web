<script setup>
defineProps({ label: { type: String, default: '載入中…' } })
</script>
<template>
  <div class="flex flex-col items-center justify-center gap-3 py-16 text-ink/60" role="status">
    <span class="h-8 w-8 animate-spin rounded-full border-2 border-sand border-t-brand" aria-hidden="true" />
    <span class="text-sm">{{ label }}</span>
  </div>
</template>
