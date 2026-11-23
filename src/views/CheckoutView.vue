<script setup>
import { computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useCheckoutQuote } from '@/composables/useCheckoutQuote'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { currency } from '@/utils/format'
import { isValidTwPhone } from '@/utils/phone'
import CheckoutSteps from '@/components/order/CheckoutSteps.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import StatusMessage from '@/components/common/StatusMessage.vue'

const auth = useAuthStore()
const toast = useToastStore()
const router = useRouter()
const { quote, loading, loadError, orderError, submitting, hasIssue, canSubmit, refreshQuote, placeOrder } = useCheckoutQuote()

const form = reactive({ name: auth.user?.name || '', phone: '', address: '', paymentMethod: '貨到付款', note: '' })
const touched = reactive({})

const payments = [
  { value: '貨到付款', desc: '商品送達時付款給物流人員' },
  { value: 'ATM 轉帳', desc: '下單後提供匯款帳號，確認入帳後出貨' },
]

const errors = computed(() => ({
  name: !form.name.trim() ? '請輸入收件人姓名' : '',
  phone: !isValidTwPhone(form.phone) ? '請輸入有效電話：手機 09 開頭 10 碼，或市話如 02-12345678' : '',
  address: form.address.trim().length < 5 ? '請輸入完整的收件地址' : '',
}))
const show = (k) => touched[k] && errors.value[k]
async function loadInitialQuote() {
  await refreshQuote()
  if (quote.value?.items.length === 0 && !orderError.value) {
    toast.info('購物車是空的，先去挑選商品吧')
    router.replace({ name: 'products' })
  }
}
onMounted(loadInitialQuote)

async function submit(event) {
  if (!canSubmit.value) return
  ;['name', 'phone', 'address'].forEach((k) => (touched[k] = true))
  const firstInvalid = ['name', 'phone', 'address'].find((k) => errors.value[k])
  if (firstInvalid) {
    // 錯誤欄位可能在畫面外，捲過去並聚焦
    const el = document.getElementById(`co-${firstInvalid}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el?.focus({ preventScroll: true })
    return
  }
  const res = await placeOrder({
    recipient: { name: form.name.trim(), phone: form.phone.trim(), address: form.address.trim() },
    paymentMethod: form.paymentMethod,
    ...(form.note.trim() && { note: form.note.trim() }),
  }, event.currentTarget.dataset.quoteVersion)
  if (res) {
    toast.success('訂單已成立，感謝你的購買！')
    router.replace({ name: 'order', params: { id: res.data.id }, query: { success: 1 } })
  }
}
</script>

<template>
  <div class="container-page py-8 sm:py-12">
    <CheckoutSteps :current="2" />
    <h1 class="mt-6 font-serif text-3xl text-brand">填寫訂購資料</h1>

    <p v-if="orderError" role="alert" class="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{{ orderError }}</p>
    <StatusMessage v-if="loadError" type="error" title="購物車載入失敗" :description="loadError" class="mt-8">
      <button type="button" class="btn-outline" @click="loadInitialQuote">重新載入購物車</button>
    </StatusMessage>
    <LoadingSpinner v-else-if="loading || !quote" label="讀取購物車…" />
    <StatusMessage v-else-if="!quote.items.length" title="購物車是空的" description="你可以查看目前的訂單，或繼續選購商品。" class="mt-8">
      <RouterLink to="/orders" class="btn-outline">查看我的訂單</RouterLink>
      <RouterLink to="/products" class="btn-primary">繼續購物</RouterLink>
    </StatusMessage>

    <div v-else class="mt-8 grid gap-8 lg:grid-cols-5">
      <form class="space-y-6 lg:col-span-3" :data-quote-version="quote.quoteVersion" novalidate @submit.prevent="submit">
        <fieldset class="space-y-4 rounded-2xl bg-white p-6 ring-1 ring-sand">
          <legend class="float-left mb-2 w-full font-medium">收件資料</legend>
          <div class="clear-both">
            <label for="co-name" class="mb-1 block text-sm font-medium">收件人姓名</label>
            <input id="co-name" v-model="form.name" type="text" autocomplete="name" class="input" :aria-invalid="!!show('name')" aria-describedby="co-name-msg" @blur="touched.name = true" />
            <p id="co-name-msg" class="mt-1 text-xs text-red-700">{{ show('name') }}</p>
          </div>
          <div>
            <label for="co-phone" class="mb-1 block text-sm font-medium">聯絡電話</label>
            <input id="co-phone" v-model="form.phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="0912345678" class="input" :aria-invalid="!!show('phone')" aria-describedby="co-phone-msg" @blur="touched.phone = true" />
            <p id="co-phone-msg" class="mt-1 text-xs text-red-700">{{ show('phone') }}</p>
          </div>
          <div>
            <label for="co-address" class="mb-1 block text-sm font-medium">收件地址</label>
            <input id="co-address" v-model="form.address" type="text" autocomplete="street-address" placeholder="縣市、區、路名與門牌" class="input" :aria-invalid="!!show('address')" aria-describedby="co-address-msg" @blur="touched.address = true" />
            <p id="co-address-msg" class="mt-1 text-xs text-red-700">{{ show('address') }}</p>
          </div>
        </fieldset>

        <fieldset class="rounded-2xl bg-white p-6 ring-1 ring-sand">
          <legend class="float-left mb-3 w-full font-medium">付款方式</legend>
          <div class="clear-both grid gap-3 sm:grid-cols-2">
            <label
              v-for="p in payments"
              :key="p.value"
              class="flex cursor-pointer gap-3 rounded-xl border p-4 transition"
              :class="form.paymentMethod === p.value ? 'border-brand bg-brand/5' : 'border-sand hover:border-brand/50'"
            >
              <input v-model="form.paymentMethod" type="radio" name="payment" :value="p.value" class="mt-1 accent-brand" />
              <span>
                <span class="block text-sm font-medium">{{ p.value }}</span>
                <span class="block text-xs text-ink/60">{{ p.desc }}</span>
              </span>
            </label>
          </div>
        </fieldset>

        <fieldset class="rounded-2xl bg-white p-6 ring-1 ring-sand">
          <legend class="float-left mb-2 w-full font-medium"><label for="co-note">訂單備註（選填）</label></legend>
          <textarea id="co-note" v-model="form.note" rows="3" maxlength="300" class="input clear-both" placeholder="例如：需要統編、希望的出貨方式" />
        </fieldset>

        <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <RouterLink to="/cart" class="btn-ghost">← 回購物車修改</RouterLink>
          <button type="submit" class="btn-primary sm:px-10" :disabled="!canSubmit">
            <span v-if="submitting" class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
            {{ submitting ? '送出中…' : `${orderError ? '再次確認下單' : '確認下單'} ${currency(quote.grandTotal)}` }}
          </button>
        </div>
      </form>

      <aside class="h-fit rounded-2xl bg-white p-6 ring-1 ring-sand lg:sticky lg:top-24 lg:col-span-2" aria-labelledby="co-summary">
        <h2 id="co-summary" class="font-medium">訂單內容（{{ quote.totalQuantity }} 件）</h2>
        <ul class="mt-4 divide-y divide-sand">
          <li v-for="i in quote.items" :key="i.productId" class="flex gap-3 py-3" :class="{ 'opacity-50': !i.available }">
            <img :src="i.product.imageUrl" :alt="i.product.title" class="h-14 w-14 shrink-0 rounded-lg bg-white object-contain ring-1 ring-sand" />
            <div class="min-w-0 flex-1 text-sm">
              <p class="line-clamp-2">{{ i.product.title }}</p>
              <p class="text-ink/50">{{ currency(i.product.price) }} × {{ i.quantity }}</p>
              <p v-if="!i.available" class="text-xs text-red-700">已售完或下架，不列入訂單</p>
            </div>
            <p class="whitespace-nowrap text-sm font-medium">{{ currency(i.subtotal) }}</p>
          </li>
        </ul>
        <dl class="mt-4 space-y-2 border-t border-sand pt-4 text-sm">
          <div class="flex justify-between"><dt class="text-ink/60">商品小計</dt><dd>{{ currency(quote.total) }}</dd></div>
          <div class="flex justify-between"><dt class="text-ink/60">運費</dt><dd>{{ quote.shippingFee ? currency(quote.shippingFee) : '免運' }}</dd></div>
          <div class="flex justify-between border-t border-sand pt-3 text-base font-medium"><dt>應付金額</dt><dd class="text-accent">{{ currency(quote.grandTotal) }}</dd></div>
        </dl>
        <p v-if="hasIssue" class="mt-3 text-xs text-red-700">部分商品庫存不足或已下架，請回購物車調整後再下單</p>
      </aside>
    </div>
  </div>
</template>
