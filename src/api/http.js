import axios from 'axios'

export const TOKEN_KEY = 'emma_token'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 20000, // 免費雲端主機冷啟動較慢
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 401 處理由外部註冊，避免 http <-> store/router 循環依賴
let onUnauthorized = null
export const setUnauthorizedHandler = (fn) => (onUnauthorized = fn)

http.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status
    const url = error.config?.url || ''
    if (status === 401 && !url.startsWith('/auth/login') && !url.startsWith('/auth/register')) {
      onUnauthorized?.(error)
    }
    return Promise.reject(error)
  },
)

export function getErrorMessage(error, fallback = '發生錯誤，請稍後再試') {
  if (error?.response?.data?.message) return error.response.data.message
  if (error?.code === 'ECONNABORTED') return '伺服器回應逾時，請稍後再試'
  if (error?.request && !error.response) return '無法連線到伺服器，請檢查網路連線'
  return fallback
}

export default http
