import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authApi } from '@/api'
import { TOKEN_KEY } from '@/api/http'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const user = ref(null)
  const ready = ref(false)
  let initPromise = null

  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  function setSession(data) {
    token.value = data.token
    user.value = data.user
    localStorage.setItem(TOKEN_KEY, data.token)
  }

  /** 重新整理頁面時，用保存的 token 向後端換回使用者資料 */
  function init() {
    if (initPromise) return initPromise
    initPromise = (async () => {
      if (token.value) {
        try {
          user.value = await authApi.me()
        } catch (err) {
          // 只有確定 token 無效時才清掉；網路錯誤時保留，下次再試
          if (err.response?.status === 401) clear()
          else initPromise = null
        }
      }
      ready.value = true
    })()
    return initPromise
  }

  async function login(payload) {
    setSession(await authApi.login(payload))
  }
  async function register(payload) {
    setSession(await authApi.register(payload))
  }
  function clear() {
    token.value = ''
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
  }

  return { token, user, ready, isLoggedIn, isAdmin, init, login, register, logout: clear }
})
