import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import SwipeView from '../views/swipeView.vue'
import HomeView from '../views/homeView.vue'
import SettingsView from '../views/settingsView.vue'
import loginView from '../views/loginView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: loginView,
    meta: { showHeader: false, requiresAuth: false }
  },
  {
    path: '/swipe',
    name: 'Swipe',
    component: SwipeView,
    meta: { showHeader: true, requiresAuth: true }
  },
  {
    path: '/home',
    name: 'Home',
    component: HomeView,
    meta: { showHeader: true, requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsView,
    meta: { showHeader: true, requiresAuth: true }
  },
  // weitere Routen …
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Auth Guard
router.beforeEach((to) => {
  const isAuthenticated = !!localStorage.getItem('authToken')
  
  if (!isAuthenticated && to.path !== '/login' && to.path !== '/register') {
    return '/login'
  }
  
  if (isAuthenticated && (to.path === '/login' || to.path === '/register')) {
    return '/swipe'
  }
})

export default router
