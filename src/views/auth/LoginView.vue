<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authState } from '@/state/auth'
import { LogIn, User } from '@lucide/vue'

const auth = authState
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const quickUsers = [
  { role: 'serveur', label: 'Serveur', email: 'sophie@tolataste.com' },
  { role: 'cuisine', label: 'Cuisine', email: 'cuisine@tolataste.com' },
  { role: 'manager', label: 'Manager', email: 'manager@tolataste.com' },
  { role: 'admin', label: 'Admin', email: 'admin@tolataste.com' },
]

const roleRoutes = {
  client: '/client/menu',
  serveur: '/serveur/tables',
  cuisine: '/cuisine',
  manager: '/manager/dashboard',
  admin: '/admin/dashboard',
}

async function handleLogin() {
  error.value = ''
  loading.value = true
  const ok = await auth.login(email.value, password.value)
  loading.value = false
  if (!ok) {
    error.value = 'Email ou mot de passe incorrect'
    return
  }
  redirectAfterLogin()
}

async function handleQuickLogin(role) {
  loading.value = true
  const ok = await auth.quickLogin(role)
  loading.value = false
  if (!ok) {
    error.value = 'Connexion rapide indisponible'
    return
  }
  redirectAfterLogin()
}

function redirectAfterLogin() {
  const route = roleRoutes[auth.userRole]
  if (route) router.push(route)
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-sm">
      <div class="mb-8 text-center">
        <img src="/TolaTaste.jpeg" alt="Tola Taste" class="mx-auto mb-4 h-16 w-16 rounded-2xl object-cover" />
        <h1 class="text-2xl font-extrabold text-gray-900">Tola Taste</h1>
        <p class="mt-1 text-sm text-gray-500">Connectez-vous pour continuer</p>
      </div>

      <form @submit.prevent="handleLogin" class="rounded-2xl bg-white p-6 ring-1 ring-gray-200">
        <div class="space-y-4">
          <div>
            <label class="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">Email</label>
            <input v-model="email" type="email" required placeholder="vous@exemple.com"
              class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-orange-500" />
          </div>
          <div>
            <label class="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">Mot de passe</label>
            <input v-model="password" type="password" required placeholder="••••••"
              class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-orange-500" />
          </div>
        </div>

        <p v-if="error" class="mt-3 text-center text-sm font-semibold text-red-500">{{ error }}</p>

        <button type="submit" :disabled="loading"
          class="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:opacity-60">
          <LogIn :size="18" />
          {{ loading ? 'Connexion…' : 'Se connecter' }}
        </button>
      </form>

      <!--<div class="mt-6 rounded-2xl bg-white p-4 ring-1 ring-gray-200">
        <p class="mb-3 text-center text-xs font-bold uppercase tracking-wider text-gray-500">Accès rapide</p>
        <div class="flex flex-wrap justify-center gap-2">
          <button v-for="u in quickUsers" :key="u.role" @click="handleQuickLogin(u.role)"
            class="flex items-center gap-1.5 rounded-xl bg-gray-100 px-3.5 py-2 text-xs font-bold text-gray-600 transition hover:bg-orange-500 hover:text-white">
            <User :size="14" />
            {{ u.label }}
          </button>
        </div>
      </div>-->

      <div class="mt-4 text-center">
        <p class="text-sm text-gray-600">
          Pas encore de compte ?
          <router-link to="/register" class="font-bold text-orange-500 hover:text-orange-600">
            Créer un compte
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>
