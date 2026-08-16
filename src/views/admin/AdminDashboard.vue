<script setup>
import { computed } from 'vue'
import { authState as auth } from '@/state/auth'
import { tablesState as tables } from '@/state/tables'
import { menuState as menu } from '@/state/menu'
import { ordersState as orders, STATUS_LABELS } from '@/state/orders'
import { Users, TableIcon, Utensils, ShoppingCart, Grid3X3 } from '@lucide/vue'
import ChartBox from '@/components/ChartBox.vue'

const STATUS_COLORS = {
  pending: '#3b82f6',
  waiting: '#f59e0b',
  preparing: '#e8720c',
  ready: '#2dd4bf',
  served: '#8b5cf6',
  paid: '#10b981',
  cancelled: '#ef4444',
}

const quickLinks = [
  { label: 'Utilisateurs', icon: Users, to: '/admin/users', color: 'bg-tola-orange/[0.06] text-tola-orange' },
  { label: 'Tables', icon: TableIcon, to: '/admin/tables', color: 'bg-tola-teal/[0.06] text-tola-teal' },
  { label: 'Catégories', icon: Grid3X3, to: '/admin/categories', color: 'bg-tola-orange/[0.06] text-tola-orange' },
]

const last7Days = computed(() => {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - i)
    const key = d.toDateString()
    const dayOrders = orders.orders.filter((o) => o.createdAt && new Date(o.createdAt).toDateString() === key)
    days.push({
      label: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
      count: dayOrders.length,
      sales: dayOrders.reduce((s, o) => s + Number(o.total || 0), 0),
    })
  }
  return days
})

const salesChart = computed(() => ({
  labels: last7Days.value.map((d) => d.label),
  datasets: [{
    label: 'CA (FCFA)',
    data: last7Days.value.map((d) => d.sales),
    backgroundColor: '#e8720c',
    borderRadius: 6,
  }],
}))

const ordersChart = computed(() => ({
  labels: last7Days.value.map((d) => d.label),
  datasets: [{
    label: 'Commandes',
    data: last7Days.value.map((d) => d.count),
    borderColor: '#2dd4bf',
    backgroundColor: 'rgba(45, 212, 191, 0.2)',
    tension: 0.35,
    fill: true,
  }],
}))

const statusChart = computed(() => {
  const counts = {}
  for (const s of Object.keys(STATUS_LABELS)) counts[s] = 0
  for (const o of orders.orders) counts[o.status] = (counts[o.status] ?? 0) + 1
  const entries = Object.entries(counts).filter(([, v]) => v > 0)
  return {
    labels: entries.map(([k]) => STATUS_LABELS[k]),
    datasets: [{
      data: entries.map(([, v]) => v),
      backgroundColor: entries.map(([k]) => STATUS_COLORS[k] ?? '#9ca3af'),
      borderWidth: 0,
    }],
  }
})

const typeChart = computed(() => {
  let dine = 0
  let take = 0
  for (const o of orders.orders) {
    if (o.type === 'dine_in') dine += 1
    else take += 1
  }
  return {
    labels: ['Sur place', 'À emporter'],
    datasets: [{
      data: [dine, take],
      backgroundColor: ['#e8720c', '#2dd4bf'],
      borderWidth: 0,
    }],
  }
})

const topProducts = computed(() => {
  const map = new Map()
  for (const o of orders.orders) {
    for (const i of o.items ?? []) {
      const name = i.name ?? 'Article'
      map.set(name, (map.get(name) ?? 0) + Number(i.qty ?? 1))
    }
  }
  const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)
  return {
    labels: sorted.map(([n]) => n),
    values: sorted.map(([, q]) => q),
  }
})

const topChart = computed(() => ({
  labels: topProducts.value.labels,
  datasets: [{
    label: 'Vendus',
    data: topProducts.value.values,
    backgroundColor: '#2dd4bf',
    borderRadius: 6,
  }],
}))
</script>

<template>
  <div>
    <h1 class="mb-6 text-xl font-extrabold text-tola-ink font-display">Administration</h1>

    <div class="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div class="rounded-2xl bg-white p-4 ring-1 ring-tola-cream-dark/60">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-tola-orange/[0.06] text-tola-orange">
          <Users :size="20" />
        </div>
        <p class="mt-3 text-2xl font-extrabold text-tola-ink">{{ auth.users.length }}</p>
        <p class="text-xs font-semibold text-tola-gray">Utilisateurs</p>
      </div>
      <div class="rounded-2xl bg-white p-4 ring-1 ring-tola-cream-dark/60">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-tola-teal/[0.06] text-tola-teal">
          <TableIcon :size="20" />
        </div>
        <p class="mt-3 text-2xl font-extrabold text-tola-ink">{{ tables.tableCount }}</p>
        <p class="text-xs font-semibold text-tola-gray">Tables</p>
      </div>
      <div class="rounded-2xl bg-white p-4 ring-1 ring-tola-cream-dark/60">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-tola-teal/[0.06] text-tola-teal">
          <Utensils :size="20" />
        </div>
        <p class="mt-3 text-2xl font-extrabold text-tola-ink">{{ menu.items.length }}</p>
        <p class="text-xs font-semibold text-tola-gray">Articles au menu</p>
      </div>
      <div class="rounded-2xl bg-white p-4 ring-1 ring-tola-cream-dark/60">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-tola-orange/[0.06] text-tola-orange">
          <ShoppingCart :size="20" />
        </div>
        <p class="mt-3 text-2xl font-extrabold text-tola-ink">{{ orders.orders.length }}</p>
        <p class="text-xs font-semibold text-tola-gray">Commandes totales</p>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <ChartBox title="Chiffre d'affaires des 7 derniers jours" type="bar" :labels="salesChart.labels" :datasets="salesChart.datasets" />
      <ChartBox title="Commandes des 7 derniers jours" type="line" :labels="ordersChart.labels" :datasets="ordersChart.datasets" />
      <ChartBox title="Répartition par statut" type="doughnut" :labels="statusChart.labels" :datasets="statusChart.datasets" :legend="true" />
      <ChartBox title="Sur place / à emporter" type="doughnut" :labels="typeChart.labels" :datasets="typeChart.datasets" :legend="true" />
      <ChartBox title="Top produits" type="bar" :labels="topChart.labels" :datasets="topChart.datasets" horizontal />
    </div>

    
  </div>
</template>