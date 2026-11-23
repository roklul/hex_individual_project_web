<script setup>
const props = defineProps({ status: { type: String, required: true } })
const styles = {
  待付款: 'bg-amber-100 text-amber-800',
  處理中: 'bg-sky-100 text-sky-800',
  已出貨: 'bg-indigo-100 text-indigo-800',
  已完成: 'bg-emerald-100 text-emerald-800',
  已取消: 'bg-gray-200 text-gray-600',
}
</script>
<template>
  <span class="inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium" :class="styles[props.status] || 'bg-sand'">{{ status }}</span>
</template>
