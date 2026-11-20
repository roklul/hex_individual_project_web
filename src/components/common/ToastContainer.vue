<script setup>
import { useToastStore } from '@/stores/toast'
const toast = useToastStore()
const styles = {
  success: 'bg-brand text-cream',
  error: 'bg-red-700 text-white',
  info: 'bg-ink text-cream',
}
const icons = { success: '✓', error: '!', info: 'i' }
</script>

<template>
  <section aria-live="polite" aria-label="通知" class="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 sm:left-auto sm:right-4 sm:items-end">
    <TransitionGroup name="toast">
      <output
        v-for="t in toast.toasts"
        :key="t.id"
        :role="t.type === 'error' ? 'alert' : 'status'"
        :class="['pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl px-4 py-3 text-sm shadow-lg', styles[t.type]]"
      >
        <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold" aria-hidden="true">{{ icons[t.type] }}</span>
        <span class="flex-1">{{ t.message }}</span>
        <button type="button" class="opacity-70 hover:opacity-100" aria-label="關閉通知" @click="toast.dismiss(t.id)">✕</button>
      </output>
    </TransitionGroup>
  </section>
</template>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(8px); }
</style>
