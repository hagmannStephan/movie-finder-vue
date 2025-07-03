<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from './components/Header.vue'

const route = useRoute()
const showHeader = computed(() => route.meta.showHeader === true)
</script>

<template>
  <div class="mobile-view">
    <div class="mobile-container">
      <Header v-if="showHeader" />
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.mobile-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fff 0%, #2d2d2d 100%);
}

.mobile-container {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 350px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
</style>
