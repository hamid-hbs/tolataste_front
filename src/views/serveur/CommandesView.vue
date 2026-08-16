<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { ordersState as orders, PAYMENT_LABELS } from '@/state/orders'
import { tablesState as tables } from '@/state/tables'
import { authState as auth } from '@/state/auth'
import { notificationsState as notif } from '@/state/notifications'
import OrderDetailsModal from '@/components/OrderDetailsModal.vue'
import { Clock, X, CheckCircle, Package, Eye, History, Loader2 } from '@lucide/vue'
import { elapsed } from '@/utils/time'

const detailOrderId = ref(null)
const tab = ref('new')

const pendingOrders = computed(() => orders.clientNewOrders)

function loadHistory() {
  orders.fetchHistory({ serverId: auth.user?.id, perPage: 20 })
}

watch(tab, (t) => { if (t === 'mine') loadHistory() })

onMounted(loadHistory)

const statusChip = {
  pending: 'bg-tola-orange/10 text-tola-orange',
  waiting: 'bg-tola-yellow/10 text-tola-yellow',
  preparing: 'bg-blue-100 text-blue-800',
  ready: 'bg-tola-teal/10 text-tola-teal',
  served: 'bg-tola-cream-dark text-tola-gray',
  cancelled: 'bg-tola-red/10 text-tola-red',
}

function fmtDateTime(ts) {
  try {
    return new Date(ts).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return ''
  }
}

function takeCharge(orderId) {
  orders.updateStatus(orderId, 'waiting')
  notif.add({ type: 'info', title: 'Prise en charge', message: `Commande #${orderId} en attente` })
}

function cancelOrder(orderId) {
  const order = orders.getOrder(orderId)
  orders.updateStatus(orderId, 'cancelled')
  if (order?.tableId) tables.freeTable(order.tableId)
  notif.add({ type: 'warning', title: 'Annulée', message: `Commande #${orderId} annulée` })
}

function fmtPrice(p) {
  return new Intl.NumberFormat('fr-FR').format(p) + ' FCFA'
}
</script>

<template>
  <div>
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-extrabold text-tola-ink font-display">Commandes</h1>
        <p class="text-sm text-tola-gray">Commandes clients et historique du serveur</p>
      </div>
      <div class="flex gap-2">
        <button @click="tab = 'new'"
          class="rounded-full px-4 py-2 text-xs font-bold transition"
          :class="tab === 'new' ? 'bg-tola-orange text-white' : 'bg-tola-cream text-tola-gray'">
          Nouvelles ({{ pendingOrders.length }})
        </button>
        <button @click="tab = 'mine'"
          class="rounded-full px-4 py-2 text-xs font-bold transition"
          :class="tab === 'mine' ? 'bg-tola-orange text-white' : 'bg-tola-cream text-tola-gray'">
          Mon historique ({{ orders.historyTotal }})
        </button>
      </div>
    </div>

    <template v-if="tab === 'new'">
      <div v-if="pendingOrders.length === 0" class="flex flex-col items-center justify-center py-16 text-tola-gray">
      <Package :size="48" class="mb-3" />
      <p class="text-sm font-medium">Aucune nouvelle commande</p>
    </div>

    <div v-else class="space-y-4">
      <div v-for="order in pendingOrders" :key="order.id"
        class="cursor-pointer rounded-2xl bg-white p-5 ring-1 ring-tola-cream-dark/60 transition hover:shadow-md"
        @click="detailOrderId = order.id">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-lg font-extrabold text-tola-ink">#{{ order.id }}</span>
              <span class="rounded-full bg-tola-orange/10 px-2.5 py-0.5 text-[10px] font-bold text-tola-orange animate-pulse">Nouvelle</span>
              <span class="flex items-center gap-1 text-xs text-tola-gray"><Clock :size="12" /> {{ elapsed(order.createdAt) }}</span>
            </div>
            <p v-if="order.tableId" class="mt-1 text-sm font-medium text-tola-gray">Table {{ order.tableId }}</p>
            <div class="mt-3 space-y-1">
              <div v-for="item in order.items" :key="item.menuItemId" class="text-sm text-tola-gray">
                <span class="font-bold text-tola-ink">{{ item.qty }}×</span> {{ item.name }}
              </div>
            </div>
            <p v-if="order.note" class="mt-2 rounded-lg bg-tola-yellow/[0.06] px-3 py-1.5 text-xs font-medium text-tola-yellow">
              Note: {{ order.note }}
            </p>
            <p class="mt-3 text-sm font-bold text-tola-orange">{{ fmtPrice(order.total) }}</p>
          </div>
          <div class="flex flex-col gap-2 shrink-0">
            <button @click.stop="detailOrderId = order.id"
              class="flex items-center justify-center gap-1.5 rounded-full border border-tola-cream-dark px-4 py-2 text-xs font-bold text-tola-gray transition hover:bg-tola-cream">
              <Eye :size="14" /> Détails
            </button>
            <button @click.stop="takeCharge(order.id)"
              class="flex items-center gap-1.5 rounded-full bg-tola-orange px-4 py-2 text-xs font-bold text-white transition hover:bg-tola-orange-dark">
              <CheckCircle :size="14" /> Prendre en charge
            </button>
            <button @click.stop="cancelOrder(order.id)"
              class="flex items-center gap-1.5 rounded-full bg-tola-red/[0.06] px-4 py-2 text-xs font-bold text-tola-red transition hover:bg-red-100">
              <X :size="14" /> Annuler
            </button>
          </div>
        </div>
      </div>
      </div>
    </template>

    <template v-else>
      <div v-if="orders.historyLoading" class="flex justify-center py-16">
        <Loader2 :size="28" class="animate-spin text-tola-orange" />
      </div>
      <div v-else-if="orders.historyOrders.length === 0" class="flex flex-col items-center justify-center py-16 text-tola-gray">
        <History :size="48" class="mb-3 text-tola-cream-dark" />
        <p class="text-sm font-medium">Aucune commande prise en charge</p>
      </div>

      <div v-else class="space-y-4">
        <div v-for="order in orders.historyOrders" :key="order.id"
          class="cursor-pointer rounded-2xl bg-white p-5 ring-1 ring-tola-cream-dark/60 transition hover:shadow-md"
          @click="detailOrderId = order.id">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-lg font-extrabold text-tola-ink">#{{ order.id }}</span>
                <span class="rounded-full px-2.5 py-0.5 text-[10px] font-bold" :class="statusChip[order.status]">
                  {{ orders.STATUS_LABELS[order.status] ?? order.status }}
                </span>
                <span class="flex items-center gap-1 text-xs text-tola-gray"><Clock :size="12" /> {{ fmtDateTime(order.createdAt) }}</span>
                <span v-if="order.tableId" class="rounded-full bg-tola-cream px-2.5 py-0.5 text-[10px] font-bold text-tola-gray">
                  Table {{ order.tableId }}
                </span>
                <span class="text-xs text-tola-gray">{{ order.type === 'dine_in' ? 'Sur place' : 'À emporter' }}</span>
              </div>
              <div class="mt-3 space-y-1">
                <div v-for="item in order.items" :key="item.menuItemId" class="text-sm text-tola-gray">
                  <span class="font-bold text-tola-ink">{{ item.qty }}×</span> {{ item.name }}
                  <span class="text-tola-orange">({{ fmtPrice(item.total) }})</span>
                </div>
              </div>
              <p v-if="order.note" class="mt-2 rounded-lg bg-tola-yellow/[0.06] px-3 py-1.5 text-xs font-medium text-tola-yellow">
                Note: {{ order.note }}
              </p>
              <div class="mt-3 flex flex-wrap items-center gap-2 text-sm font-bold text-tola-orange">
                <span>{{ fmtPrice(order.total) }}</span>
                <span v-if="order.paid" class="rounded-full bg-tola-teal/10 px-2.5 py-0.5 text-[10px] font-bold text-tola-teal">
                  Payée{{ order.paymentMethod ? ' — ' + (PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod) : '' }}
                </span>
                <span v-else class="rounded-full bg-tola-red/10 px-2.5 py-0.5 text-[10px] font-bold text-tola-red">Non payée</span>
              </div>
            </div>
            <div class="shrink-0">
              <button @click.stop="detailOrderId = order.id"
                class="flex items-center gap-1.5 rounded-full border border-tola-cream-dark px-4 py-2 text-xs font-bold text-tola-gray transition hover:bg-tola-cream">
                <Eye :size="14" /> Détails
              </button>
            </div>
          </div>
        </div>
        <div v-if="orders.historyHasMore" class="pt-1 text-center">
          <button @click="orders.loadMoreHistory()"
            class="rounded-full border border-tola-cream-dark px-5 py-2 text-xs font-bold text-tola-gray transition hover:bg-tola-cream">
            Afficher plus
          </button>
        </div>
      </div>
    </template>
  <OrderDetailsModal v-if="detailOrderId" :order-id="detailOrderId" @close="detailOrderId = null" />
  </div>
</template>
