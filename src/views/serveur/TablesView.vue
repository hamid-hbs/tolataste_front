<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { tablesState as tables } from '@/state/tables'
import { menuState as menu } from '@/state/menu'
import { ordersState as orders } from '@/state/orders'
import { authState as auth } from '@/state/auth'
import { notificationsState as notif } from '@/state/notifications'
import { Plus, Minus, X, Utensils } from '@lucide/vue'

const router = useRouter()

const showModal = ref(false)
const selectedTableId = ref(null)
const orderCategory = ref(null)
const orderItems = ref([])
const orderNote = ref('')

function openNewOrder(tableId) {
  selectedTableId.value = tableId
  orderItems.value = []
  orderCategory.value = null
  orderNote.value = ''
  showModal.value = true
}

function addItem(item) {
  const existing = orderItems.value.find((i) => i.id === item.id)
  if (existing) existing.qty++
  else orderItems.value.push({ ...item, qty: 1 })
}

function removeItem(id) {
  orderItems.value = orderItems.value.filter((i) => i.id !== id)
}

function updateQty(id, qty) {
  if (qty <= 0) { removeItem(id); return }
  const item = orderItems.value.find((i) => i.id === id)
  if (item) item.qty = qty
}

const filteredMenu = computed(() => {
  if (!orderCategory.value) return menu.availableItems
  return menu.availableItems.filter((i) => i.category === orderCategory.value)
})

const orderTotal = computed(() => orderItems.value.reduce((s, i) => s + i.price * i.qty, 0))

async function submitOrder() {
  if (!selectedTableId.value || orderItems.value.length === 0) return
  const items = orderItems.value.map((i) => ({
    menuItemId: i.id,
    name: i.name,
    price: i.price,
    qty: i.qty,
    total: i.price * i.qty,
  }))
  try {
    const order = await orders.createOrder({
      initiatedBy: 'serveur',
      tableId: selectedTableId.value,
      type: 'dine-in',
      items,
      note: orderNote.value,
      serverName: auth.user?.name ?? 'Serveur',
    })
    await tables.fetchAll()
    notif.add({ type: 'success', title: 'Commande créée', message: `#${order.id} — Table ${tables.getTable(selectedTableId.value)?.number}` })
    showModal.value = false
  } catch (e) {
    notif.add({ type: 'danger', title: 'Commande refusée', message: e?.message ?? 'Réessayez.' })
  }
}

function viewOrder(tableId) {
  const t = tables.getTable(tableId)
  if (t?.status === 'occupied') {
    router.push(`/serveur/suivi`)
  }
}

function fmtPrice(p) {
  return new Intl.NumberFormat('fr-FR').format(p) + ' FCFA'
}
</script>

<template>
  <div>
    <h1 class="mb-6 text-xl font-extrabold text-tola-ink font-display">Plan des tables</h1>

    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      <div v-for="t in tables.tables" :key="t.id" @click="t.status === 'free' ? openNewOrder(t.id) : viewOrder(t.id)"
        class="cursor-pointer rounded-2xl border-2 p-4 text-center transition hover:shadow-md"
        :class="{
          'border-tola-teal/30 bg-tola-teal/[0.06]': t.status === 'free',
          'border-tola-red/30 bg-tola-red/[0.06]': t.status === 'occupied',
          'border-tola-yellow/30 bg-tola-yellow/[0.06]': t.status === 'reserved',
          'border-tola-cream-dark bg-tola-cream': t.status === 'cleaning',
        }">
        <div class="mb-1 text-2xl font-black text-tola-ink">{{ t.number }}</div>
        <div class="text-[10px] font-medium text-tola-gray">{{ t.zone }}</div>
        <div class="text-[10px] text-tola-gray">{{ t.capacity }} pers.</div>
        <div class="mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold"
          :class="tables.statusColors[t.status]">
          {{ tables.statusLabels[t.status] }}
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 pb-8 pt-16 backdrop-blur-sm" @click.self="showModal = false">
        <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-bold text-tola-ink">
              Table {{ tables.getTable(selectedTableId)?.number }}
            </h3>
            <button @click="showModal = false" class="rounded-full p-1 text-tola-gray hover:bg-tola-cream-dark/50"><X :size="20" /></button>
          </div>

          <div class="mb-4 flex flex-wrap gap-2">
            <button @click="orderCategory = null"
              class="rounded-full px-3 py-1.5 text-xs font-bold"
              :class="!orderCategory ? 'bg-tola-orange text-white' : 'bg-tola-cream text-tola-gray'">Tout</button>
            <button v-for="cat in menu.categories" :key="cat.id" @click="orderCategory = cat.label"
              class="rounded-full px-3 py-1.5 text-xs font-bold"
              :class="orderCategory === cat.label ? 'bg-tola-orange text-white' : 'bg-tola-cream text-tola-gray'">{{ cat.label }}</button>
          </div>

          <div class="mb-4 max-h-48 space-y-1 overflow-y-auto">
            <div v-for="item in filteredMenu" :key="item.id" @click="addItem(item)"
              class="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-sm transition hover:bg-tola-cream">
              <span><img :src="item.image" alt="" class="mr-2 inline-block h-8 w-8 rounded object-cover" @error="($event) => { const el = $event.target; el.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=32&h=32&fit=crop' }" />{{ item.name }}</span>
              <span class="font-bold text-tola-orange">{{ fmtPrice(item.price) }}</span>
            </div>
          </div>

          <div v-if="orderItems.length > 0" class="mb-4 space-y-2 rounded-xl bg-tola-cream p-3">
            <div v-for="item in orderItems" :key="item.id" class="flex items-center justify-between text-sm">
              <span class="font-medium text-tola-ink">{{ item.name }}</span>
              <div class="flex items-center gap-2">
                <button @click="updateQty(item.id, item.qty - 1)" class="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-tola-gray"><Minus :size="12" /></button>
                <span class="w-5 text-center text-sm font-bold">{{ item.qty }}</span>
                <button @click="updateQty(item.id, item.qty + 1)" class="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-tola-gray"><Plus :size="12" /></button>
              </div>
            </div>
          </div>

          <textarea v-model="orderNote" placeholder="Note..."
            class="mb-4 w-full rounded-xl border border-tola-cream-dark px-4 py-2.5 text-sm outline-none focus:border-tola-orange"></textarea>

          <div class="mb-4 flex items-center justify-between border-t border-tola-cream-dark pt-4">
            <span class="font-bold text-tola-ink">Total</span>
            <span class="text-lg font-extrabold text-tola-orange">{{ fmtPrice(orderTotal) }}</span>
          </div>

          <button @click="submitOrder" :disabled="orderItems.length === 0"
            class="flex w-full items-center justify-center gap-2 rounded-xl bg-tola-orange py-3 text-sm font-bold text-white transition hover:bg-tola-orange-dark disabled:opacity-50">
            <Utensils :size="16" /> Créer la commande
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
