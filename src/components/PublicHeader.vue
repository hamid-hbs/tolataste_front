<script setup>
import { useRouter, useRoute } from 'vue-router'
import { authState as auth } from '@/state/auth'
import { confirmLogout } from '@/utils/confirm'
import { User, LogOut, Menu as MenuIcon, X } from '@lucide/vue'
import { ref, computed } from 'vue'
import BrandLogo from '@/components/BrandLogo.vue'

const router = useRouter()
const route = useRoute()
const mobileOpen = ref(false)

const navLinks = computed(() => {
  const links = [
    { to: '/', label: 'Accueil' },
    { to: '/client/menu', label: 'Menu' },
  ]
  if (auth.isLoggedIn) {
    links.push({ to: '/client/commandes', label: 'Mes commandes' })
    links.push({ to: '/client/profil', label: 'Profil' })
  }
  return links
})

function go(to) {
  router.push(to)
  mobileOpen.value = false
}

function handleLogout() {
  confirmLogout(() => {
    auth.logout()
    go('/login')
  })
}
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-tola-cream-dark bg-white">
    <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
      <button @click="go('/')" class="flex items-center gap-2.5">
        <BrandLogo />
        <div class="flex flex-col leading-none">
          <span class="font-display text-xl font-extrabold tracking-tight text-tola-ink">
            Tola <span class="font-script text-2xl font-bold text-tola-orange">Taste</span>
          </span>
        </div>
      </button>

      <nav class="hidden items-center gap-1 md:flex">
        <button v-for="link in navLinks" :key="link.to" @click="go(link.to)"
          class="rounded-full px-4 py-2 text-sm font-semibold transition"
          :class="route.path === link.to ? 'bg-tola-orange/10 text-tola-orange' : 'text-tola-gray hover:bg-tola-cream hover:text-tola-ink'">
          {{ link.label }}
        </button>
      </nav>

      <div class="flex items-center gap-2">
        <template v-if="auth.isLoggedIn">
          <button @click="handleLogout" class="flex items-center gap-1.5 rounded-full border border-tola-cream-dark px-4 py-2 text-sm font-bold text-tola-gray transition hover:bg-tola-cream hover:text-tola-red" aria-label="Déconnexion">
            <LogOut :size="16" /> Déconnexion
          </button>
        </template>
        <button v-else @click="go('/login')" class="flex items-center gap-1.5 rounded-full bg-tola-orange px-4 py-2 text-sm font-bold text-white transition hover:bg-tola-orange-dark">
          <User :size="16" /> Connexion
        </button>

        <button @click="mobileOpen = !mobileOpen" class="flex h-10 w-10 items-center justify-center rounded-full text-tola-ink transition hover:bg-tola-cream md:hidden" aria-label="Menu">
          <component :is="mobileOpen ? X : MenuIcon" :size="22" />
        </button>
      </div>
    </div>

    <Transition name="slide">
      <div v-if="mobileOpen" class="border-t border-tola-cream-dark bg-white px-4 py-3 md:hidden">
        <button v-for="link in navLinks" :key="link.to" @click="go(link.to)"
          class="block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition"
          :class="route.path === link.to ? 'bg-tola-orange/10 text-tola-orange' : 'text-tola-gray hover:bg-tola-cream'">
          {{ link.label }}
        </button>
        <button v-if="auth.isLoggedIn" @click="handleLogout" class="mt-2 block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-tola-red transition hover:bg-tola-red/10">
          Déconnexion
        </button>
        <button v-else @click="go('/login')" class="mt-2 block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-tola-orange transition hover:bg-tola-orange/10">
          Connexion
        </button>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: all 0.2s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
