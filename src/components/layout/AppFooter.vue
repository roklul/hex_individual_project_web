<template>
  <footer class="mt-16 border-t border-sand bg-sand/40">
    <div class="container-page grid gap-8 py-10 text-sm sm:grid-cols-3">
      <section>
        <h2 class="font-serif text-lg font-bold text-brand">EMMA 電子零件</h2>
        <p class="mt-2 text-ink/60">IC、電源模組、光耦、連接器等庫存電子零件，小量也能買。</p>
      </section>
      <nav aria-label="頁尾連結">
        <h2 class="font-medium">逛逛</h2>
        <ul class="mt-2 space-y-1 text-ink/60">
          <li><RouterLink to="/products" class="hover:text-brand">全部商品</RouterLink></li>
          <li><RouterLink to="/cart" class="hover:text-brand">購物車</RouterLink></li>
        </ul>
      </nav>
      <address class="not-italic text-ink/60">
        <h2 class="font-medium not-italic text-ink">聯絡我們</h2>
        <p class="mt-2">週一至週五 10:00–18:00</p>
      </address>
    </div>
    <p class="border-t border-sand py-4 text-center text-xs text-ink/50">© {{ new Date().getFullYear() }} EMMA Collection · 本網站為作品展示用途</p>
  </footer>
</template>
