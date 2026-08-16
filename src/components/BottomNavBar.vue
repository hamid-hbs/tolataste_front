<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Home, Utensils, ShoppingCart, User, Users,
  ClipboardList, ChefHat, TrendingUp, ShieldCheck, TableIcon,
} from '@lucide/vue'
import { cartState as cart } from '@/state/cart'
import { authState as auth } from '@/state/auth'
const route = useRoute()
const router = useRouter()

const activeName = computed(() => route.name)

function go(name) {
  router.push({ name })
}

const navItems = computed(() => {
  const role = auth.userRole

  if (role === 'client') {
    return [
      { name: 'home', label: 'Accueil', icon: Home },
      { name: 'client-menu', label: 'Menu', icon: Utensils },
      { name: 'client-commande', label: 'Panier', icon: ShoppingCart, badge: () => cart.count, isRaised: true },
      { name: 'client-commandes', label: 'Commandes', icon: ClipboardList },
      { name: 'client-profil', label: 'Profil', icon: User },
    ]
  }

  const staffNav = {
    serveur: [
      { name: 'serveur-tables', label: 'Tables', icon: TableIcon },
      { name: 'serveur-commandes', label: 'Commandes', icon: ShoppingCart },
      { name: 'serveur-suivi', label: 'Suivi', icon: ClipboardList },
      { name: 'serveur-encaissement', label: 'Encaissement', icon: TrendingUp },
    ],
    cuisine: [
      { name: 'cuisine', label: 'Cuisine', icon: ChefHat },
    ],
    manager: [
      { name: 'manager-dashboard', label: 'Stats', icon: TrendingUp },
      { name: 'manager-menu', label: 'Menu', icon: Utensils },
      { name: 'manager-rapports', label: 'Rapports', icon: ClipboardList },
    ],
    admin: [
      { name: 'admin-dashboard', label: 'Admin', icon: ShieldCheck },
      { name: 'admin-users', label: 'Utilisateurs', icon: Users },
      { name: 'admin-tables', label: 'Tables', icon: TableIcon },
    ],
  }

  return (staffNav[role] ?? []).map((item) => ({
    ...item, badge: undefined, isRaised: false,
  }))
})
</script>

<template>
  <nav v-if="auth.isLoggedIn" class="fixed inset-x-0 bottom-0 z-40 border-t border-tola-cream-dark bg-white/95 backdrop-blur-md safe-bottom md:hidden">
    <div class="mx-auto flex max-w-md items-end justify-around px-1">
      <template v-for="item in navItems" :key="item.name">
        <div v-if="item.isRaised" class="flex w-16 shrink-0 justify-center">
          <button @click="go(item.name)" class="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-tola-orange text-white shadow-lg shadow-tola-orange/40 ring-4 ring-white transition active:scale-95" :aria-label="item.label">
            <component :is="item.icon" :size="22" />
            <span v-if="item.badge && item.badge() > 0" class="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-tola-red px-1 text-[10px] font-bold text-white ring-2 ring-white">
              {{ item.badge() > 99 ? '99+' : item.badge() }}
            </span>
          </button>
        </div>
        <button v-else @click="go(item.name)" class="relative flex flex-1 flex-col items-center gap-0.5 py-2.5 transition">
          <component :is="item.icon" :size="20" :stroke-width="activeName === item.name ? 2.5 : 1.8"
            :class="activeName === item.name ? 'text-tola-orange' : 'text-tola-gray'" />
          <span class="text-[10px] font-medium" :class="activeName === item.name ? 'text-tola-orange' : 'text-tola-gray'">{{ item.label }}</span>
        </button>
      </template>
    </div>
  </nav>
</template>
