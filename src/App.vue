<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from './components/Header.vue'

const route = useRoute()
const showHeader = computed(() => route.meta.showHeader === true)
</script>

<template>
  <div id="app" class="main">
    <!-- Header nur auf den Seiten mit meta.showHeader -->
    <Header v-if="showHeader" />
    <router-view />
  </div>
</template>

<style lang="scss" scoped>
@import './assets/styles.scss';
@import './css/main.css';
</style>
