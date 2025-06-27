<template>
  <header class="app-header">
    <router-link to="/home" class="icon-button" aria-label="Home">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
           viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m5 0H6"/>
      </svg>
    </router-link>

    <router-link to="/settings" class="icon-button" aria-label="Settings">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
           viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
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
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #2a2a2a;
  border-bottom: 1px solid #444;
  position: sticky;
  top: 0;
  z-index: 100;
}

.icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  color: #888;
  text-decoration: none;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
}

.icon-button:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.icon-button.router-link-active {
  color: #4CAF50;
  background: rgba(76, 175, 80, 0.1);
}

.h-6 {
  width: 24px;
  height: 24px;
}

.w-6 {
  width: 24px;
  height: 24px;
}
</style>
