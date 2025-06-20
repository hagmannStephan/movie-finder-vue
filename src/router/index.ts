import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import LoginView from '../views/loginView.vue'
import RegisterView from '../views/registerView.vue'
import HomeView from '../views/homeView.vue'
import SettingsView from '../views/settingsView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { showHeader: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
    meta: { showHeader: false }
  },
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { showHeader: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsView,
    meta: { showHeader: true }
  },
  // weitere Routen …
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
