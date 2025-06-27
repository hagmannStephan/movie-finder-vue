import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import LoginView from '../views/loginView.vue'
import RegisterView from '../views/registerView.vue'
import HomeView from '../views/homeView.vue'
import SettingsView from '../views/settingsView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { showHeader: false, requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
    meta: { showHeader: false, requiresAuth: false }
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
    return '/home'
  }
})

export default router
