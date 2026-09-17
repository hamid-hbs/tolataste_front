<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { clientState as client } from '@/state/client'
import { menuState as menu } from '@/state/menu'
import { tablesState as tables } from '@/state/tables'
import { ordersState as orders } from '@/state/orders'
import { notificationsState as notif } from '@/state/notifications'
import { Minus, Plus, Trash2, ShoppingBag } from '@lucide/vue'

const router = useRouter()

const freeTables = computed(() => {
  const list = tables.availableTables.length > 0 ? tables.availableTables : tables.tables
  return list.filter((t) => t.status === 'free')
})
const loadingTables = computed(() => tables.loadingAvailable)

onMounted(() => {
  tables.fetchAvailable()
})

function fmtPrice(p) {
  return new Intl.NumberFormat('fr-FR').format(p) + ' FCFA'
}

function getImage(id) {
  const item = menu.items.find((i) => i.id === id)
  return item?.image ?? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'
}

async function commander() {
  if (client.cart.length === 0) return
  const items = client.cart.map((c) => ({
    menuItemId: c.id,
    name: c.name,
    price: c.price,
    qty: c.qty,
    total: c.price * c.qty,
  }))
  const type = client.tableId ? 'dine-in' : 'takeaway'
  try {
    const order = await orders.createOrder({
      initiatedBy: 'client',
      items,
      tableId: client.tableId,
      type,
      note: client.note,
      serverName: 'Client',
    })
    client.clearCart()
    client.setLastOrderId(order.id)
    notif.add({ type: 'success', title: 'Commande envoyée !', message: `Réf: #${order.id}` })
    router.push(`/client/confirmation/${order.id}`)
  } catch (e) {
    notif.add({ type: 'danger', title: 'Commande refusée', message: e?.message ?? 'Réessayez plus tard.' })
  }
}
</script>

<template>
  <div>
    <h1 class="mb-6 text-xl font-extrabold text-gray-900">Votre commande</h1>

    <div v-if="client.cart.length === 0" class="py-12 text-center text-sm text-gray-400">Votre panier est vide</div>

    <div v-else class="space-y-6">
      <div class="space-y-3">
        <div v-for="item in client.cart" :key="item.id"
          class="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-gray-100">
          <img :src="getImage(item.id)" alt="" class="h-12 w-12 rounded-lg object-cover" />
          <div class="flex-1 min-w-0">
            <p class="font-bold text-gray-900">{{ item.name }}</p>
            <p class="text-sm text-orange-600">{{ fmtPrice(item.price) }}</p>
          </div>
          <div class="flex items-center gap-2">
            <button @click="client.updateQty(item.id, item.qty - 1)"
              class="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200">
              <Minus :size="14" />
            </button>
            <span class="w-6 text-center text-sm font-bold">{{ item.qty }}</span>
            <button @click="client.updateQty(item.id, item.qty + 1)"
              class="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200">
              <Plus :size="14" />
            </button>
            <button @click="client.removeFromCart(item.id)"
              class="flex h-7 w-7 items-center justify-center rounded-full text-red-400 hover:bg-red-50">
              <Trash2 :size="14" />
            </button>
          </div>
        </div>
      </div>

      <div>
        <p class="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Où mangez-vous ?</p>
        <div v-if="loadingTables" class="text-xs text-gray-400">Chargement des tables disponibles…</div>
        <div v-else class="flex flex-wrap gap-2">
          <button @click="client.setTable(null)"
            class="rounded-full px-4 py-2 text-xs font-bold transition"
            :class="client.tableId === null ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
            À emporter
          </button>
          <button v-for="t in freeTables" :key="t.id" @click="client.setTable(t.id)"
            class="rounded-full px-4 py-2 text-xs font-bold transition"
            :class="client.tableId === t.id ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
            Table {{ t.number }}
          </button>
        </div>
        <p v-if="!loadingTables && freeTables.length === 0" class="mt-2 text-xs text-gray-400">
          Aucune table libre pour le moment — votre commande sera préparée à emporter.
        </p>
        <p v-else class="mt-2 text-xs text-gray-400">
          Installez-vous puis choisissez votre table. Sinon laissez « À emporter ».
        </p>
      </div>

      <div>
        <label class="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">Note</label>
        <textarea v-model="client.note"
          :placeholder="client.tableId ? 'Précision pour la cuisine… (ex : sans piment)' : 'Précisez ici si c\'est à emporter… (ex : à emporter, sauce à part)'"
          class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500"></textarea>
      </div>

      <div class="rounded-2xl bg-white p-4 ring-1 ring-gray-100">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-500">Total</span>
          <span class="text-xl font-extrabold text-gray-900">{{ fmtPrice(client.cartTotal) }}</span>
        </div>
      </div>

      <button @click="commander"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 text-base font-bold text-white transition hover:bg-orange-600">
        <ShoppingBag :size="20" /> Commander
      </button>
    </div>
  </div>
</template>
