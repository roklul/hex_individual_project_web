<script setup>
import StatusMessage from '@/components/common/StatusMessage.vue'
</script>
<template>
  <div class="container-page py-20">
    <StatusMessage title="找不到這個頁面" description="網址可能有誤，或頁面已被移除。">
      <RouterLink to="/" class="btn-primary">回到首頁</RouterLink>
    </StatusMessage>
  </div>
</template>
