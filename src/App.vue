<script setup>
import { watch } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import ToastContainer from '@/components/common/ToastContainer.vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const auth = useAuthStore()
const cart = useCartStore()

// 登入後同步購物車；登出後清空
watch(
  () => auth.isLoggedIn,
  (loggedIn) => {
    if (loggedIn) cart.fetchCart().catch(() => {})
    else cart.reset()
  },
  { immediate: true },
)
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2">跳到主要內容</a>
    <AppHeader />
    <main id="main" class="flex-1">
      <RouterView />
    </main>
    <AppFooter />
    <ToastContainer />
  </div>
</template>
