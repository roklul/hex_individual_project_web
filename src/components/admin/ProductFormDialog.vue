<script setup>
import { computed, reactive, ref } from 'vue'
import { adminApi } from '@/api'
import { getErrorMessage } from '@/api/http'

const props = defineProps({
  product: { type: Object, default: null }, // null = 新增
  categories: { type: Array, required: true },
})
const emit = defineEmits(['close', 'saved'])

const dialog = ref(null)
const saving = ref(false)
const error = ref('')
const touched = ref(false)
const isEdit = computed(() => !!props.product?.id)

const empty = () => ({
  title: '', brand: '', category: props.categories[0] || '', price: '', originPrice: '', unit: '顆',
  stock: '', imageUrl: '', description: '', content: '', isEnabled: true,
})
const form = reactive(empty())

// 每次開啟都依目前要編輯的商品重設表單（連續按兩次「新增」也會是空白表單）
function reset(p) {
  Object.assign(form, empty(), p ? {
    ...Object.fromEntries(Object.keys(empty()).map((k) => [k, p[k] ?? empty()[k]])),
    originPrice: p.originPrice ?? '',
  } : {})
  error.value = ''
  touched.value = false
}

const isInt = (v) => v !== '' && Number.isInteger(Number(v)) && Number(v) >= 0
const isUrl = (v) => { try { return ['http:', 'https:'].includes(new URL(v).protocol) } catch { return false } }
const errors = computed(() => ({
  title: !form.title.trim() ? '請輸入商品名稱' : '',
  category: !form.category ? '請選擇分類' : '',
  price: !isInt(form.price) ? '請輸入 0 以上的整數' : '',
  originPrice: form.originPrice !== '' && !isInt(form.originPrice) ? '請輸入 0 以上的整數，或留空' : '',
  stock: !isInt(form.stock) ? '請輸入 0 以上的整數' : '',
  imageUrl: !isUrl(form.imageUrl.trim()) ? '請輸入 http(s) 開頭的圖片網址' : '',
}))
const show = (k) => touched.value && errors.value[k]

function open() { reset(props.product); dialog.value?.showModal() }
function close() { dialog.value?.close() }
defineExpose({ open, close })

async function submit() {
  touched.value = true
  const first = Object.keys(errors.value).find((k) => errors.value[k])
  if (first) { document.getElementById(`pf-${first}`)?.focus(); return }
  const payload = {
    title: form.title.trim(),
    brand: form.brand.trim(),
    category: form.category,
    price: Number(form.price),
    ...(form.originPrice !== '' && { originPrice: Number(form.originPrice) }),
    unit: form.unit.trim() || '顆',
    stock: Number(form.stock),
    imageUrl: form.imageUrl.trim(),
    description: form.description,
    content: form.content,
    isEnabled: form.isEnabled,
  }
  saving.value = true
  error.value = ''
  try {
    const res = isEdit.value ? await adminApi.updateProduct(props.product.id, payload) : await adminApi.createProduct(payload)
    emit('saved', res)
    close()
  } catch (err) {
    error.value = getErrorMessage(err, '儲存失敗，請稍後再試')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <dialog
    ref="dialog"
    class="m-auto w-[min(42rem,calc(100%-2rem))] rounded-2xl p-0 shadow-xl backdrop:bg-ink/40"
    aria-labelledby="pf-heading"
    @close="emit('close')"
  >
    <form class="flex max-h-[85vh] flex-col" novalidate @submit.prevent="submit">
      <header class="flex items-center justify-between border-b border-sand px-6 py-4">
        <h2 id="pf-heading" class="font-medium">{{ isEdit ? '編輯商品' : '新增商品' }}</h2>
        <button type="button" class="rounded-full p-1 text-ink/50 hover:bg-sand" aria-label="關閉" @click="close">✕</button>
      </header>

      <div class="grid gap-4 overflow-y-auto px-6 py-5 sm:grid-cols-2">
        <p v-if="error" role="alert" class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 sm:col-span-2">{{ error }}</p>

        <div class="sm:col-span-2">
          <label for="pf-title" class="mb-1 block text-sm font-medium">商品名稱 *</label>
          <input id="pf-title" v-model="form.title" class="input" maxlength="100" :aria-invalid="!!show('title')" />
          <p class="mt-1 text-xs text-red-700">{{ show('title') }}</p>
        </div>
        <div>
          <label for="pf-brand" class="mb-1 block text-sm font-medium">品牌</label>
          <input id="pf-brand" v-model="form.brand" class="input" maxlength="50" />
        </div>
        <div>
          <label for="pf-category" class="mb-1 block text-sm font-medium">分類 *</label>
          <select id="pf-category" v-model="form.category" class="input" :aria-invalid="!!show('category')">
            <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
          </select>
          <p class="mt-1 text-xs text-red-700">{{ show('category') }}</p>
        </div>
        <div>
          <label for="pf-price" class="mb-1 block text-sm font-medium">售價（NT$）*</label>
          <input id="pf-price" v-model="form.price" type="number" min="0" step="1" inputmode="numeric" class="input" :aria-invalid="!!show('price')" />
          <p class="mt-1 text-xs text-red-700">{{ show('price') }}</p>
        </div>
        <div>
          <label for="pf-originPrice" class="mb-1 block text-sm font-medium">原價（選填）</label>
          <input id="pf-originPrice" v-model="form.originPrice" type="number" min="0" step="1" inputmode="numeric" class="input" :aria-invalid="!!show('originPrice')" />
          <p class="mt-1 text-xs text-red-700">{{ show('originPrice') }}</p>
        </div>
        <div>
          <label for="pf-stock" class="mb-1 block text-sm font-medium">庫存 *</label>
          <input id="pf-stock" v-model="form.stock" type="number" min="0" step="1" inputmode="numeric" class="input" :aria-invalid="!!show('stock')" />
          <p class="mt-1 text-xs text-red-700">{{ show('stock') }}</p>
        </div>
        <div>
          <label for="pf-unit" class="mb-1 block text-sm font-medium">單位</label>
          <input id="pf-unit" v-model="form.unit" class="input" maxlength="10" placeholder="顆" />
        </div>
        <div class="sm:col-span-2">
          <label for="pf-imageUrl" class="mb-1 block text-sm font-medium">主圖網址 *</label>
          <div class="flex gap-3">
            <input id="pf-imageUrl" v-model="form.imageUrl" type="url" class="input" placeholder="https://…" :aria-invalid="!!show('imageUrl')" />
            <img v-if="!errors.imageUrl" :src="form.imageUrl" alt="主圖預覽" class="h-11 w-11 shrink-0 rounded-lg bg-white object-contain ring-1 ring-sand" />
          </div>
          <p class="mt-1 text-xs text-red-700">{{ show('imageUrl') }}</p>
        </div>
        <div class="sm:col-span-2">
          <label for="pf-description" class="mb-1 block text-sm font-medium">商品簡述</label>
          <textarea id="pf-description" v-model="form.description" rows="2" maxlength="2000" class="input" />
        </div>
        <div class="sm:col-span-2">
          <label for="pf-content" class="mb-1 block text-sm font-medium">商品說明</label>
          <textarea id="pf-content" v-model="form.content" rows="4" maxlength="5000" class="input" />
        </div>
        <label class="flex items-center gap-2 text-sm sm:col-span-2">
          <input v-model="form.isEnabled" type="checkbox" class="h-4 w-4 accent-brand" />
          上架（取消勾選則前台看不到此商品）
        </label>
      </div>

      <footer class="flex justify-end gap-3 border-t border-sand px-6 py-4">
        <button type="button" class="btn-ghost" @click="close">取消</button>
        <button type="submit" class="btn-primary" :disabled="saving">{{ saving ? '儲存中…' : isEdit ? '儲存變更' : '新增商品' }}</button>
      </footer>
    </form>
  </dialog>
</template>
