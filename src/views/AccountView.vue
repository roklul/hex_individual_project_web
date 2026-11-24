<script setup>
import { computed, reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { getErrorMessage } from '@/api/http'
import { passwordError } from '@/utils/password'

const auth = useAuthStore()
const toast = useToastStore()

const form = reactive({ current: '', password: '', confirm: '' })
const touched = reactive({})
const submitting = ref(false)
const error = ref('')

const errors = computed(() => ({
  current: !form.current ? '請輸入目前的密碼' : '',
  password: passwordError(form.password) || (form.password === form.current ? '新密碼不可與目前密碼相同' : ''),
  confirm: form.confirm !== form.password ? '兩次輸入的密碼不一致' : '',
}))
const show = (k) => touched[k] && errors.value[k]
const fields = [
  { key: 'current', label: '目前的密碼', autocomplete: 'current-password' },
  { key: 'password', label: '新密碼', autocomplete: 'new-password', hint: '至少 8 碼，需包含英文與數字' },
  { key: 'confirm', label: '確認新密碼', autocomplete: 'new-password' },
]
const joined = computed(() => auth.user?.createdAt && new Date(auth.user.createdAt).toLocaleDateString('zh-TW'))

async function submit() {
  fields.forEach((f) => (touched[f.key] = true))
  error.value = ''
  const first = fields.find((f) => errors.value[f.key])
  if (first) return document.getElementById(`acc-${first.key}`)?.focus()
  submitting.value = true
  try {
    await auth.changePassword({ currentPassword: form.current, newPassword: form.password })
    toast.success('密碼已更新，其他裝置的登入已全部登出')
  } catch (err) {
    error.value = getErrorMessage(err, '更新失敗，請稍後再試')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="container-page max-w-2xl py-8 sm:py-12">
    <h1 class="font-serif text-3xl text-brand">帳號設定</h1>

    <section class="mt-8 rounded-2xl bg-white p-6 ring-1 ring-sand" aria-labelledby="acc-profile-title">
      <h2 id="acc-profile-title" class="font-medium">會員資料</h2>
      <dl class="mt-4 grid grid-cols-[5rem_1fr] gap-y-2 text-sm">
        <dt class="text-ink/50">姓名</dt><dd>{{ auth.user.name }}</dd>
        <dt class="text-ink/50">Email</dt><dd class="break-all">{{ auth.user.email }}</dd>
        <dt class="text-ink/50">身分</dt><dd>{{ auth.isAdmin ? '管理員' : '一般會員' }}</dd>
        <template v-if="joined"><dt class="text-ink/50">加入日期</dt><dd>{{ joined }}</dd></template>
      </dl>
    </section>

    <section class="mt-6 rounded-2xl bg-white p-6 ring-1 ring-sand" aria-labelledby="acc-password-title">
      <h2 id="acc-password-title" class="font-medium">修改密碼</h2>
      <p class="mt-1 text-sm text-ink/60">更新後，其他裝置上的登入會被登出。</p>
      <form class="mt-4 space-y-4" novalidate @submit.prevent="submit">
        <div v-for="f in fields" :key="f.key">
          <label :for="`acc-${f.key}`" class="mb-1 block text-sm font-medium">{{ f.label }}</label>
          <input
            :id="`acc-${f.key}`"
            v-model="form[f.key]"
            type="password"
            :autocomplete="f.autocomplete"
            class="input"
            :aria-invalid="!!show(f.key)"
            :aria-describedby="`acc-${f.key}-msg`"
            @blur="touched[f.key] = true"
          />
          <p :id="`acc-${f.key}-msg`" class="mt-1 text-xs" :class="show(f.key) ? 'text-red-700' : 'text-ink/50'">{{ show(f.key) || f.hint }}</p>
        </div>
        <p v-if="error" role="alert" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{{ error }}</p>
        <button type="submit" class="btn-primary" :disabled="submitting">{{ submitting ? '更新中…' : '更新密碼' }}</button>
      </form>
      <p class="mt-4 text-xs text-ink/50">
        忘記目前的密碼？登出後在登入頁點「忘記密碼」，用 Email 重設。
      </p>
    </section>
  </div>
</template>
