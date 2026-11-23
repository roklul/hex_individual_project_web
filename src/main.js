import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { setUnauthorizedHandler } from './api/http'
import { checkStoredSession, session, TOKEN_KEY } from './api/session.js'
import { useAuthStore } from './stores/auth'
import { useToastStore } from './stores/toast'
import './style.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

watch(session, ({ invalidated }) => {
  if (!invalidated) return
  const current = router.currentRoute.value
  if (current.meta.requiresAuth) {
    const name = localStorage.getItem(TOKEN_KEY) ? 'home' : 'login'
    window.location.replace(router.resolve({ name }).href)
  } else {
    window.location.reload()
  }
}, { flush: 'sync' })

window.addEventListener('storage', (event) => {
  if (event.storageArea === localStorage && (event.key === TOKEN_KEY || event.key === null)) {
    checkStoredSession()
  }
})
window.addEventListener('pageshow', checkStoredSession)

// Token 失效（過期或被竄改）時：登出、清空購物車並導向登入頁
setUnauthorizedHandler(() => {
  const auth = useAuthStore(pinia)
  if (!auth.token) return
  auth.logout()
  useToastStore(pinia).error('登入已失效，請重新登入')
  const current = router.currentRoute.value
  if (current.meta.requiresAuth) router.push({ name: 'login', query: { redirect: current.fullPath } })
})

app.use(router)
app.mount('#app')
