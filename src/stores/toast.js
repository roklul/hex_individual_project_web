import { defineStore } from 'pinia'
import { ref } from 'vue'

let seq = 0

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])

  function push(message, type = 'success', duration = 3000) {
    const id = ++seq
    toasts.value.push({ id, message, type })
    if (duration) setTimeout(() => dismiss(id), duration)
    return id
  }
  function dismiss(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return {
    toasts,
    dismiss,
    success: (m) => push(m, 'success'),
    error: (m) => push(m, 'error', 4500),
    info: (m) => push(m, 'info'),
  }
})
