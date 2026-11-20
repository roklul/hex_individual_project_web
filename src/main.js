import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { setUnauthorizedHandler } from './api/http'
import { useAuthStore } from './stores/auth'
import { useCartStore } from './stores/cart'
import { useToastStore } from './stores/toast'
import './style.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

// Token 失效（過期或被竄改）時：登出、清空購物車並導向登入頁
setUnauthorizedHandler(() => {
  const auth = useAuthStore(pinia)
  if (!auth.token) return
  auth.logout()
  useCartStore(pinia).reset()
  useToastStore(pinia).error('登入已失效，請重新登入')
  const current = router.currentRoute.value
  if (current.meta.requiresAuth) router.push({ name: 'login', query: { redirect: current.fullPath } })
})

app.mount('#app')
