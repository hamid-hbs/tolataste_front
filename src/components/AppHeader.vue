<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ShoppingCart, User, Search, Menu as MenuIcon, X, LogOut,
} from '@lucide/vue'
import BrandLogo from './BrandLogo.vue'
import NotificationBell from './NotificationBell.vue'
import { cartState as cart } from '@/state/cart'
import { authState as auth } from '@/state/auth'
import { confirmLogout } from '@/utils/confirm'

const route = useRoute()
const router = useRouter()
const mobileOpen = ref(false)

const clientLinks = [
  { name: 'home', label: 'Accueil' },
  { name: 'client-menu', label: 'Menu' },
  { name: 'client-commandes', label: 'Mes commandes' },
  { name: 'client-profil', label: 'Profil' },
]

const staffLinks = computed(() => {
  const role = auth.userRole
  if (role === 'serveur') return [
    { name: 'serveur-tables', label: 'Tables' },
    { name: 'serveur-commandes', label: 'Commandes' },
    { name: 'serveur-suivi', label: 'Suivi' },
    { name: 'serveur-encaissement', label: 'Encaissement' },
  ]
  if (role === 'cuisine') return [
    { name: 'cuisine', label: 'Cuisine' },
  ]
  if (role === 'manager') return [
    { name: 'manager-dashboard', label: 'Dashboard' },
    { name: 'manager-menu', label: 'Menu' },
    { name: 'manager-rapports', label: 'Rapports' },
  ]
  if (role === 'admin') return [
    { name: 'admin-dashboard', label: 'Admin' },
    { name: 'admin-users', label: 'Utilisateurs' },
    { name: 'admin-tables', label: 'Tables' },
    { name: 'admin-categories', label: 'Catégories' },
  ]
  return clientLinks
})

const activeName = computed(() => route.name)
const isClient = computed(() => auth.userRole === 'client')

function go(name) {
  router.push({ name })
  mobileOpen.value = false
}

function handleLogout() {
  confirmLogout(() => {
    auth.logout()
    router.push({ name: 'login' })
  })
}
</script>

<template>
  <header v-if="auth.isLoggedIn" class="sticky top-0 z-40 border-b border-tola-cream-dark bg-white/90 backdrop-blur-md">
    <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
      <button @click="go('home')" class="flex items-center gap-2.5">
        <BrandLogo :size="40" />
        <div class="flex flex-col leading-none">
          <span class="font-display text-xl font-extrabold tracking-tight text-tola-ink">
            Tola <span class="font-script text-2xl font-bold text-tola-orange">Taste</span>
          </span>
          <span class="text-[10px] font-medium uppercase tracking-wider text-tola-gray">
            {{ isClient ? 'The sweetest meal' : auth.roleLabels[auth.userRole] }}
          </span>
        </div>
      </button>

      <nav class="hidden items-center gap-1 md:flex">
        <button v-for="link in staffLinks" :key="link.name" @click="go(link.name)"
          class="rounded-full px-4 py-2 text-sm font-semibold transition"
          :class="activeName === link.name ? 'bg-tola-orange/10 text-tola-orange' : 'text-tola-gray hover:bg-tola-cream hover:text-tola-ink'">
          {{ link.label }}
        </button>
      </nav>

      <div class="flex items-center gap-1.5">
        <NotificationBell />

        <template v-if="isClient">
          <button @click="go('client-menu')" class="hidden h-10 w-10 items-center justify-center rounded-full text-tola-gray transition hover:bg-tola-cream hover:text-tola-ink sm:flex" aria-label="Rechercher">
            <Search :size="20" />
          </button>
          <button @click="go('client-profil')" class="hidden h-10 w-10 items-center justify-center rounded-full text-tola-gray transition hover:bg-tola-cream hover:text-tola-ink sm:flex" aria-label="Profil">
            <User :size="20" />
          </button>
          <button @click="go('client-commande')" class="relative flex h-10 w-10 items-center justify-center rounded-full text-tola-ink transition hover:bg-tola-cream" aria-label="Panier">
            <ShoppingCart :size="20" />
            <span v-if="cart.count > 0" class="absolute right-0 top-0 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-tola-red px-1 text-[9px] font-bold text-white">{{ cart.count > 99 ? '99+' : cart.count }}</span>
          </button>
        </template>

        <button v-else @click="handleLogout" class="hidden h-10 w-10 items-center justify-center rounded-full text-tola-gray transition hover:bg-tola-cream hover:text-tola-red sm:flex" aria-label="Déconnexion">
          <LogOut :size="20" />
        </button>

        <button @click="mobileOpen = !mobileOpen" class="flex h-10 w-10 items-center justify-center rounded-full text-tola-ink transition hover:bg-tola-cream md:hidden" aria-label="Menu">
          <component :is="mobileOpen ? X : MenuIcon" :size="22" />
        </button>
      </div>
    </div>

    <Transition name="slide">
      <div v-if="mobileOpen" class="border-t border-tola-cream-dark bg-white px-4 py-3 md:hidden">
        <button v-for="link in staffLinks" :key="link.name" @click="go(link.name)"
          class="block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition"
          :class="activeName === link.name ? 'bg-tola-orange/10 text-tola-orange' : 'text-tola-gray hover:bg-tola-cream'">
          {{ link.label }}
        </button>
        <button v-if="!isClient" @click="handleLogout" class="mt-2 block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-tola-red transition hover:bg-tola-red/10">
          Déconnexion
        </button>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: all 0.2s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
