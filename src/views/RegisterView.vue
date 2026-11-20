<script setup>
import { computed, reactive, ref } from 'vue'
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

const form = reactive({ name: '', email: '', password: '', confirm: '' })
const touched = reactive({})
const submitting = ref(false)
const serverError = ref('')

const errors = computed(() => ({
  name: !form.name.trim() ? '請輸入姓名' : form.name.length > 50 ? '姓名最多 50 字' : '',
  email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? '請輸入有效的 Email' : '',
  password:
    form.password.length < 8 ? '密碼至少 8 碼' : !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password) ? '密碼需同時包含英文與數字' : '',
  confirm: form.confirm !== form.password ? '兩次輸入的密碼不一致' : '',
}))
const show = (k) => touched[k] && errors.value[k]

const fields = [
  { key: 'name', label: '姓名', type: 'text', autocomplete: 'name' },
  { key: 'email', label: 'Email', type: 'email', autocomplete: 'email' },
  { key: 'password', label: '密碼', type: 'password', autocomplete: 'new-password', hint: '至少 8 碼，需包含英文與數字' },
  { key: 'confirm', label: '確認密碼', type: 'password', autocomplete: 'new-password' },
]

async function submit() {
  fields.forEach((f) => (touched[f.key] = true))
  serverError.value = ''
  if (Object.values(errors.value).some(Boolean)) return
  submitting.value = true
  try {
    await auth.register({ name: form.name.trim(), email: form.email.trim(), password: form.password })
    toast.success('註冊成功，已為你自動登入')
    router.replace(redirectTo())
  } catch (err) {
    serverError.value = getErrorMessage(err, '註冊失敗')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AuthCard title="註冊會員" subtitle="加入會員，快速採購所需零件">
    <form class="mt-6 space-y-4" novalidate @submit.prevent="submit">
      <div v-for="f in fields" :key="f.key">
        <label :for="`reg-${f.key}`" class="mb-1 block text-sm font-medium">{{ f.label }}</label>
        <input
          :id="`reg-${f.key}`"
          v-model="form[f.key]"
          :type="f.type"
          :autocomplete="f.autocomplete"
          class="input"
          :class="{ 'border-red-400': show(f.key) }"
          :aria-invalid="!!show(f.key)"
          :aria-describedby="`reg-${f.key}-msg`"
          required
          @blur="touched[f.key] = true"
        />
        <p :id="`reg-${f.key}-msg`" class="mt-1 text-xs" :class="show(f.key) ? 'text-red-700' : 'text-ink/50'">
          {{ show(f.key) || f.hint || '' }}
        </p>
      </div>
      <p v-if="serverError" role="alert" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{{ serverError }}</p>
      <button type="submit" class="btn-primary w-full" :disabled="submitting">{{ submitting ? '註冊中…' : '註冊' }}</button>
    </form>
    <p class="mt-6 text-center text-sm text-ink/60">
      已經有帳號？
      <RouterLink :to="{ name: 'login', query: route.query }" class="text-accent hover:underline">前往登入</RouterLink>
    </p>
  </AuthCard>
</template>
