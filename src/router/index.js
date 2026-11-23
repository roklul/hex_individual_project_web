import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: { title: '首頁' } },
    { path: '/products', name: 'products', component: () => import('@/views/ProductsView.vue'), meta: { title: '全部商品' } },
    { path: '/products/:id', name: 'product', component: () => import('@/views/ProductDetailView.vue'), meta: { title: '商品內容' } },
    { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue'), meta: { title: '登入', guestOnly: true } },
    { path: '/register', name: 'register', component: () => import('@/views/RegisterView.vue'), meta: { title: '註冊', guestOnly: true } },
    { path: '/cart', name: 'cart', component: () => import('@/views/CartView.vue'), meta: { title: '購物車', requiresAuth: true } },
    { path: '/checkout', name: 'checkout', component: () => import('@/views/CheckoutView.vue'), meta: { title: '結帳', requiresAuth: true } },
    { path: '/orders', name: 'orders', component: () => import('@/views/OrdersView.vue'), meta: { title: '我的訂單', requiresAuth: true } },
    { path: '/orders/:id', name: 'order', component: () => import('@/views/OrderDetailView.vue'), meta: { title: '訂單明細', requiresAuth: true } },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFoundView.vue'), meta: { title: '找不到頁面' } },
  ],
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    if (to.name === from.name && to.name === 'products') return false // 列表換頁時由頁面自行處理
    return { top: 0 }
  },
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.init()
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.guestOnly && auth.isLoggedIn) return { name: 'home' }
})

router.afterEach((to) => {
  document.title = `${to.meta.title ? `${to.meta.title}｜` : ''}EMMA 電子零件`
})

export default router
