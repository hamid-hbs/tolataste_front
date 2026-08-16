<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authState } from '@/state/auth'
import { UserPlus } from '@lucide/vue'

const auth = authState
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)

async function handleRegister() {
  error.value = ''
  
  if (password.value !== confirmPassword.value) {
    error.value = 'Les mots de passe ne correspondent pas'
    return
  }
  
  if (password.value.length < 6) {
    error.value = 'Le mot de passe doit contenir au moins 6 caractères'
    return
  }

  loading.value = true
  const ok = await auth.register({
    name: name.value,
    email: email.value,
    password: password.value,
    password_confirmation: confirmPassword.value,
  })
  loading.value = false
  
  if (!ok) {
    error.value = 'Erreur lors de l\'inscription. Veuillez réessayer.'
    return
  }
  
  router.push('/client/menu')
}

function goToLogin() {
  router.push('/login')
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-sm">
      <div class="mb-8 text-center">
        <img src="/TolaTaste.jpeg" alt="Tola Taste" class="mx-auto mb-4 h-16 w-16 rounded-2xl object-cover" />
        <h1 class="text-2xl font-extrabold text-gray-900">Tola Taste</h1>
        <p class="mt-1 text-sm text-gray-500">Créez votre compte client</p>
      </div>

      <form @submit.prevent="handleRegister" class="rounded-2xl bg-white p-6 ring-1 ring-gray-200">
        <div class="space-y-4">
          <div>
            <label class="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">Nom</label>
            <input v-model="name" type="text" required placeholder="Votre nom"
              class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-orange-500" />
          </div>
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
          <div>
            <label class="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">Confirmer le mot de passe</label>
            <input v-model="confirmPassword" type="password" required placeholder="••••••"
              class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-orange-500" />
          </div>
        </div>

        <p v-if="error" class="mt-3 text-center text-sm font-semibold text-red-500">{{ error }}</p>

        <button type="submit" :disabled="loading"
          class="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:opacity-60">
          <UserPlus :size="18" />
          {{ loading ? 'Création…' : 'Créer mon compte' }}
        </button>
      </form>

      <div class="mt-4 text-center">
        <p class="text-sm text-gray-600">
          Déjà un compte ?
          <button @click="goToLogin" class="font-bold text-orange-500 hover:text-orange-600">
            Se connecter
          </button>
        </p>
      </div>
    </div>
  </div>
</template>
