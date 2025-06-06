<script setup lang="ts">
import Helloworld from './components/HelloWorld.vue'
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <div class="app">
    <main class="main">
      <p>Welcome to the app!</p>
      <button @click="count++">Clicked {{ count }} times</button>
    </main>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  font-family: sans-serif;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
