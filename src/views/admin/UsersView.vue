<script setup>
import { ref } from 'vue'
import { authState as auth } from '@/state/auth'
import { notificationsState as notif } from '@/state/notifications'
import { Trash2, Check, UserPlus, Pencil } from '@lucide/vue'

const showModal = ref(false)
const editingId = ref(null)
const newUser = ref({ name: '', email: '', password: '', role: 'serveur' })

const roleColors = {
  client: 'bg-tola-cream text-tola-gray',
  serveur: 'bg-tola-orange/10 text-tola-orange',
  cuisine: 'bg-tola-teal/10 text-tola-teal',
  manager: 'bg-tola-yellow/10 text-tola-yellow',
  admin: 'bg-tola-red/10 text-tola-red',
}

const roleOptions = [
  { value: 'serveur', label: 'Serveur' },
  { value: 'cuisine', label: 'Cuisine' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' },
]

function openAdd() {
  editingId.value = null
  newUser.value = { name: '', email: '', password: '123', role: 'serveur' }
  showModal.value = true
}

function openEdit(user) {
  editingId.value = user.id
  newUser.value = { name: user.name, email: user.email, password: '', role: user.role }
  showModal.value = true
}

async function saveUser() {
  if (!newUser.value.name || !newUser.value.email) return
  const data = { name: newUser.value.name, email: newUser.value.email, role: newUser.value.role }
  if (newUser.value.password) data.password = newUser.value.password
  try {
    if (editingId.value) {
      await auth.updateUser(editingId.value, data)
      notif.add({ type: 'success', title: 'Utilisateur modifié', message: newUser.value.name })
    } else {
      await auth.addUser({ ...newUser.value })
      notif.add({ type: 'success', title: 'Utilisateur ajouté', message: newUser.value.name })
    }
  } catch (e) {
    notif.add({ type: 'danger', title: 'Erreur', message: e?.message ?? 'Enregistrement impossible' })
  }
  showModal.value = false
}

async function removeUser(id, name) {
  notif.confirm({
    title: 'Supprimer un utilisateur',
    message: `Supprimer ${name} ?`,
    confirmLabel: 'Supprimer',
    onConfirm: async () => {
      try {
        await auth.removeUser(id)
        notif.add({ type: 'warning', title: 'Utilisateur supprimé', message: name })
      } catch (e) {
        notif.add({ type: 'danger', title: 'Erreur', message: e?.message ?? 'Suppression impossible' })
      }
    },
  })
}
</script>

<template>
  <div>
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-extrabold text-tola-ink font-display">Utilisateurs</h1>
      <button @click="openAdd"
        class="flex items-center gap-1.5 rounded-full bg-tola-orange px-4 py-2 text-xs font-bold text-white transition hover:bg-tola-orange-dark">
        <UserPlus :size="14" /> Ajouter
      </button>
    </div>

    <div class="rounded-2xl bg-white ring-1 ring-tola-cream-dark/60">
      <div class="border-b border-tola-cream-dark px-5 py-4">
        <p class="text-xs font-bold uppercase tracking-wider text-tola-gray">{{ auth.users.length }} utilisateur(s)</p>
      </div>
      <div class="divide-y divide-tola-cream-dark">
        <div v-for="user in auth.users" :key="user.id" class="flex items-center gap-3 px-4 py-4 sm:gap-4 sm:px-5">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tola-cream font-bold text-tola-gray">
            {{ user.name.charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <span class="truncate font-bold text-tola-ink">{{ user.name }}</span>
              <span class="rounded-full px-2.5 py-0.5 text-[10px] font-bold" :class="roleColors[user.role]">
                {{ auth.roleLabels[user.role] }}
              </span>
            </div>
            <p class="truncate text-xs text-tola-gray">{{ user.email }}</p>
          </div>
          <div class="flex shrink-0 items-center gap-1">
            <button @click="openEdit(user)"
              class="flex h-9 w-9 items-center justify-center rounded-full text-tola-gray transition hover:bg-tola-cream-dark/50 hover:text-tola-orange">
              <Pencil :size="16" />
            </button>
            <button @click="removeUser(user.id, user.name)"
              class="flex h-9 w-9 items-center justify-center rounded-full text-tola-red transition hover:bg-tola-red/10 hover:text-tola-red">
              <Trash2 :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center sm:p-4" @click.self="showModal = false">
        <div class="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 shadow-2xl sm:max-w-sm sm:rounded-2xl sm:p-6">
          <h3 class="mb-4 text-lg font-bold text-tola-ink">{{ editingId ? 'Modifier un utilisateur' : 'Ajouter un utilisateur' }}</h3>
          <div class="space-y-4">
            <div>
              <label class="text-xs font-bold text-tola-gray">Nom</label>
              <input v-model="newUser.name" class="mt-1 w-full rounded-xl border border-tola-cream-dark px-4 py-2.5 text-sm outline-none focus:border-tola-orange" />
            </div>
            <div>
              <label class="text-xs font-bold text-tola-gray">Email</label>
              <input v-model="newUser.email" type="email" class="mt-1 w-full rounded-xl border border-tola-cream-dark px-4 py-2.5 text-sm outline-none focus:border-tola-orange" />
            </div>
            <div>
              <label class="text-xs font-bold text-tola-gray">Mot de passe</label>
              <input v-model="newUser.password" type="password" :placeholder="editingId ? 'Laisser vide pour ne pas changer' : ''" class="mt-1 w-full rounded-xl border border-tola-cream-dark px-4 py-2.5 text-sm outline-none focus:border-tola-orange" />
            </div>
            <div>
              <label class="text-xs font-bold text-tola-gray">Rôle</label>
              <select v-model="newUser.role"
                class="mt-1 w-full rounded-xl border border-tola-cream-dark px-4 py-2.5 text-sm outline-none focus:border-tola-orange">
                <option v-for="opt in roleOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </div>
          </div>
          <div class="mt-6 flex gap-3">
            <button @click="showModal = false"
              class="flex-1 rounded-xl bg-tola-cream py-3 text-sm font-bold text-tola-gray transition hover:bg-tola-cream-dark">Annuler</button>
            <button @click="saveUser"
              class="flex-1 rounded-xl bg-tola-orange py-3 text-sm font-bold text-white transition hover:bg-tola-orange-dark">
              <Check :size="16" class="inline mr-1" /> {{ editingId ? 'Enregistrer' : 'Ajouter' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
