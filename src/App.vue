<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StatusMessage from '@/components/common/StatusMessage.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import ToastContainer from '@/components/common/ToastContainer.vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { session } from '@/api/session'

const auth = useAuthStore()
const cart = useCartStore()
const route = useRoute()
const router = useRouter()
const retrying = ref(false)

async function retryConnection() {
  retrying.value = true
  await auth.init()
  retrying.value = false
  // 連上後發現登入已失效：改導向登入頁；仍連不上則繼續顯示錯誤
  if (!auth.isLoggedIn && !auth.offline) router.replace({ name: 'login', query: { redirect: route.fullPath } })
}

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
      <div v-else-if="auth.offline" class="container-page py-12">
        <StatusMessage type="error" title="暫時連不上伺服器" description="伺服器可能正在啟動，請稍候幾秒再試。你的登入狀態仍保留著。">
          <button type="button" class="btn-primary" :disabled="retrying" @click="retryConnection">{{ retrying ? '連線中…' : '重新連線' }}</button>
        </StatusMessage>
      </div>
    </main>
    <AppFooter />
    <ToastContainer />
  </div>
</template>
