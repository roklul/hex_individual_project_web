import { useRoute } from 'vue-router'

/** 只允許站內路徑，避免 ?redirect=https://evil.com 之類的開放重導 */
export function useSafeRedirect() {
  const route = useRoute()
  return () => {
    const r = route.query.redirect
    return typeof r === 'string' && r.startsWith('/') && !r.startsWith('//') ? r : '/'
  }
}
