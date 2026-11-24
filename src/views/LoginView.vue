<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { getErrorMessage } from '@/api/http'
import { useSafeRedirect } from '@/composables/useSafeRedirect'
import AuthCard from '@/components/common/AuthCard.vue'

const auth = useAuthStore()
const toast = useToastStore()
const router = useRouter()
const route = useRoute()
const redirectTo = useSafeRedirect()

const form = reactive({ email: '', password: '' })
const submitting = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  if (!form.email || !form.password) return (error.value = '請輸入 Email 與密碼')
  submitting.value = true
  try {
    await auth.login(form)
    toast.success(`歡迎回來，${auth.user.name}`)
    router.replace(redirectTo())
  } catch (err) {
    error.value = getErrorMessage(err, '登入失敗')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AuthCard title="會員登入" subtitle="登入後即可使用購物車">
    <p v-if="route.query.redirect" class="mt-4 rounded-lg bg-sand/60 px-4 py-3 text-sm">請先登入，登入後會帶你回到剛剛的頁面。</p>
    <form class="mt-6 space-y-4" novalidate @submit.prevent="submit">
      <div>
        <label for="login-email" class="mb-1 block text-sm font-medium">Email</label>
        <input id="login-email" v-model.trim="form.email" type="email" autocomplete="email" class="input" required />
      </div>
      <div>
        <div class="mb-1 flex items-center justify-between">
          <label for="login-password" class="text-sm font-medium">密碼</label>
          <RouterLink :to="{ name: 'forgot-password' }" class="text-xs text-accent hover:underline">忘記密碼？</RouterLink>
        </div>
        <input id="login-password" v-model="form.password" type="password" autocomplete="current-password" class="input" required />
      </div>
      <p v-if="error" role="alert" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{{ error }}</p>
      <button type="submit" class="btn-primary w-full" :disabled="submitting">{{ submitting ? '登入中…' : '登入' }}</button>
    </form>
    <p class="mt-6 text-center text-sm text-ink/60">
      還沒有帳號？
      <RouterLink :to="{ name: 'register', query: route.query }" class="text-accent hover:underline">立即註冊</RouterLink>
    </p>
  </AuthCard>
</template>
