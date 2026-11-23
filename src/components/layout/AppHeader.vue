<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useToastStore } from '@/stores/toast'

const auth = useAuthStore()
const cart = useCartStore()
const toast = useToastStore()
const router = useRouter()
const route = useRoute()
const menuOpen = ref(false)

watch(() => route.fullPath, () => (menuOpen.value = false))

const links = [
  { to: { name: 'home' }, label: '首頁' },
  { to: { name: 'products' }, label: '全部商品' },
]

function logout() {
  auth.logout()
  toast.success('已登出，期待再次見到你')
  if (route.meta.requiresAuth) router.push({ name: 'home' })
}
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-sand bg-cream/90 backdrop-blur">
    <div class="container-page flex h-16 items-center justify-between gap-4">
      <RouterLink to="/" class="flex items-baseline gap-2" aria-label="EMMA 電子零件 首頁">
        <span class="font-serif text-xl font-bold text-brand">EMMA<span class="text-accent"> 電子零件</span></span>
        <span class="hidden text-xs tracking-widest text-ink/50 lg:inline">ELECTRONIC COMPONENTS</span>
      </RouterLink>

      <nav aria-label="主選單" class="hidden md:block">
        <ul class="flex items-center gap-8 text-sm">
          <li v-for="l in links" :key="l.label">
            <RouterLink :to="l.to" class="hover:text-brand" exact-active-class="text-brand font-medium">{{ l.label }}</RouterLink>
          </li>
        </ul>
      </nav>

      <div class="flex items-center gap-1 sm:gap-2">
        <template v-if="auth.isLoggedIn">
          <RouterLink :to="{ name: 'orders' }" class="btn-ghost hidden px-3 md:inline-flex">我的訂單</RouterLink>
          <span class="hidden text-sm text-ink/70 lg:inline">Hi，{{ auth.user.name }}</span>
          <button type="button" class="btn-ghost hidden px-3 md:inline-flex" @click="logout">登出</button>
        </template>
        <template v-else>
          <RouterLink :to="{ name: 'login', query: { redirect: route.fullPath } }" class="btn-ghost hidden px-3 md:inline-flex">登入</RouterLink>
          <RouterLink :to="{ name: 'register' }" class="btn-primary hidden px-4 py-2 md:inline-flex">註冊</RouterLink>
        </template>

        <RouterLink to="/cart" class="relative rounded-full p-2 hover:bg-sand" :aria-label="`購物車，共 ${cart.count} 件商品`">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
          </svg>
          <span
            v-if="cart.count > 0"
            :key="cart.count"
            class="badge-pop absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-white"
          >{{ cart.count > 99 ? '99+' : cart.count }}</span>
        </RouterLink>

        <button
          type="button"
          class="rounded-full p-2 hover:bg-sand md:hidden"
          :aria-expanded="menuOpen"
          aria-controls="mobile-menu"
          aria-label="開啟選單"
          @click="menuOpen = !menuOpen"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
            <path v-if="!menuOpen" stroke-linecap="round" d="M4 7h16M4 12h16M4 17h16" />
            <path v-else stroke-linecap="round" d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
    </div>

    <nav v-show="menuOpen" id="mobile-menu" aria-label="行動版選單" class="border-t border-sand bg-cream md:hidden">
      <ul class="container-page flex flex-col py-2 text-sm">
        <li v-for="l in links" :key="l.label"><RouterLink :to="l.to" class="block py-3">{{ l.label }}</RouterLink></li>
        <li v-if="auth.isLoggedIn" class="border-t border-sand"><RouterLink :to="{ name: 'orders' }" class="block py-3">我的訂單</RouterLink></li>
        <li v-if="auth.isLoggedIn" class="flex items-center justify-between border-t border-sand py-3">
          <span class="text-ink/70">Hi，{{ auth.user.name }}</span>
          <button type="button" class="text-accent" @click="logout">登出</button>
        </li>
        <template v-else>
          <li class="border-t border-sand"><RouterLink :to="{ name: 'login', query: { redirect: route.fullPath } }" class="block py-3">登入</RouterLink></li>
          <li><RouterLink :to="{ name: 'register' }" class="block py-3">註冊會員</RouterLink></li>
        </template>
      </ul>
    </nav>
  </header>
</template>

<style scoped>
.badge-pop { animation: pop 0.35s ease-out; }
@keyframes pop { 0% { transform: scale(0.4); } 70% { transform: scale(1.2); } 100% { transform: scale(1); } }
</style>
