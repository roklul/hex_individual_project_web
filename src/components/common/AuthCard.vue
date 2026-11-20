<script setup>
defineProps({ title: String, subtitle: String })
</script>
<template>
  <div class="container-page flex justify-center py-12 sm:py-20">
    <section class="w-full max-w-md rounded-3xl bg-white p-6 shadow-sm ring-1 ring-sand sm:p-10" :aria-label="title">
      <h1 class="font-serif text-2xl text-brand">{{ title }}</h1>
      <p v-if="subtitle" class="mt-1 text-sm text-ink/60">{{ subtitle }}</p>
      <slot />
    </section>
  </div>
</template>
