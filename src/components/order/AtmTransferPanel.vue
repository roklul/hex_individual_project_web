<script setup>
import { computed, ref } from 'vue'
import { orderApi } from '@/api'
import { getErrorMessage } from '@/api/http'
import { useToastStore } from '@/stores/toast'
import { currency } from '@/utils/format'

const props = defineProps({ order: { type: Object, required: true } })
const emit = defineEmits(['updated'])
const toast = useToastStore()

const last5 = ref('')
const touched = ref(false)
const submitting = ref(false)
const editing = ref(false)

const bank = computed(() => props.order.atmAccount)
const report = computed(() => props.order.transferReport?.last5 ? props.order.transferReport : null)
const awaiting = computed(() => props.order.status === '待付款')
const showForm = computed(() => awaiting.value && (!report.value || editing.value))
const invalid = computed(() => !/^\d{5}$/.test(last5.value.trim()))
const formatDate = (d) => new Date(d).toLocaleString('zh-TW', { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })

async function copyAccount() {
  try {
    await navigator.clipboard.writeText(bank.value.account.replace(/\D/g, ''))
    toast.success('已複製匯款帳號')
  } catch {
    toast.error('無法複製，請手動選取帳號')
  }
}

function startEdit() {
  last5.value = report.value?.last5 || ''
  touched.value = false
  editing.value = true
}

async function submit() {
  touched.value = true
  if (invalid.value) return document.getElementById('atm-last5')?.focus()
  submitting.value = true
  try {
    const res = await orderApi.reportTransfer(props.order.id, last5.value.trim())
    emit('updated', res.data)
    editing.value = false
    last5.value = ''
    toast.success(res.message)
  } catch (err) {
    toast.error(getErrorMessage(err, '回報失敗，請稍後再試'))
    emit('updated', null) // 狀態可能已被管理員變更，請父層重新讀取
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="rounded-2xl bg-white p-6 text-sm ring-1 ring-sand" aria-labelledby="atm-title">
    <h2 id="atm-title" class="font-medium">ATM 轉帳資訊</h2>

    <template v-if="awaiting && bank">
      <p v-if="bank.demo" class="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
        作品展示用帳號，請勿實際匯款。
      </p>
      <dl class="mt-3 space-y-2">
        <div><dt class="text-ink/50">銀行</dt><dd>（{{ bank.bankCode }}）{{ bank.bankName }}</dd></div>
        <div>
          <dt class="text-ink/50">帳號</dt>
          <dd class="flex items-center gap-2">
            <span class="font-mono text-base tracking-wide">{{ bank.account }}</span>
            <button type="button" class="rounded-full px-2 py-0.5 text-xs text-brand ring-1 ring-brand/30 hover:bg-brand/5" @click="copyAccount">複製</button>
          </dd>
        </div>
        <div><dt class="text-ink/50">戶名</dt><dd>{{ bank.accountName }}</dd></div>
        <div><dt class="text-ink/50">應匯金額</dt><dd class="text-base font-medium text-accent">{{ currency(order.total) }}</dd></div>
        <div v-if="order.paymentDeadline"><dt class="text-ink/50">付款期限</dt><dd>{{ formatDate(order.paymentDeadline) }} 前</dd></div>
      </dl>
    </template>

    <div v-if="report && !showForm" class="mt-4 rounded-lg px-3 py-2" :class="awaiting ? 'bg-sky-50 text-sky-900' : 'bg-emerald-50 text-emerald-900'" role="status">
      <p class="font-medium">{{ awaiting ? '已回報匯款，等待確認入帳' : '已確認入帳' }}</p>
      <p class="mt-0.5 text-xs">帳號末五碼 <span class="font-mono">{{ report.last5 }}</span>・{{ formatDate(report.reportedAt) }} 回報</p>
      <button v-if="awaiting" type="button" class="mt-1 text-xs underline" @click="startEdit">填錯了？重新回報</button>
    </div>

    <form v-if="showForm" class="mt-4 border-t border-sand pt-4" novalidate @submit.prevent="submit">
      <label for="atm-last5" class="mb-1 block font-medium">轉帳完成後，回報匯款帳號末五碼</label>
      <p class="mb-2 text-xs text-ink/60">我們會用末五碼對照銀行入帳紀錄，確認後就會出貨。</p>
      <div class="flex gap-2">
        <input
          id="atm-last5"
          v-model="last5"
          type="text"
          inputmode="numeric"
          maxlength="5"
          autocomplete="off"
          placeholder="例如 12345"
          class="input font-mono tracking-widest"
          :aria-invalid="touched && invalid"
          aria-describedby="atm-last5-msg"
        />
        <button type="submit" class="btn-primary shrink-0 px-4" :disabled="submitting">{{ submitting ? '送出中…' : '回報' }}</button>
      </div>
      <p id="atm-last5-msg" class="mt-1 text-xs text-red-700">{{ touched && invalid ? '請輸入 5 位數字' : '' }}</p>
      <button v-if="editing" type="button" class="text-xs text-ink/60 underline" @click="editing = false">取消修改</button>
    </form>
  </section>
</template>
