<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ modelValue: { type: String, default: '' } })
const emit = defineEmits(['update:modelValue'])
const draft = ref(props.modelValue)
watch(() => props.modelValue, (v) => (draft.value = v))

let timer
watch(draft, (v) => {
  clearTimeout(timer)
  timer = setTimeout(() => v.trim() !== props.modelValue && emit('update:modelValue', v.trim()), 450)
})
function submit() {
  clearTimeout(timer)
  emit('update:modelValue', draft.value.trim())
}
</script>

<template>
  <form role="search" class="relative w-full sm:max-w-xs" @submit.prevent="submit">
    <label for="product-search" class="sr-only">搜尋商品</label>
    <input id="product-search" v-model="draft" type="search" maxlength="50" class="input rounded-full pl-10" placeholder="搜尋型號、品牌或名稱" />
    <svg class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" /><path stroke-linecap="round" d="m20 20-3.5-3.5" />
    </svg>
  </form>
</template>
