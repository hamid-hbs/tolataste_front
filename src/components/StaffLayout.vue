<template>
  <div class="app-layout">
    <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false"></div>
    <aside class="app-sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-brand">
        <img class="brand-icon" src="/TolaTaste.jpeg" alt="Tola Taste" />
        <div class="brand-text">
          <div class="brand-name">Tola Taste</div>
          <div class="brand-role">{{ auth.roleLabels[auth.userRole] }}</div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <router-link v-for="link in navLinks" :key="link.to" :to="link.to"
          class="nav-item" :class="{ active: $route.path.startsWith(link.to) }" @click="sidebarOpen = false">
          <component :is="link.icon" :size="18" class="nav-icon" :stroke-width="1.8" />
          <span class="nav-label">{{ link.label }}</span>
          <span v-if="link.badge && link.badge() > 0" class="nav-badge">{{ link.badge() }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="user-card">
          <div class="user-avatar">{{ auth.user?.name?.charAt(0) }}</div>
          <div class="user-info">
            <div class="user-name">{{ auth.user?.name }}</div>
            <div class="user-role">{{ auth.roleLabels[auth.userRole] }}</div>
          </div>
        </div>
        <button @click="handleLogout" class="btn btn-ghost btn-sm w-full mt-2">Déconnexion</button>
      </div>
    </aside>

    <div class="app-main">
      <header class="app-header">
        <div class="header-left">
          <button class="burger-btn" @click="sidebarOpen = true" aria-label="Ouvrir le menu">
            <Menu :size="22" />
          </button>
          <h2>{{ pageTitle }}</h2>
        </div>
        <div class="header-actions">
          <NotificationBell />
          <span class="header-date">{{ new Date().toLocaleDateString('fr-FR', { dateStyle: 'full' }) }}</span>
        </div>
      </header>
      <div class="app-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authState } from '@/state/auth'
import { ordersState } from '@/state/orders'
import { tablesState } from '@/state/tables'
import { settingsState } from '@/state/settings'
import { notificationsState } from '@/state/notifications'
import { menuState } from '@/state/menu'
import { confirmLogout } from '@/utils/confirm'
import NotificationBell from '@/components/NotificationBell.vue'
import {
  LayoutGrid, ClipboardList, BarChart3, CreditCard, ChefHat,
  Utensils, Users, FolderOpen, Menu,
} from '@lucide/vue'

const auth = authState
const orders = ordersState
const tables = tablesState
const settingsStore = settingsState
const notif = notificationsState
const router = useRouter()
const route = useRoute()
const sidebarOpen = ref(false)
let refreshTimer

watch(() => route.path, () => { sidebarOpen.value = false })

function closeOnEscape(e) {
  if (e.key === 'Escape') sidebarOpen.value = false
}

onMounted(() => {
  window.addEventListener('keydown', closeOnEscape)
  orders.fetchAll()
  tables.fetchAll()
  auth.fetchUsers()
  settingsStore.fetchSettings()
  if (menuState.items.length === 0) menuState.fetchAll()
  refreshTimer = window.setInterval(() => orders.fetchAll(), 30000)
})

onUnmounted(() => {
  if (refreshTimer) window.clearInterval(refreshTimer)
  window.removeEventListener('keydown', closeOnEscape)
})

const navLinks = computed(() => {
  const r = auth.userRole
  if (r === 'serveur') return [
    { to: '/serveur/tables', label: 'Tables', icon: LayoutGrid, badge: undefined },
    { to: '/serveur/commandes', label: 'Commandes', icon: ClipboardList, badge: () => orders.clientNewOrders.length },
    { to: '/serveur/suivi', label: 'Suivi', icon: BarChart3, badge: () => orders.readyOrders.length },
    { to: '/serveur/encaissement', label: 'Encaissement', icon: CreditCard, badge: () => orders.unpaidServed.length },
  ]
  if (r === 'cuisine') return [
    { to: '/cuisine', label: 'Préparation', icon: ChefHat, badge: () => orders.waitingOrders.length },
  ]
  if (r === 'manager') return [
    { to: '/manager/dashboard', label: 'Dashboard', icon: BarChart3 },
    { to: '/manager/menu', label: 'Menu', icon: Utensils },
    { to: '/manager/stats', label: 'Statistiques', icon: BarChart3 },
  ]
if (r === 'admin') return [
    { to: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
    { to: '/admin/menu', label: 'Menu', icon: Utensils },
    { to: '/admin/users', label: 'Utilisateurs', icon: Users },
    { to: '/admin/tables', label: 'Tables', icon: LayoutGrid },
    { to: '/admin/categories', label: 'Catégories', icon: FolderOpen },
  ]
  return []
})

const pageTitle = computed(() => {
  const name = route.name
  const titles = {
    'serveur-tables': 'Tables',
    'serveur-commandes': 'Nouvelles commandes',
    'serveur-suivi': 'Suivi des commandes',
    'serveur-encaissement': 'Encaissement',
    'cuisine': 'Préparation en cuisine',
    'manager-dashboard': 'Tableau de bord',
    'manager-menu': 'Gestion du menu',
    'manager-rapports': 'Rapports',
    'manager-stats': 'Statistiques',
    'admin-dashboard': 'Dashboard',
    'admin-menu': 'Gestion du menu',
    'admin-users': 'Utilisateurs',
    'admin-tables': 'Configuration des tables',
    'admin-categories': 'Catégories',
  }
  return titles[name] ?? 'Tola Taste'
})

function handleLogout() {
  confirmLogout(() => {
    auth.logout()
    notif.add({ type: 'info', title: 'Déconnexion', message: 'À bientôt !' })
    router.push('/login')
  })
}
</script>

<style scoped>
.app-layout { display: flex; min-height: 100vh; background: #f4f1ec; }
.sidebar-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 90;
}
.app-sidebar {
  position: fixed; top: 0; left: 0; bottom: 0; width: 260px; max-width: 85vw;
  background: #1a1a1a;
  display: flex; flex-direction: column; z-index: 100;
  transform: translateX(-105%);
  transition: transform 0.22s ease;
}
.app-sidebar.open { transform: translateX(0); }
.app-main { margin-left: 0; flex: 1; display: flex; flex-direction: column; min-height: 100vh; min-width: 0; }
.app-header {
  position: sticky; top: 0; z-index: 50;
  background: rgba(255,255,255,0.85); backdrop-filter: blur(12px);
  border-bottom: 1px solid #e8e2d6;
  display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
  padding: 0.75rem 1rem;
}
.header-left { display: flex; align-items: center; gap: 0.625rem; min-width: 0; }
.burger-btn {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 44px; min-height: 44px; border: none; border-radius: 0.75rem;
  background: #1a1a1a; color: #fff; cursor: pointer;
}
.app-header h2 {
  font-size: 1.05rem; font-weight: 800; color: #1a1a1a; margin: 0;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.header-actions { display: flex; align-items: center; gap: 0.625rem; min-width: 0; }
.header-date { display: none; font-size: 0.8125rem; color: #6b7280; }
.app-content { flex: 1; padding: 1rem; min-width: 0; }

@media (min-width: 640px) {
  .app-content { padding: 1.5rem; }
  .app-header { padding: 1rem 1.5rem; }
  .app-header h2 { font-size: 1.25rem; }
  .header-date { display: block; }
}

@media (min-width: 1024px) {
  .app-sidebar { transform: none; width: 240px; }
  .sidebar-overlay { display: none; }
  .burger-btn { display: none; }
  .app-main { margin-left: 240px; }
}

.sidebar-brand { display: flex; align-items: center; gap: 0.75rem; padding: 1.25rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.08); }
.brand-icon { width: 40px; height: 40px; border-radius: 10px; object-fit: cover; }
.brand-name { font-weight: 800; font-size: 1rem; color: #fff; }
.brand-role { font-size: 0.7rem; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.05em; }

.sidebar-nav { flex: 1; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.25rem; overflow-y: auto; }
.nav-item {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.75rem 0.875rem; border-radius: 0.625rem;
  color: rgba(255,255,255,0.65); text-decoration: none;
  font-size: 0.875rem; font-weight: 600; transition: all 0.15s;
  min-height: 44px;
}
.nav-item:hover { background: rgba(255,255,255,0.08); color: #fff; }
.nav-item.active { background: #e8720c; color: #fff; }
.nav-icon { width: 1.25rem; text-align: center; flex-shrink: 0; }
.nav-label { flex: 1; }
.nav-badge {
  background: #ef4444; color: #fff; font-size: 0.65rem; font-weight: 700;
  padding: 0.125rem 0.5rem; border-radius: 999px; line-height: 1.3;
}

.sidebar-footer { padding: 0.75rem; border-top: 1px solid rgba(255,255,255,0.08); }
.user-card { display: flex; align-items: center; gap: 0.625rem; padding: 0.5rem; border-radius: 0.5rem; background: rgba(255,255,255,0.05); }
.user-avatar { width: 36px; height: 36px; border-radius: 50%; background: #e8720c; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem; color: #fff; }
.user-info { flex: 1; min-width: 0; }
.user-name { font-weight: 700; font-size: 0.8125rem; color: #fff; }
.user-role { font-size: 0.65rem; color: rgba(255,255,255,0.5); }

.btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; font-weight: 700; border: none; border-radius: 0.75rem; cursor: pointer; transition: all 0.15s; font-size: 0.8125rem; padding: 0.625rem 1.25rem; }
.btn-sm { padding: 0.375rem 0.75rem; font-size: 0.75rem; }
.btn-ghost { background: transparent; color: rgba(255,255,255,0.6); }
.btn-ghost:hover { background: rgba(255,255,255,0.08); color: #fff; }
</style>
