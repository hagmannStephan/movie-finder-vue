<template>
  <header class="app-header">
    <router-link to="/" class="icon-button" aria-label="Home">
      <!-- z.B. Heroicon Home -->
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
           viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m5 0H6"/>
      </svg>
    </router-link>

    <router-link to="/settings" class="icon-button" aria-label="Settings">
      <!-- z.B. Heroicon Cog -->
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
           viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0a1.724
                 1.724 0 002.592 1.163c.867-.5 1.93.164
                 1.93 1.118 0 .952-1.063 1.618-1.93
                 1.118a1.724 1.724 0 00-2.592 1.162c-.3.921-1.602.921-1.902
                 0a1.724 1.724 0 00-2.592-1.163c-.867.5-1.93-.164-1.93-1.118
                 0-.952 1.063-1.618 1.93-1.118a1.724 1.724 0
                 002.592-1.162z"/>
      </svg>
    </router-link>
  </header>
</template>

<script setup lang="ts">
// keine zusätzliche Logik nötig
</script>

<style scoped>
.app-header {
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
  background: var(--color-bg-header);
}

.icon-button {
  margin-left: 1rem;
  cursor: pointer;
}
</style>
