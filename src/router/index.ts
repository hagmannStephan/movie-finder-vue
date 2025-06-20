import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import MainView from '../views/mainView.vue'
import SettingsView from '../views/settingsView.vue'

const routes: Array<RouteRecordRaw> = [
{
    path: '/',
    name: 'Root',
    component: MainView,
    meta: { showHeader: false }
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
