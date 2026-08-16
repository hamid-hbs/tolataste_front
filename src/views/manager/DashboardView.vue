<script setup>
import { computed } from 'vue'
import { ordersState as orders } from '@/state/orders'
import { TrendingUp, ShoppingCart, Clock, DollarSign, ListOrdered } from '@lucide/vue'

const todaySales = computed(() => orders.todaySales)
const todayOrdersCount = computed(() => orders.todayOrders.length)
const activeCount = computed(() => orders.activeCount)
const averageOrderValue = computed(() => orders.averageOrderValue)
const recentOrders = computed(() => [...orders.todayOrders]
  .sort((a, b) => b.createdAt - a.createdAt)
  .slice(0, 10))

const statusColors = {
  pending: 'bg-tola-orange/10 text-tola-orange',
  waiting: 'bg-tola-yellow/10 text-tola-yellow',
  preparing: 'bg-tola-orange/10 text-tola-orange',
  ready: 'bg-tola-teal/10 text-tola-teal',
  served: 'bg-tola-cream text-tola-gray',
  cancelled: 'bg-tola-red/10 text-tola-red',
}

function fmtPrice(p) {
  return new Intl.NumberFormat('fr-FR').format(p) + ' FCFA'
}

function fmtTime(ts) {
  return new Date(ts).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

const kpis = computed(() => [
  { label: 'CA Aujourd\'hui', value: fmtPrice(todaySales.value), icon: DollarSign, color: 'text-tola-teal bg-tola-teal/[0.06]' },
  { label: 'Commandes ajd', value: String(todayOrdersCount.value), icon: ShoppingCart, color: 'text-tola-orange bg-tola-orange/[0.06]' },
  { label: 'Actives', value: String(activeCount.value), icon: Clock, color: 'text-tola-teal bg-tola-teal/[0.06]' },
  { label: 'Panier moyen', value: fmtPrice(averageOrderValue.value), icon: TrendingUp, color: 'text-tola-orange bg-tola-orange/[0.06]' },
])
</script>

<template>
  <div>
    <h1 class="mb-6 text-xl font-extrabold text-tola-ink font-display">Tableau de bord</h1>

    <div class="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div v-for="kpi in kpis" :key="kpi.label"
        class="rounded-2xl bg-white p-4 ring-1 ring-tola-cream-dark/60">
        <div :class="`mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${kpi.color}`">
          <component :is="kpi.icon" :size="20" />
        </div>
        <p class="text-lg font-extrabold text-tola-ink">{{ kpi.value }}</p>
        <p class="text-xs font-semibold text-tola-gray">{{ kpi.label }}</p>
      </div>
    </div>

    <div class="rounded-2xl bg-white ring-1 ring-tola-cream-dark/60">
      <div class="border-b border-tola-cream-dark px-5 py-4">
        <h2 class="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-tola-gray">
          <ListOrdered :size="16" class="text-tola-orange" /> Dernières commandes
        </h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-tola-cream-dark text-xs font-bold uppercase tracking-wider text-tola-gray">
              <th class="px-5 py-3">#</th>
              <th class="px-5 py-3">Table</th>
              <th class="px-5 py-3">Articles</th>
              <th class="px-5 py-3">Total</th>
              <th class="px-5 py-3">Statut</th>
              <th class="px-5 py-3">Heure</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-tola-cream-dark">
            <tr v-for="order in recentOrders" :key="order.id" class="transition hover:bg-tola-cream">
              <td class="px-5 py-3 font-bold text-tola-ink">{{ order.id }}</td>
              <td class="px-5 py-3 text-tola-gray">{{ order.tableId ? `T${order.tableId}` : '—' }}</td>
              <td class="px-5 py-3 text-tola-gray">{{ order.items.length }}</td>
              <td class="px-5 py-3 font-bold text-tola-ink">{{ fmtPrice(order.total) }}</td>
              <td class="px-5 py-3">
                <span class="rounded-full px-2.5 py-0.5 text-[10px] font-bold" :class="statusColors[order.status] || 'bg-tola-cream text-tola-gray'">
                  {{ orders.STATUS_LABELS[order.status] }}
                </span>
              </td>
              <td class="px-5 py-3 text-xs text-tola-gray">{{ fmtTime(order.createdAt) }}</td>
            </tr>
            <tr v-if="recentOrders.length === 0">
              <td colspan="6" class="px-5 py-8 text-center text-sm text-tola-gray">Aucune commande aujourd'hui</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
