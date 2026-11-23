<script setup>
import { watch } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import ToastContainer from '@/components/common/ToastContainer.vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { session } from '@/api/session'

const auth = useAuthStore()
const cart = useCartStore()

// 登入完成後取得該會員的購物車
watch(
  () => auth.isLoggedIn,
  (loggedIn) => {
    if (loggedIn) cart.fetchCart().catch(() => {})
  },
  { immediate: true, flush: 'sync' },
)
</script>

<template>
  <p v-if="session.invalidated" role="status" class="container-page py-8">登入狀態已變更，正在更新頁面…</p>
  <div v-else class="flex min-h-screen flex-col">
    <a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2">跳到主要內容</a>
    <AppHeader />
    <main id="main" class="flex-1">
      <RouterView v-if="!$route.meta.requiresAuth || auth.isLoggedIn" :key="$route.meta.requiresAuth ? session.version : undefined" />
    </main>
    <AppFooter />
    <ToastContainer />
  </div>
</template>
