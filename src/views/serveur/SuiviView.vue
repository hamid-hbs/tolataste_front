<script setup>
import { ref, computed } from 'vue'
import { ordersState as orders } from '@/state/orders'
import { notificationsState as notif } from '@/state/notifications'
import OrderDetailsModal from '@/components/OrderDetailsModal.vue'
import { ChefHat, BellRing, List, Hand, Clock, Eye } from '@lucide/vue'
import { elapsed } from '@/utils/time'

const activeTab = ref('all')
const detailOrderId = ref(null)

const filteredOrders = computed(() => {
  const list = orders.kitchenOrders
  if (activeTab.value === 'preparing') return list.filter((o) => o.status === 'preparing')
  if (activeTab.value === 'ready') return list.filter((o) => o.status === 'ready')
  return list
})

async function serveOrder(orderId) {
  await orders.updateStatus(orderId, 'served')
  notif.add({ type: 'success', title: 'Servi !', message: `Commande #${orderId} servie` })
}

function fmtPrice(p) {
  return new Intl.NumberFormat('fr-FR').format(p) + ' FCFA'
}
</script>

<template>
  <div>
    <h1 class="mb-6 text-xl font-extrabold text-tola-ink font-display">Suivi des commandes</h1>

    <div class="mb-6 flex gap-2">
      <button @click="activeTab = 'all'"
        class="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition"
        :class="activeTab === 'all' ? 'bg-tola-orange text-white' : 'bg-tola-cream text-tola-gray'">
        <List :size="14" /> Toutes
      </button>
      <button @click="activeTab = 'preparing'"
        class="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition"
        :class="activeTab === 'preparing' ? 'bg-tola-orange text-white' : 'bg-tola-cream text-tola-gray'">
        <ChefHat :size="14" /> En préparation
      </button>
      <button @click="activeTab = 'ready'"
        class="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition"
        :class="activeTab === 'ready' ? 'bg-tola-orange text-white' : 'bg-tola-cream text-tola-gray'">
        <BellRing :size="14" /> Prêtes
      </button>
    </div>

    <div v-if="filteredOrders.length === 0" class="py-12 text-center text-sm text-tola-gray">Aucune commande</div>

    <div v-else class="space-y-4">
      <div v-for="order in filteredOrders" :key="order.id"
        class="cursor-pointer rounded-2xl bg-white p-5 ring-1 ring-tola-cream-dark/60 transition hover:shadow-md"
        :class="{ 'ring-2 ring-tola-teal/30 bg-tola-teal/[0.06]': order.status === 'ready' }"
        @click="detailOrderId = order.id">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-lg font-extrabold text-tola-ink">#{{ order.id }}</span>
              <span class="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                :class="{
                  'bg-tola-yellow/10 text-tola-yellow': order.status === 'preparing',
                  'bg-tola-teal/10 text-tola-teal': order.status === 'ready',
                  'bg-tola-cream-dark text-tola-gray': order.status === 'waiting',
                }">{{ orders.STATUS_LABELS[order.status] }}</span>
              <span class="flex items-center gap-1 text-xs text-tola-gray"><Clock :size="12" /> {{ elapsed(order.createdAt) }}</span>
            </div>
            <p v-if="order.tableId" class="mt-1 text-sm font-medium text-tola-gray">Table {{ order.tableId }}</p>
            <div class="mt-3 space-y-1">
              <div v-for="item in order.items" :key="item.menuItemId" class="text-sm text-tola-gray">
                <span class="font-bold text-tola-ink">{{ item.qty }}×</span> {{ item.name }}
                <span class="text-tola-orange">({{ fmtPrice(item.total) }})</span>
              </div>
            </div>
          </div>
          <div v-if="order.status === 'ready'" class="shrink-0">
            <button @click.stop="detailOrderId = order.id"
              class="mb-2 flex w-full items-center justify-center gap-1.5 rounded-full border border-tola-cream-dark px-5 py-2 text-xs font-bold text-tola-gray transition hover:bg-tola-cream">
              <Eye :size="14" /> Détails
            </button>
            <button @click.stop="serveOrder(order.id)"
              class="flex w-full items-center justify-center gap-1.5 rounded-full bg-tola-teal px-5 py-2.5 text-xs font-bold text-white shadow transition hover:bg-tola-teal">
              <Hand :size="14" /> Servir
            </button>
          </div>
        </div>
      </div>
    </div>
  <OrderDetailsModal v-if="detailOrderId" :order-id="detailOrderId" @close="detailOrderId = null" />
  </div>
</template>
