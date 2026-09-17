<script setup>
import { nextTick, ref } from 'vue'
import { menuState as menu } from '@/state/menu'
import { notificationsState as notif } from '@/state/notifications'
import { Plus, Pencil, Trash2, X } from '@lucide/vue'

const newCategory = ref('')
const showModal = ref(false)
const editingCategoryId = ref(null)
const categoryInput = ref(null)

function openAddCategory() {
  editingCategoryId.value = null
  newCategory.value = ''
  showModal.value = true
  nextTick(() => categoryInput.value?.focus())
}

function openEditCategory(cat) {
  editingCategoryId.value = cat.id
  newCategory.value = cat.label
  showModal.value = true
  nextTick(() => categoryInput.value?.focus())
}

async function submitCategory() {
  const label = newCategory.value.trim()
  if (!label) return
  const ok = editingCategoryId.value
    ? await menu.updateCategory(editingCategoryId.value, label)
    : await menu.addCategory(label)
  if (ok) {
    notif.add({ type: 'success', title: editingCategoryId.value ? 'Catégorie modifiée' : 'Catégorie ajoutée', message: label })
    showModal.value = false
  } else {
    notif.add({ type: 'warning', title: 'Impossible d\'enregistrer', message: label })
  }
}

async function removeCategory(name) {
  notif.confirm({
    title: 'Supprimer une catégorie',
    message: `Supprimer "${name}" ?`,
    confirmLabel: 'Supprimer',
    onConfirm: async () => {
      const ok = await menu.removeCategory(name)
      notif.add(ok
        ? { type: 'warning', title: 'Catégorie supprimée', message: name }
        : { type: 'danger', title: 'Suppression refusée', message: 'Des produits actifs appartiennent à cette catégorie.' })
    },
  })
}
</script>

<template>
  <div>
    <h1 class="mb-6 text-xl font-extrabold text-tola-ink font-display">Catégories</h1>

    <div class="mb-6">
      <button @click="openAddCategory"
        class="flex items-center gap-1.5 rounded-xl bg-tola-orange px-5 py-2.5 text-sm font-bold text-white transition hover:bg-tola-orange-dark">
        <Plus :size="16" /> Ajouter une catégorie
      </button>
    </div>

    <div class="rounded-2xl bg-white ring-1 ring-tola-cream-dark/60">
      <div class="border-b border-tola-cream-dark px-5 py-4">
        <p class="text-xs font-bold uppercase tracking-wider text-tola-gray">{{ menu.categories.length }} catégorie(s)</p>
      </div>
      <div class="divide-y divide-tola-cream-dark">
        <div v-for="cat in menu.categories" :key="cat.id"
          class="flex items-center justify-between px-5 py-4">
          <span class="font-bold text-tola-ink">{{ cat.label }}</span>
          <div class="flex items-center gap-1">
            <button @click="openEditCategory(cat)"
              class="flex h-9 w-9 items-center justify-center rounded-full text-tola-gray transition hover:bg-tola-cream-dark/50 hover:text-tola-orange">
              <Pencil :size="16" />
            </button>
            <button @click="removeCategory(cat.id)"
              class="flex h-9 w-9 items-center justify-center rounded-full text-tola-red transition hover:bg-tola-red/10 hover:text-tola-red">
              <Trash2 :size="16" />
            </button>
          </div>
        </div>
        <div v-if="menu.categories.length === 0" class="px-5 py-8 text-center text-sm text-tola-gray">
          Aucune catégorie
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center sm:p-4" @click.self="showModal = false">
        <div class="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 shadow-2xl sm:max-w-md sm:rounded-2xl sm:p-6">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-bold text-tola-ink">{{ editingCategoryId ? 'Modifier la catégorie' : 'Nouvelle catégorie' }}</h3>
            <button @click="showModal = false" class="rounded-full p-1 text-tola-gray hover:bg-tola-cream-dark/50"><X :size="20" /></button>
          </div>
          <div>
            <label class="text-xs font-bold text-tola-gray">Nom de la catégorie</label>
            <input ref="categoryInput" v-model="newCategory" @keyup.enter="submitCategory" placeholder="Ex : Desserts"
              class="mt-1 w-full rounded-xl border border-tola-cream-dark px-4 py-2.5 text-sm outline-none focus:border-tola-orange" />
          </div>
          <div class="mt-6 flex gap-3">
            <button @click="showModal = false"
              class="flex-1 rounded-xl bg-tola-cream py-3 text-sm font-bold text-tola-gray transition hover:bg-tola-cream-dark">Annuler</button>
            <button @click="submitCategory"
              class="flex-1 rounded-xl bg-tola-orange py-3 text-sm font-bold text-white transition hover:bg-tola-orange-dark">{{ editingCategoryId ? 'Enregistrer' : 'Créer' }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
