<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { getErrorMessage } from '@/api/http'
import { passwordError } from '@/utils/password'
import AuthCard from '@/components/common/AuthCard.vue'

const auth = useAuthStore()
const toast = useToastStore()
const route = useRoute()
const router = useRouter()

// 讀取後就把 token 從網址移除，避免留在瀏覽紀錄或被分享出去
const token = ref(typeof route.query.token === 'string' ? route.query.token : '')
onMounted(() => route.query.token && router.replace({ query: {} }))

const form = reactive({ password: '', confirm: '' })
const touched = reactive({})
const submitting = ref(false)
const error = ref('')

const errors = computed(() => ({
  password: passwordError(form.password),
  confirm: form.confirm !== form.password ? '兩次輸入的密碼不一致' : '',
}))
const show = (k) => touched[k] && errors.value[k]

async function submit() {
  touched.password = touched.confirm = true
  error.value = ''
  if (errors.value.password || errors.value.confirm) return
  submitting.value = true
  try {
    await auth.resetPassword({ token: token.value, password: form.password })
    toast.success('密碼已重設，已為你自動登入')
    router.replace({ name: 'home' })
  } catch (err) {
    error.value = getErrorMessage(err, '重設失敗，請稍後再試')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AuthCard title="設定新密碼" subtitle="設定完成後會自動登入，其他裝置的登入會被登出">
    <div v-if="!token" class="mt-6 space-y-4 text-sm" role="alert">
      <p class="rounded-lg bg-red-50 px-4 py-3 text-red-700">重設連結不完整或已失效，請重新申請。</p>
      <RouterLink :to="{ name: 'forgot-password' }" class="btn-primary w-full">重新申請重設連結</RouterLink>
    </div>
    <form v-else class="mt-6 space-y-4" novalidate @submit.prevent="submit">
      <div>
        <label for="reset-password" class="mb-1 block text-sm font-medium">新密碼</label>
        <input id="reset-password" v-model="form.password" type="password" autocomplete="new-password" class="input" :aria-invalid="!!show('password')" aria-describedby="reset-password-msg" @blur="touched.password = true" />
        <p id="reset-password-msg" class="mt-1 text-xs" :class="show('password') ? 'text-red-700' : 'text-ink/50'">{{ show('password') || '至少 8 碼，需包含英文與數字' }}</p>
      </div>
      <div>
        <label for="reset-confirm" class="mb-1 block text-sm font-medium">確認新密碼</label>
        <input id="reset-confirm" v-model="form.confirm" type="password" autocomplete="new-password" class="input" :aria-invalid="!!show('confirm')" aria-describedby="reset-confirm-msg" @blur="touched.confirm = true" />
        <p id="reset-confirm-msg" class="mt-1 text-xs text-red-700">{{ show('confirm') }}</p>
      </div>
      <div v-if="error" role="alert" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
        {{ error }}
        <RouterLink :to="{ name: 'forgot-password' }" class="ml-1 underline">重新申請</RouterLink>
      </div>
      <button type="submit" class="btn-primary w-full" :disabled="submitting">{{ submitting ? '設定中…' : '設定新密碼' }}</button>
    </form>
  </AuthCard>
</template>
