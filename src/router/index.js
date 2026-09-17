import { createRouter, createWebHistory } from 'vue-router'
import { authState } from '@/state/auth'

const routes = [
  { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
  { path: '/login', name: 'login', component: () => import('@/views/auth/LoginView.vue') },
  { path: '/register', name: 'register', component: () => import('@/views/auth/RegisterView.vue') },
  { path: '/confidentialite', name: 'privacy', component: () => import('@/views/legal/PrivacyPolicyView.vue') },
  { path: '/mentions-legales', name: 'legal', component: () => import('@/views/legal/LegalNoticeView.vue') },

  // Client
  {
    path: '/client',
    component: () => import('@/views/client/ClientLayout.vue'),
    children: [
      { path: '', redirect: '/client/menu' },
      { path: 'menu', name: 'client-menu', component: () => import('@/views/client/MenuView.vue') },
      { path: 'commandes', name: 'client-commandes', component: () => import('@/views/client/MesCommandesView.vue'), meta: { requiresAuth: true } },
      { path: 'profil', name: 'client-profil', component: () => import('@/views/client/ProfilView.vue'), meta: { requiresAuth: true } },
      { path: 'commande', name: 'client-commande', component: () => import('@/views/client/CommandeView.vue'), meta: { requiresAuth: true } },
      { path: 'confirmation/:id', name: 'client-confirmation', component: () => import('@/views/client/ConfirmationView.vue'), props: true, meta: { requiresAuth: true } },
    ],
  },

  // Serveur
  {
    path: '/serveur',
    component: () => import('@/components/StaffLayout.vue'),
    meta: { role: 'serveur' },
    children: [
      { path: '', redirect: '/serveur/tables' },
      { path: 'tables', name: 'serveur-tables', component: () => import('@/views/serveur/TablesView.vue') },
      { path: 'commandes', name: 'serveur-commandes', component: () => import('@/views/serveur/CommandesView.vue') },
      { path: 'suivi', name: 'serveur-suivi', component: () => import('@/views/serveur/SuiviView.vue') },
      { path: 'encaissement', name: 'serveur-encaissement', component: () => import('@/views/serveur/EncaissementView.vue') },
    ],
  },

  // Cuisine
  {
    path: '/cuisine',
    component: () => import('@/components/StaffLayout.vue'),
    meta: { role: 'cuisine' },
    children: [
      { path: '', name: 'cuisine', component: () => import('@/views/cuisine/CuisineDashboard.vue') },
    ],
  },

  // Manager
  {
    path: '/manager',
    component: () => import('@/components/StaffLayout.vue'),
    meta: { role: 'manager' },
    children: [
      { path: '', redirect: '/manager/dashboard' },
      { path: 'dashboard', name: 'manager-dashboard', component: () => import('@/views/manager/DashboardView.vue') },
      { path: 'menu', name: 'manager-menu', component: () => import('@/views/manager/MenuManagerView.vue') },
      { path: 'stats', name: 'manager-stats', component: () => import('@/views/StatsView.vue') },
    ],
  },

  // Admin
  {
    path: '/admin',
    component: () => import('@/components/StaffLayout.vue'),
    meta: { role: 'admin' },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', name: 'admin-dashboard', component: () => import('@/views/admin/AdminDashboard.vue') },
      { path: 'users', name: 'admin-users', component: () => import('@/views/admin/UsersView.vue') },
      { path: 'tables', name: 'admin-tables', component: () => import('@/views/admin/TablesAdminView.vue') },
      { path: 'categories', name: 'admin-categories', component: () => import('@/views/admin/CategoriesView.vue') },
      { path: 'menu', name: 'admin-menu', component: () => import('@/views/admin/AdminMenuView.vue') },
    ],
  },

  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, saved) { return saved ?? { top: 0 } },
})

router.beforeEach((to, _from, next) => {
  const auth = authState

  if (to.meta?.requiresAuth && !auth.isLoggedIn) {
    return next('/login')
  }

  if (to.meta?.role) {
    const role = to.meta.role
    if (!auth.isLoggedIn) return next('/login')
    if (!auth.hasRole(role)) return next('/')
    return next()
  }

  next()
})

export default router
