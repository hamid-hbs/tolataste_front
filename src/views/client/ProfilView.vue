<script setup>
import { useRouter } from 'vue-router'
import { authState as auth } from '@/state/auth'
import { confirmLogout } from '@/utils/confirm'
import { User, Mail, Shield, LogOut, Calendar } from '@lucide/vue'

const router = useRouter()

function handleLogout() {
  confirmLogout(() => {
    auth.logout()
    router.push('/login')
  })
}
</script>

<template>
  <div class="px-4 py-8">
    <div class="mb-6">
      <h1 class="font-display text-2xl font-extrabold text-tola-ink">Mon Profil</h1>
      <p class="mt-1 text-sm text-tola-gray">Gérez vos informations personnelles</p>
    </div>

    <div class="rounded-xl border border-tola-cream-dark bg-white p-6">
      <div class="flex items-center gap-4 pb-4 border-b border-tola-cream-dark">
        <div class="flex h-16 w-16 items-center justify-center rounded-full bg-tola-orange/10 text-2xl font-bold text-tola-orange">
          {{ auth.user?.name?.charAt(0)?.toUpperCase() }}
        </div>
        <div>
          <h2 class="font-bold text-tola-ink text-lg">{{ auth.user?.name }}</h2>
          <p class="text-sm text-tola-gray">{{ auth.roleLabels[auth.userRole] }}</p>
        </div>
      </div>

      <div class="mt-5 space-y-4">
        <div class="flex items-center gap-3 text-sm">
          <User :size="18" class="text-tola-gray" />
          <div>
            <p class="text-[10px] text-tola-gray uppercase tracking-wide">Nom</p>
            <p class="font-medium text-tola-ink">{{ auth.user?.name }}</p>
          </div>
        </div>
        <div class="flex items-center gap-3 text-sm">
          <Mail :size="18" class="text-tola-gray" />
          <div>
            <p class="text-[10px] text-tola-gray uppercase tracking-wide">Email</p>
            <p class="font-medium text-tola-ink">{{ auth.user?.email ?? 'Non renseigné' }}</p>
          </div>
        </div>
        <div class="flex items-center gap-3 text-sm">
          <Shield :size="18" class="text-tola-gray" />
          <div>
            <p class="text-[10px] text-tola-gray uppercase tracking-wide">Rôle</p>
            <p class="font-medium text-tola-ink">{{ auth.roleLabels[auth.userRole] }}</p>
          </div>
        </div>
        <div class="flex items-center gap-3 text-sm">
          <Calendar :size="18" class="text-tola-gray" />
          <div>
            <p class="text-[10px] text-tola-gray uppercase tracking-wide">Membre depuis</p>
            <p class="font-medium text-tola-ink">Aujourd'hui</p>
          </div>
        </div>
      </div>

      <div class="mt-6 pt-4 border-t border-tola-cream-dark">
        <button @click="handleLogout"
          class="flex w-full items-center justify-center gap-2 rounded-xl border border-tola-red/20 px-4 py-3 text-sm font-bold text-tola-red transition hover:bg-tola-red/5">
          <LogOut :size="16" /> Déconnexion
        </button>
      </div>
    </div>
  </div>
</template>
