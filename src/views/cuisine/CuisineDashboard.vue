<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { ordersState as orders, PAYMENT_LABELS } from '@/state/orders'
import { notificationsState as notif } from '@/state/notifications'
import OrderDetailsModal from '@/components/OrderDetailsModal.vue'
import { Clock, ChefHat, BellRing, Check, History, Eye, Loader2 } from '@lucide/vue'
import { elapsed } from '@/utils/time'

const detailOrderId = ref(null)
const tab = ref('live')

const waitingList = computed(() => orders.waitingOrders)
const preparingList = computed(() => orders.preparingOrders)
const readyList = computed(() => orders.readyOrders)

const liveCount = computed(() => waitingList.value.length + preparingList.value.length + readyList.value.length)

function loadHistory() {
  orders.fetchHistory({ statuses: ['preparing', 'ready', 'served'], perPage: 20 })
}

watch(tab, (t) => { if (t === 'history') loadHistory() })

onMounted(loadHistory)

const statusChip = {
  preparing: 'bg-blue-100 text-blue-800',
  ready: 'bg-tola-teal/10 text-tola-teal',
  served: 'bg-tola-cream-dark text-tola-gray',
  cancelled: 'bg-tola-red/10 text-tola-red',
}

function fmtPrice(p) {
  return new Intl.NumberFormat('fr-FR').format(Number(p) || 0) + ' FCFA'
}

function fmtDateTime(ts) {
  try {
    return new Date(ts).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return ''
  }
}

function startPrep(orderId) {
  orders.updateStatus(orderId, 'preparing')
  notif.add({ type: 'info', title: 'En préparation', message: `Commande #${orderId} en cours` })
}

function markReady(orderId) {
  orders.updateStatus(orderId, 'ready')
  notif.add({ type: 'success', title: 'Commande prête !', message: `#${orderId} — Bon appétit !` })
}
</script>

<template>
  <div>
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-extrabold text-tola-ink font-display">Cuisine</h1>
      <div class="flex gap-2">
        <button @click="tab = 'live'"
          class="rounded-full px-4 py-2 text-xs font-bold transition"
          :class="tab === 'live' ? 'bg-tola-orange text-white' : 'bg-tola-cream text-tola-gray'">
          En cours ({{ liveCount }})
        </button>
        <button @click="tab = 'history'"
          class="rounded-full px-4 py-2 text-xs font-bold transition"
          :class="tab === 'history' ? 'bg-tola-orange text-white' : 'bg-tola-cream text-tola-gray'">
          Historique ({{ orders.historyTotal }})
        </button>
      </div>
    </div>

    <div v-if="tab === 'live'" class="grid gap-6 lg:grid-cols-3">
      <!-- Column 1: Nouvelles (waiting) -->
      <div>
        <h2 class="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-tola-gray">
          <Clock :size="16" class="text-tola-orange" /> Nouvelles
          <span class="ml-auto rounded-full bg-tola-orange/10 px-2.5 py-0.5 text-xs text-tola-orange">{{ waitingList.length }}</span>
        </h2>
        <div v-if="waitingList.length === 0" class="flex h-32 items-center justify-center rounded-xl bg-tola-cream text-sm text-tola-gray">Aucune</div>
        <div v-else class="space-y-3">
          <div v-for="order in waitingList" :key="order.id"
            class="cursor-pointer rounded-xl border-2 border-amber-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            @click="detailOrderId = order.id">
            <div class="mb-2 flex items-center justify-between">
              <span class="font-extrabold text-tola-ink">#{{ order.id }}</span>
              <span class="text-xs text-tola-gray"><Clock :size="12" class="inline" /> {{ elapsed(order.createdAt) }}</span>
            </div>
            <p v-if="order.tableId" class="mb-2 text-xs font-medium text-tola-gray">Table {{ order.tableId }}</p>
            <div class="mb-3 space-y-1">
              <div v-for="item in order.items" :key="item.menuItemId" class="text-sm text-tola-gray">
                <span class="font-bold text-tola-ink">{{ item.qty }}×</span> {{ item.name }}
              </div>
            </div>
            <p v-if="order.note" class="mb-3 rounded-lg bg-tola-yellow/[0.06] px-3 py-1.5 text-xs font-medium text-tola-yellow">
              Note: {{ order.note }}
            </p>
            <button @click.stop="startPrep(order.id)"
              class="flex w-full items-center justify-center gap-1.5 rounded-lg bg-tola-orange py-2.5 text-xs font-bold text-white transition hover:bg-tola-orange-dark">
              <ChefHat :size="14" /> Commencer
            </button>
          </div>
        </div>
      </div>

      <!-- Column 2: En préparation -->
      <div>
        <h2 class="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-tola-gray">
          <ChefHat :size="16" class="text-tola-orange" /> En préparation
          <span class="ml-auto rounded-full bg-tola-orange/10 px-2.5 py-0.5 text-xs text-tola-orange">{{ preparingList.length }}</span>
        </h2>
        <div v-if="preparingList.length === 0" class="flex h-32 items-center justify-center rounded-xl bg-tola-cream text-sm text-tola-gray">Aucune</div>
        <div v-else class="space-y-3">
          <div v-for="order in preparingList" :key="order.id"
            class="cursor-pointer rounded-xl border-2 border-tola-orange/20 bg-white p-4 shadow-sm transition hover:shadow-md"
            @click="detailOrderId = order.id">
            <div class="mb-2 flex items-center justify-between">
              <span class="font-extrabold text-tola-ink">#{{ order.id }}</span>
              <span class="text-xs text-tola-gray"><Clock :size="12" class="inline" /> {{ elapsed(order.createdAt) }}</span>
            </div>
            <p v-if="order.tableId" class="mb-2 text-xs font-medium text-tola-gray">Table {{ order.tableId }}</p>
            <div class="mb-3 space-y-1">
              <div v-for="item in order.items" :key="item.menuItemId" class="text-sm text-tola-gray">
                <span class="font-bold text-tola-ink">{{ item.qty }}×</span> {{ item.name }}
              </div>
            </div>
            <p v-if="order.note" class="mb-3 rounded-lg bg-tola-yellow/[0.06] px-3 py-1.5 text-xs font-medium text-tola-yellow">
              Note: {{ order.note }}
            </p>
            <button @click.stop="markReady(order.id)"
              class="flex w-full items-center justify-center gap-1.5 rounded-lg bg-tola-teal py-2.5 text-xs font-bold text-white transition hover:bg-tola-teal">
              <Check :size="14" /> Prêt à servir
            </button>
          </div>
        </div>
      </div>

      <!-- Column 3: Prêtes -->
      <div>
        <h2 class="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-tola-gray">
          <BellRing :size="16" class="text-emerald-500" /> Prêtes
          <span class="ml-auto rounded-full bg-tola-teal/10 px-2.5 py-0.5 text-xs text-tola-teal">{{ readyList.length }}</span>
        </h2>
        <div v-if="readyList.length === 0" class="flex h-32 items-center justify-center rounded-xl bg-tola-cream text-sm text-tola-gray">Aucune</div>
        <div v-else class="space-y-3">
          <div v-for="order in readyList" :key="order.id"
            class="cursor-pointer rounded-xl border-2 border-tola-teal/30 bg-tola-teal/[0.06] p-4 shadow-sm transition hover:shadow-md"
            @click="detailOrderId = order.id">
            <div class="mb-2 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="font-extrabold text-tola-ink">#{{ order.id }}</span>
                <span class="animate-pulse rounded-full bg-tola-teal px-2 py-0.5 text-[10px] font-bold text-white">SERVICE!</span>
              </div>
              <span class="text-xs text-tola-gray"><Clock :size="12" class="inline" /> {{ elapsed(order.createdAt) }}</span>
            </div>
            <p v-if="order.tableId" class="mb-2 text-xs font-medium text-tola-gray">Table {{ order.tableId }}</p>
            <div class="space-y-1">
              <div v-for="item in order.items" :key="item.menuItemId" class="text-sm text-tola-gray">
                <span class="font-bold text-tola-ink">{{ item.qty }}×</span> {{ item.name }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template v-else>
      <div v-if="orders.historyLoading" class="flex justify-center py-16">
        <Loader2 :size="28" class="animate-spin text-tola-orange" />
      </div>
      <div v-else-if="orders.historyOrders.length === 0" class="flex flex-col items-center justify-center py-16 text-tola-gray">
        <History :size="48" class="mb-3 text-tola-cream-dark" />
        <p class="text-sm font-medium">Aucun plat préparé pour le moment</p>
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
