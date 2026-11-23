import { shallowRef } from 'vue'

export const TOKEN_KEY = 'emma_token'
const storedToken = () => localStorage.getItem(TOKEN_KEY) || ''

// 同一分頁的表單、購物車與請求共用一個登入身分，跨分頁換帳號時一起失效。
export const session = shallowRef({ token: storedToken(), version: 0, invalidated: false })

export function checkStoredSession() {
  const current = session.value
  if (!current.invalidated && storedToken() !== current.token) {
    session.value = { token: '', version: current.version + 1, invalidated: true }
  }
}

export function isCurrentSession(version) {
  checkStoredSession()
  return !session.value.invalidated && session.value.version === version
}

export function requireSession(version) {
  if (!isCurrentSession(version)) throw new Error('登入狀態已變更，請重新確認')
}

export function saveToken(token, version) {
  requireSession(version)
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
  session.value = { token, version: version + 1, invalidated: false }
}
