<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ordersState } from '@/state/orders'
import { PackageOpen, Eye, ChefHat, Utensils, Clock, CheckCircle, XCircle, User } from '@lucide/vue'

const router = useRouter()
const store = ordersState
const error = ref(null)
const loading = ref(true)

const statusConfig = {
  pending: { label: 'Nouvelle', icon: Clock, class: 'bg-yellow-100 text-yellow-800' },
  waiting: { label: 'En attente', icon: Clock, class: 'bg-orange-100 text-orange-800' },
  preparing: { label: 'En préparation', icon: ChefHat, class: 'bg-blue-100 text-blue-800' },
  ready: { label: 'Prête', icon: CheckCircle, class: 'bg-green-100 text-green-800' },
  served: { label: 'Servie', icon: Utensils, class: 'bg-teal-100 text-teal-800' },
  cancelled: { label: 'Annulée', icon: XCircle, class: 'bg-red-100 text-red-800' },
}

const myOrders = computed(() =>
  [...store.orders].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
)

const tab = ref('active')

const ACTIVE = ['pending', 'waiting', 'preparing', 'ready']

const activeOrders = computed(() => myOrders.value.filter((o) => ACTIVE.includes(o.status)))
const historyOrders = computed(() => myOrders.value.filter((o) => !ACTIVE.includes(o.status)))
const visibleOrders = computed(() => (tab.value === 'active' ? activeOrders.value : historyOrders.value))

function getStatusConfig(status) {
  return statusConfig[status] || statusConfig.pending
}

function fmtPrice(p) {
  if (typeof p !== 'number') return '0 FCFA'
  return new Intl.NumberFormat('fr-FR').format(p) + ' FCFA'
}

function formatDate(ts) {
  try {
    return new Date(ts).toLocaleDateString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })
  } catch {
    return ''
  }
}

function orderId(id) {
  return '#' + String(id || '').slice(-6)
}

let refreshTimer

onMounted(() => {
  loading.value = false
  store.fetchMine()
  refreshTimer = window.setInterval(() => store.fetchMine(), 30000)
})

onUnmounted(() => {
  if (refreshTimer) window.clearInterval(refreshTimer)
})
</script>

<template>
  <div class="px-4 py-8">
    <div class="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="font-display text-2xl font-extrabold text-tola-ink">Mes Commandes</h1>
        <p v-if="myOrders.length > 0" class="mt-1 text-sm text-tola-gray">{{ myOrders.length }} commande(s)</p>
      </div>
      <div v-if="myOrders.length > 0" class="flex gap-2">
        <button @click="tab = 'active'"
          class="rounded-full px-4 py-2 text-xs font-bold transition"
          :class="tab === 'active' ? 'bg-tola-orange text-white' : 'bg-tola-cream text-tola-gray'">
          En cours ({{ activeOrders.length }})
        </button>
        <button @click="tab = 'history'"
          class="rounded-full px-4 py-2 text-xs font-bold transition"
          :class="tab === 'history' ? 'bg-tola-orange text-white' : 'bg-tola-cream text-tola-gray'">
          Historique ({{ historyOrders.length }})
        </button>
      </div>
    </div>

    <div v-if="error" class="flex flex-col items-center justify-center py-20">
      <p class="text-tola-red">{{ error }}</p>
      <button @click="router.push('/client/menu')" class="mt-4 rounded-full bg-tola-orange px-6 py-2 text-sm font-bold text-white">
        Retour au menu
      </button>
    </div>

    <div v-else-if="myOrders.length === 0" class="flex flex-col items-center justify-center py-20">
      <PackageOpen :size="48" class="mb-4 text-tola-gray/30" />
      <p class="text-tola-gray">Vous n'avez pas encore de commande</p>
      <button @click="router.push('/client/menu')" class="mt-4 rounded-full bg-tola-orange px-6 py-2 text-sm font-bold text-white transition hover:bg-tola-orange-dark">
        Commander
      </button>
    </div>

    <template v-else>
      <div v-if="tab === 'active' && activeOrders.length === 0" class="flex flex-col items-center justify-center py-20">
        <ChefHat :size="48" class="mb-4 text-tola-gray/30" />
        <p class="text-tola-gray">Aucune commande en cours</p>
      </div>
      <div v-else-if="tab === 'history' && historyOrders.length === 0" class="flex flex-col items-center justify-center py-20">
        <PackageOpen :size="48" class="mb-4 text-tola-gray/30" />
        <p class="text-tola-gray">Aucune commande passée pour le moment</p>
      </div>
      <div v-else class="space-y-4">
        <div v-for="order in visibleOrders" :key="order.id"
        class="rounded-xl border border-tola-cream-dark bg-white p-4 transition hover:shadow-sm"
        @click="router.push('/client/confirmation/' + order.id)">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="font-bold text-tola-ink">Commande {{ orderId(order.id) }}</span>
              <span class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                :class="getStatusConfig(order.status).class">
                <component :is="getStatusConfig(order.status).icon" :size="12" />
                {{ getStatusConfig(order.status).label }}
              </span>
            </div>
            <p class="mt-1 text-xs text-tola-gray">
              {{ formatDate(order.createdAt) }}
            </p>
            <p v-if="order.server" class="mt-1 flex items-center gap-1 text-xs text-tola-gray">
              <User :size="12" /> Pris en charge par {{ order.server.name }}
            </p>
            <div class="mt-2 flex flex-wrap gap-2">
              <span v-for="item in (order.items || []).slice(0, 3)" :key="item.menuItemId"
                class="rounded-full bg-tola-cream px-2 py-0.5 text-[10px] text-tola-gray">
                {{ item.qty }}x {{ item.name }}
              </span>
              <span v-if="order.items && order.items.length > 3" class="text-[10px] text-tola-gray">+{{ order.items.length - 3 }}</span>
            </div>
          </div>
          <div class="flex flex-col items-end gap-1">
            <span class="font-bold text-tola-orange">{{ fmtPrice(order.total) }}</span>
            <span v-if="order.paid" class="text-[10px] text-green-600 font-semibold">Payée</span>
            <Eye :size="16" class="mt-2 text-tola-gray/40" />
          </div>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>
