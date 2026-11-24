import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { authApi } from '../api/index.js'
import { checkStoredSession, isCurrentSession, saveToken, session } from '../api/session.js'

export const useAuthStore = defineStore('auth', () => {
  const token = computed(() => session.value.token)
  const user = ref(null)
  const ready = ref(false)
  // 有 token 但暫時連不上伺服器（例如免費主機冷啟動逾時）：保留登入，不要誤導向登入頁
  const offline = ref(false)
  let initPromise = null

  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  watch(session, () => {
    user.value = null
    offline.value = false
    ready.value = !session.value.token
    initPromise = null
  }, { flush: 'sync' })

  function setSession(data, version) {
    saveToken(data.token, version)
    user.value = data.user
    ready.value = true
  }

  /** 重新整理頁面時，用保存的 token 向後端換回使用者資料 */
  function init() {
    checkStoredSession()
    if (initPromise) return initPromise
    const version = session.value.version
    initPromise = (async () => {
      if (token.value && !user.value) {
        try {
          const profile = await authApi.me()
          if (isCurrentSession(version)) {
            user.value = profile
            offline.value = false
          }
        } catch (err) {
          if (!isCurrentSession(version)) return
          // 只有確定 token 無效時才清掉；網路錯誤時保留，下次再試
          if (err.response?.status === 401) clear()
          else {
            offline.value = true
            initPromise = null
          }
        }
      }
      if (isCurrentSession(version)) ready.value = true
    })()
    return initPromise
  }

  async function login(payload) {
    const version = session.value.version
    setSession(await authApi.login(payload), version)
  }
  async function register(payload) {
    const version = session.value.version
    setSession(await authApi.register(payload), version)
  }
  function clear() {
    const version = session.value.version
    if (isCurrentSession(version)) saveToken('', version)
  }

  return { token, user, ready, offline, isLoggedIn, isAdmin, init, login, register, logout: clear }
})
