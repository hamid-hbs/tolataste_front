<script setup>
import { nextTick, ref } from 'vue'
import { menuState as menu } from '@/state/menu'
import { notificationsState as notif } from '@/state/notifications'
import { Plus, Pencil, Trash2, X, Eye, EyeOff, ImagePlus } from '@lucide/vue'

const showModal = ref(false)
const editingItem = ref({
  name: '', description: '', price: 0, category: '', image: '', available: true,
})
const imageFile = ref(null)
const imagePreview = ref('')
const removeImageFlag = ref(false)

const showCategoryModal = ref(false)
const editingCategoryId = ref(null)
const newCategoryName = ref('')
const categoryInput = ref(null)

function openAdd() {
  const firstCat = menu.categories[0]
  editingItem.value = {
    name: '', description: '', price: 0,
    category: firstCat?.label || '',
    categoryId: firstCat?.id,
    image: '', available: true,
  }
  imageFile.value = null
  imagePreview.value = ''
  removeImageFlag.value = false
  showModal.value = true
}

function openEdit(item) {
  editingItem.value = {
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    category: item.category,
    categoryId: item.categoryId,
    image: item.image,
    available: item.available,
  }
  imageFile.value = null
  imagePreview.value = ''
  removeImageFlag.value = false
  showModal.value = true
}

function onImageFile(event) {
  const file = event.target.files?.[0]
  if (!file) return
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowed.includes(file.type)) {
    notif.add({ type: 'danger', title: 'Format non accepté', message: 'Choisissez une image JPG, PNG, WebP ou GIF.' })
    event.target.value = ''
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    notif.add({ type: 'danger', title: 'Image trop lourde', message: 'Maximum 5 Mo.' })
    event.target.value = ''
    return
  }
  imageFile.value = file
  imagePreview.value = URL.createObjectURL(file)
  removeImageFlag.value = false
}

function clearImage() {
  imageFile.value = null
  imagePreview.value = ''
  editingItem.value.image = ''
  removeImageFlag.value = true
}

async function saveItem() {
  if (!editingItem.value.name || !editingItem.value.price) return
  const cat = menu.categories.find((c) => c.label === editingItem.value.category)
  const categoryId = cat?.id ?? editingItem.value.categoryId
  try {
    if (editingItem.value.id) {
      await menu.updateItem(editingItem.value.id, {
        name: editingItem.value.name,
        description: editingItem.value.description,
        price: editingItem.value.price,
        categoryId,
        image: editingItem.value.image,
        available: editingItem.value.available,
        imageFile: imageFile.value,
        removeImage: removeImageFlag.value,
      })
      notif.add({ type: 'success', title: 'Modifié', message: editingItem.value.name })
    } else {
      await menu.addItem({
        name: editingItem.value.name,
        description: editingItem.value.description,
        price: editingItem.value.price,
        categoryId: categoryId ?? 0,
        category: editingItem.value.category,
        image: editingItem.value.image,
        available: editingItem.value.available,
        imageFile: imageFile.value,
        removeImage: removeImageFlag.value,
      })
      notif.add({ type: 'success', title: 'Ajouté', message: editingItem.value.name })
    }
    showModal.value = false
  } catch (e) {
    notif.add({ type: 'danger', title: 'Erreur', message: e?.message ?? 'Enregistrement impossible' })
  }
}

async function removeItem(id, name) {
  notif.confirm({
    title: 'Supprimer un produit',
    message: `Supprimer ${name} ?`,
    confirmLabel: 'Supprimer',
    onConfirm: async () => {
      try {
        await menu.removeItem(id)
        notif.add({ type: 'warning', title: 'Supprimé', message: name })
      } catch (e) {
        notif.add({ type: 'danger', title: 'Erreur', message: e?.message ?? 'Suppression impossible' })
      }
    },
  })
}

function openAddCategory() {
  editingCategoryId.value = null
  newCategoryName.value = ''
  showCategoryModal.value = true
  nextTick(() => categoryInput.value?.focus())
}

function openEditCategory(cat) {
  editingCategoryId.value = cat.id
  newCategoryName.value = cat.label
  showCategoryModal.value = true
  nextTick(() => categoryInput.value?.focus())
}

async function submitCategory() {
  const label = newCategoryName.value.trim()
  if (!label) return
  const ok = editingCategoryId.value
    ? await menu.updateCategory(editingCategoryId.value, label)
    : await menu.addCategory(label)
  if (ok) {
    notif.add({ type: 'success', title: editingCategoryId.value ? 'Catégorie modifiée' : 'Catégorie ajoutée', message: label })
    showCategoryModal.value = false
  } else {
    notif.add({ type: 'warning', title: 'Impossible d\'enregistrer', message: label })
  }
}

async function removeCategory(id, label) {
  notif.confirm({
    title: 'Supprimer une catégorie',
    message: `Supprimer la catégorie "${label}" ?`,
    confirmLabel: 'Supprimer',
    onConfirm: async () => {
      const ok = await menu.removeCategory(id)
      notif.add(ok
        ? { type: 'warning', title: 'Catégorie supprimée', message: label }
        : { type: 'danger', title: 'Suppression refusée', message: 'Des produits actifs appartiennent à cette catégorie.' })
    },
  })
}

function fmtPrice(p) {
  return new Intl.NumberFormat('fr-FR').format(p) + ' FCFA'
}
</script>

<template>
  <div>
    <h1 class="mb-6 text-xl font-extrabold text-tola-ink font-display">Gestion du menu</h1>

    <div class="mb-6 rounded-2xl bg-white p-5 ring-1 ring-tola-cream-dark/60">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-sm font-bold uppercase tracking-wider text-tola-gray">Catégories</h2>
        <button @click="openAddCategory"
          class="flex items-center gap-1 rounded-lg bg-tola-orange px-2.5 py-1.5 text-xs font-bold text-white transition hover:bg-tola-orange-dark">
          <Plus :size="12" /> Ajouter
        </button>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <span v-for="cat in menu.categories" :key="cat.id"
          class="flex items-center gap-1.5 rounded-full bg-tola-cream px-3 py-1.5 text-xs font-bold text-tola-gray">
          {{ cat.label }}
          <button @click="openEditCategory(cat)" class="text-tola-gray hover:text-tola-orange"><Pencil :size="12" /></button>
          <button @click="removeCategory(cat.id, cat.label)" class="text-tola-red hover:text-tola-red"><X :size="12" /></button>
        </span>
        <span v-if="menu.categories.length === 0" class="text-xs text-tola-gray">Aucune catégorie</span>
      </div>
    </div>

    <div class="rounded-2xl bg-white ring-1 ring-tola-cream-dark/60">
      <div class="flex items-center justify-between border-b border-tola-cream-dark px-5 py-4">
        <h2 class="text-sm font-bold uppercase tracking-wider text-tola-gray">Articles ({{ menu.items.length }})</h2>
        <button @click="openAdd"
          class="flex items-center gap-1.5 rounded-full bg-tola-orange px-4 py-2 text-xs font-bold text-white transition hover:bg-tola-orange-dark">
          <Plus :size="14" /> Ajouter
        </button>
      </div>
      <div class="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <table class="w-full min-w-[680px] text-left text-sm">
          <thead>
            <tr class="border-b border-tola-cream-dark text-xs font-bold uppercase tracking-wider text-tola-gray">
              <th class="px-5 py-3"></th>
              <th class="px-5 py-3">Nom</th>
              <th class="px-5 py-3">Catégorie</th>
              <th class="px-5 py-3">Prix</th>
              <th class="px-5 py-3">Dispo</th>
              <th class="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-tola-cream-dark">
            <tr v-for="item in menu.items" :key="item.id" class="transition hover:bg-tola-cream">
              <td class="px-5 py-3"><img :src="item.image" alt="" class="h-12 w-12 rounded-lg object-cover" @error="($event) => { const el = $event.target; el.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=48&h=48&fit=crop' }" /></td>
              <td class="px-5 py-3 font-bold text-tola-ink">{{ item.name }}</td>
              <td class="px-5 py-3 text-tola-gray">{{ item.category }}</td>
              <td class="px-5 py-3 font-bold text-tola-orange">{{ fmtPrice(item.price) }}</td>
              <td class="px-5 py-3">
                <button @click="menu.toggleAvailable(item.id)"
                  class="flex items-center gap-1 text-xs font-bold"
                  :class="item.available ? 'text-tola-teal' : 'text-tola-red'">
                  <component :is="item.available ? Eye : EyeOff" :size="14" />
                  {{ item.available ? 'Oui' : 'Non' }}
                </button>
              </td>
              <td class="px-5 py-3">
                <div class="flex items-center gap-1">
                  <button @click="openEdit(item)" class="rounded-full p-1.5 text-tola-gray hover:bg-tola-cream-dark/50 hover:text-tola-orange">
                    <Pencil :size="14" />
                  </button>
                  <button @click="menu.toggleAvailable(item.id)" class="rounded-full p-1.5 text-tola-gray hover:bg-tola-cream-dark/50 hover:text-tola-teal">
                    <component :is="item.available ? EyeOff : Eye" :size="14" />
                  </button>
                  <button @click="removeItem(item.id, item.name)" class="rounded-full p-1.5 text-tola-gray hover:bg-tola-cream-dark/50 hover:text-tola-red">
                    <Trash2 :size="14" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center sm:p-4" @click.self="showModal = false">
        <div class="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 shadow-2xl sm:max-w-md sm:rounded-2xl sm:p-6">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-bold text-tola-ink">{{ editingItem.id ? 'Modifier' : 'Ajouter' }} un article</h3>
            <button @click="showModal = false" class="rounded-full p-1 text-tola-gray hover:bg-tola-cream-dark/50"><X :size="20" /></button>
          </div>
          <div class="space-y-4">
            <div>
              <label class="text-xs font-bold text-tola-gray">Image</label>
              <div class="mt-1 flex items-center gap-3">
                <img :src="imagePreview || editingItem.image" alt=""
                  class="h-16 w-16 rounded-xl object-cover ring-1 ring-tola-cream-dark"
                  @error="($event) => { $event.target.src = '' }" />
                <div class="flex flex-col gap-1.5">
                  <label
                    class="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-tola-cream px-3 py-2 text-xs font-bold text-tola-gray transition hover:bg-tola-cream-dark">
                    <ImagePlus :size="14" /> Choisir un fichier
                    <input type="file" accept="image/*" class="hidden" @change="onImageFile" />
                  </label>
                  <button v-if="imageFile || editingItem.image" @click="clearImage"
                    class="inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-tola-red transition hover:bg-tola-red/10">
                    <Trash2 :size="14" /> Retirer
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label class="text-xs font-bold text-tola-gray">Nom</label>
              <input v-model="editingItem.name" class="mt-1 w-full rounded-xl border border-tola-cream-dark px-4 py-2.5 text-sm outline-none focus:border-tola-orange" />
            </div>
            <div>
              <label class="text-xs font-bold text-tola-gray">Description</label>
              <textarea v-model="editingItem.description" rows="2"
                class="mt-1 w-full rounded-xl border border-tola-cream-dark px-4 py-2.5 text-sm outline-none focus:border-tola-orange"></textarea>
            </div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="text-xs font-bold text-tola-gray">Prix (FCFA)</label>
                <input v-model.number="editingItem.price" type="number" min="0"
                  class="mt-1 w-full rounded-xl border border-tola-cream-dark px-4 py-2.5 text-sm outline-none focus:border-tola-orange" />
              </div>
              <div>
                <label class="text-xs font-bold text-tola-gray">Catégorie</label>
                <select v-model="editingItem.category"
                  class="mt-1 w-full rounded-xl border border-tola-cream-dark px-4 py-2.5 text-sm outline-none focus:border-tola-orange">
                  <option v-for="cat in menu.categories" :key="cat.id" :value="cat.label">{{ cat.label }}</option>
                </select>
              </div>
            </div>
          </div>
          <div class="mt-6 flex gap-3">
            <button @click="showModal = false"
              class="flex-1 rounded-xl bg-tola-cream py-3 text-sm font-bold text-tola-gray transition hover:bg-tola-cream-dark">Annuler</button>
            <button @click="saveItem"
              class="flex-1 rounded-xl bg-tola-orange py-3 text-sm font-bold text-white transition hover:bg-tola-orange-dark">
              {{ editingItem.id ? 'Enregistrer' : 'Ajouter' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showCategoryModal" class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center sm:p-4" @click.self="showCategoryModal = false">
        <div class="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 shadow-2xl sm:max-w-md sm:rounded-2xl sm:p-6">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-bold text-tola-ink">{{ editingCategoryId ? 'Modifier la catégorie' : 'Nouvelle catégorie' }}</h3>
            <button @click="showCategoryModal = false" class="rounded-full p-1 text-tola-gray hover:bg-tola-cream-dark/50"><X :size="20" /></button>
          </div>
          <div>
            <label class="text-xs font-bold text-tola-gray">Nom de la catégorie</label>
            <input ref="categoryInput" v-model="newCategoryName" @keyup.enter="submitCategory" placeholder="Ex : Desserts"
              class="mt-1 w-full rounded-xl border border-tola-cream-dark px-4 py-2.5 text-sm outline-none focus:border-tola-orange" />
          </div>
          <div class="mt-6 flex gap-3">
            <button @click="showCategoryModal = false"
              class="flex-1 rounded-xl bg-tola-cream py-3 text-sm font-bold text-tola-gray transition hover:bg-tola-cream-dark">Annuler</button>
            <button @click="submitCategory"
              class="flex-1 rounded-xl bg-tola-orange py-3 text-sm font-bold text-white transition hover:bg-tola-orange-dark">{{ editingCategoryId ? 'Enregistrer' : 'Créer' }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>