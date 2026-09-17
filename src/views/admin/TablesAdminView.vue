<script setup>
import { ref } from 'vue'
import { tablesState as tables } from '@/state/tables'
import { notificationsState as notif } from '@/state/notifications'
import { Plus, Trash2, Pencil, Check } from '@lucide/vue'

const showModal = ref(false)
const editing = ref({
  number: 1, zone: 'Salle', capacity: 4,
})

const zoneOptions = ['Salle', 'Terrasse', 'VIP']

function openAdd() {
  editing.value = { number: Math.max(0, ...tables.tables.map((t) => t.number)) + 1, zone: 'Salle', capacity: 4 }
  showModal.value = true
}

function openEdit(t) {
  editing.value = { ...t }
  showModal.value = true
}

function save() {
  if (editing.value.id !== undefined) {
    tables.updateTable(editing.value.id, { number: editing.value.number, zone: editing.value.zone, capacity: editing.value.capacity })
    notif.add({ type: 'success', title: 'Table modifiée', message: `Table ${editing.value.number}` })
  } else {
    tables.addTable({ number: editing.value.number, zone: editing.value.zone, capacity: editing.value.capacity })
    notif.add({ type: 'success', title: 'Table ajoutée', message: `Table ${editing.value.number}` })
  }
  showModal.value = false
}

function removeTable(id, number) {
  notif.confirm({
    title: 'Supprimer une table',
    message: `Supprimer la table ${number} ?`,
    confirmLabel: 'Supprimer',
    onConfirm: async () => {
      await tables.removeTable(id)
      notif.add({ type: 'warning', title: 'Table supprimée', message: `Table ${number}` })
    },
  })
}
</script>

<template>
  <div>
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-extrabold text-tola-ink font-display">Gestion des tables</h1>
      <button @click="openAdd"
        class="flex items-center gap-1.5 rounded-full bg-tola-orange px-4 py-2 text-xs font-bold text-white transition hover:bg-tola-orange-dark">
        <Plus :size="14" /> Ajouter
      </button>
    </div>

    <div class="rounded-2xl bg-white ring-1 ring-tola-cream-dark/60">
      <div class="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <table class="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr class="border-b border-tola-cream-dark text-xs font-bold uppercase tracking-wider text-tola-gray">
              <th class="px-5 py-3">Numéro</th>
              <th class="px-5 py-3">Zone</th>
              <th class="px-5 py-3">Capacité</th>
              <th class="px-5 py-3">Statut</th>
              <th class="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-tola-cream-dark">
            <tr v-for="t in tables.tables" :key="t.id" class="transition hover:bg-tola-cream">
              <td class="px-5 py-3 font-bold text-tola-ink">{{ t.number }}</td>
              <td class="px-5 py-3 text-tola-gray">{{ t.zone }}</td>
              <td class="px-5 py-3 text-tola-gray">{{ t.capacity }} pers.</td>
              <td class="px-5 py-3">
                <span class="rounded-full px-2.5 py-0.5 text-[10px] font-bold" :class="tables.statusColors[t.status]">
                  {{ tables.statusLabels[t.status] }}
                </span>
              </td>
              <td class="px-5 py-3">
                <div class="flex items-center gap-1">
                  <button @click="openEdit(t)" class="rounded-full p-1.5 text-tola-gray hover:bg-tola-cream-dark/50 hover:text-tola-orange">
                    <Pencil :size="14" />
                  </button>
                  <button @click="removeTable(t.id, t.number)" class="rounded-full p-1.5 text-tola-gray hover:bg-tola-cream-dark/50 hover:text-tola-red">
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
        <div class="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 shadow-2xl sm:max-w-sm sm:rounded-2xl sm:p-6">
          <h3 class="mb-4 text-lg font-bold text-tola-ink">{{ editing.id ? 'Modifier' : 'Ajouter' }} une table</h3>
          <div class="space-y-4">
            <div>
              <label class="text-xs font-bold text-tola-gray">Numéro</label>
              <input v-model.number="editing.number" type="number" min="1"
                class="mt-1 w-full rounded-xl border border-tola-cream-dark px-4 py-2.5 text-sm outline-none focus:border-tola-orange" />
            </div>
            <div>
              <label class="text-xs font-bold text-tola-gray">Zone</label>
              <select v-model="editing.zone"
                class="mt-1 w-full rounded-xl border border-tola-cream-dark px-4 py-2.5 text-sm outline-none focus:border-tola-orange">
                <option v-for="z in zoneOptions" :key="z" :value="z">{{ z }}</option>
              </select>
            </div>
            <div>
              <label class="text-xs font-bold text-tola-gray">Capacité</label>
              <input v-model.number="editing.capacity" type="number" min="1"
                class="mt-1 w-full rounded-xl border border-tola-cream-dark px-4 py-2.5 text-sm outline-none focus:border-tola-orange" />
            </div>
          </div>
          <div class="mt-6 flex gap-3">
            <button @click="showModal = false"
              class="flex-1 rounded-xl bg-tola-cream py-3 text-sm font-bold text-gray-700 transition hover:bg-tola-cream-dark">Annuler</button>
            <button @click="save"
              class="flex-1 rounded-xl bg-tola-orange py-3 text-sm font-bold text-white transition hover:bg-tola-orange-dark">
              <Check :size="16" class="inline mr-1" /> {{ editing.id ? 'Enregistrer' : 'Ajouter' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
