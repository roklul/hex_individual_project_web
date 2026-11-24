<script setup>
import { ref } from 'vue'
import { authApi } from '@/api'
import { getErrorMessage } from '@/api/http'
import AuthCard from '@/components/common/AuthCard.vue'

const email = ref('')
const touched = ref(false)
const submitting = ref(false)
const error = ref('')
const sentTo = ref('')

const invalid = () => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())

async function submit() {
  touched.value = true
  error.value = ''
  if (invalid()) return
  submitting.value = true
  try {
    await authApi.forgotPassword(email.value.trim())
    sentTo.value = email.value.trim()
  } catch (err) {
    error.value = getErrorMessage(err, '送出失敗，請稍後再試')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AuthCard title="忘記密碼" subtitle="輸入註冊時的 Email，我們會寄送重設密碼連結">
    <div v-if="sentTo" class="mt-6 space-y-4 text-sm" role="status">
      <p class="rounded-lg bg-emerald-50 px-4 py-3 text-emerald-900">
        如果 <strong>{{ sentTo }}</strong> 已註冊，重設密碼連結已寄出，請在 30 分鐘內開啟信中的連結設定新密碼。
      </p>
      <p class="text-ink/60">沒收到信？請檢查垃圾郵件匣，或稍等一分鐘後再申請一次。</p>
      <button type="button" class="btn-outline w-full" @click="sentTo = ''">重新申請</button>
    </div>
    <form v-else class="mt-6 space-y-4" novalidate @submit.prevent="submit">
      <div>
        <label for="forgot-email" class="mb-1 block text-sm font-medium">Email</label>
        <input id="forgot-email" v-model="email" type="email" autocomplete="email" class="input" :aria-invalid="touched && invalid()" aria-describedby="forgot-email-msg" />
        <p id="forgot-email-msg" class="mt-1 text-xs text-red-700">{{ touched && invalid() ? '請輸入有效的 Email' : '' }}</p>
      </div>
      <p v-if="error" role="alert" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{{ error }}</p>
      <button type="submit" class="btn-primary w-full" :disabled="submitting">{{ submitting ? '寄送中…' : '寄送重設連結' }}</button>
    </form>
    <p class="mt-6 text-center text-sm text-ink/60">
      想起密碼了？
      <RouterLink :to="{ name: 'login' }" class="text-accent hover:underline">回到登入</RouterLink>
    </p>
  </AuthCard>
</template>
