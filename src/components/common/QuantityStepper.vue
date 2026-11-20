<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Number, required: true },
  min: { type: Number, default: 1 },
  max: { type: Number, default: 99 },
  disabled: Boolean,
  label: { type: String, default: '數量' },
})
const emit = defineEmits(['update:modelValue'])
const draft = ref(String(props.modelValue))
watch(() => props.modelValue, (v) => (draft.value = String(v)))

function commit(v) {
  const n = Math.trunc(Number(v))
  if (!Number.isFinite(n)) return (draft.value = String(props.modelValue))
  const clamped = Math.min(Math.max(n, props.min), Math.max(props.max, props.min))
  draft.value = String(clamped)
  if (clamped !== props.modelValue) emit('update:modelValue', clamped)
}
</script>

<template>
  <div class="inline-flex items-center rounded-full border border-sand bg-white" role="group" :aria-label="label">
    <button type="button" class="h-9 w-9 rounded-full text-lg hover:bg-sand disabled:opacity-30" :disabled="disabled || modelValue <= min" aria-label="減少數量" @click="commit(modelValue - 1)">−</button>
    <input
      v-model="draft"
      type="number"
      inputmode="numeric"
      class="w-12 bg-transparent text-center text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      :min="min"
      :max="max"
      :disabled="disabled"
      :aria-label="label"
      @change="commit(draft)"
      @keydown.enter.prevent="commit(draft)"
    />
    <button type="button" class="h-9 w-9 rounded-full text-lg hover:bg-sand disabled:opacity-30" :disabled="disabled || modelValue >= max" aria-label="增加數量" @click="commit(modelValue + 1)">＋</button>
  </div>
</template>
