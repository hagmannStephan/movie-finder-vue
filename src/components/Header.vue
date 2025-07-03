<template>
  <header class="app-header">
    <!-- Left Icon - depends on current route -->
    <router-link 
      :to="leftIconRoute" 
      class="icon-button" 
      :aria-label="leftIconLabel"
    >
      <!-- Settings Icon for Swipe View -->
      <svg v-if="isSwipeView" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
           viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
      
      <!-- Star Icon for Settings View -->
      <svg v-else-if="isSettingsView" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
      </svg>
      
      <!-- Default Home Icon -->
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
           viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m5 0H6"/>
      </svg>
    </router-link>

    <!-- Right Icon - depends on current route -->
    <router-link 
      :to="rightIconRoute" 
      class="icon-button" 
      :aria-label="rightIconLabel"
    >
      <!-- Star Icon for Swipe View -->
      <svg v-if="isSwipeView" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
      </svg>
      
      <!-- Home Icon for Settings View -->
      <svg v-else-if="isSettingsView" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
           viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 22V12H15V22"/>
      </svg>
      
      <!-- Default Settings Icon -->
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
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
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { compileTemplate } from 'vue/compiler-sfc'

const route = useRoute()

// Check current route
const isSwipeView = computed(() => route.path === '/swipe')
const isSettingsView = computed(() => route.path === '/settings')
const isHomeView = computed(() => route.path === "/home")

// Dynamic routing based on current page
const leftIconRoute = computed(() => {
  if (isSwipeView.value) return '/settings'
  if (isSettingsView.value) return '/home'
  if (isHomeView.value) return "/swipe"
  return '/home' // default
})

const rightIconRoute = computed(() => {
  if (isSwipeView.value) return '/home'
  if (isSettingsView.value) return '/swipe'
  return '/settings' // default
})

// Dynamic labels
const leftIconLabel = computed(() => {
  if (isSwipeView.value) return 'Settings'
  if (isSettingsView.value) return 'Create Group'
  return 'Home'
})

const rightIconLabel = computed(() => {
  if (isSwipeView.value) return 'Create Group'
  if (isSettingsView.value) return 'Home'
  return 'Settings'
})
</script>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 20px;
  background: #2a2a2a;
  border-bottom: 1px solid #444;
  position: sticky;
  top: 0;
  z-index: 100;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

.icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 33px;
  height: 33px;
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
