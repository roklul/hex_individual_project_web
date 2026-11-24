<script setup>
const tabs = [
  { to: { name: 'admin-products' }, label: '商品管理' },
  { to: { name: 'admin-orders' }, label: '訂單管理' },
]
</script>

<template>
  <div class="container-page py-8 sm:py-12">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-xs tracking-widest text-accent">ADMIN</p>
        <h1 class="font-serif text-3xl text-brand">後台管理</h1>
      </div>
      <nav aria-label="後台選單">
        <ul class="flex gap-1 rounded-full bg-white p-1 ring-1 ring-sand">
          <li v-for="t in tabs" :key="t.label">
            <RouterLink :to="t.to" class="block rounded-full px-4 py-2 text-sm hover:bg-sand" active-class="!bg-brand text-cream">{{ t.label }}</RouterLink>
          </li>
        </ul>
      </nav>
    </header>
    <RouterView class="mt-8" />
  </div>
</template>
