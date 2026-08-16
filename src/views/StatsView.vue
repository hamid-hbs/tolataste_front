<script setup>
import { computed } from 'vue'
import { ordersState as orders, STATUS_LABELS } from '@/state/orders'
import {
  TrendingUp, ShoppingCart, ListOrdered, DollarSign, Utensils, Wallet, Loader2,
} from '@lucide/vue'

const todaySales = computed(() => orders.todaySales)
const todayCount = computed(() => orders.todayOrders.length)
const activeCount = computed(() => orders.activeCount)
const averageOrder = computed(() => orders.averageOrderValue)

const byStatus = computed(() => {
  const counts = {}
  for (const s of Object.keys(STATUS_LABELS)) counts[s] = 0
  for (const o of orders.orders) {
    counts[o.status] = (counts[o.status] ?? 0) + 1
  }
  const total = orders.orders.length || 1
  return Object.entries(counts).map(([key, value]) => ({ key, label: STATUS_LABELS[key], value, pct: Math.round((value / total) * 100) }))
})

const byType = computed(() => {
  const counts = { dine_in: 0, takeaway: 0 }
  for (const o of orders.orders) {
    if (o.type === 'dine_in') counts.dine_in += 1
    else counts.takeaway += 1
  }
  const total = orders.orders.length || 1
  return [
    { key: 'dine_in', label: 'Sur place', value: counts.dine_in, pct: Math.round((counts.dine_in / total) * 100) },
    { key: 'takeaway', label: 'À emporter', value: counts.takeaway, pct: Math.round((counts.takeaway / total) * 100) },
  ]
})

const topProducts = computed(() => {
  const map = new Map()
  for (const o of orders.orders) {
    for (const i of o.items ?? []) {
      const name = i.name ?? 'Article'
      map.set(name, (map.get(name) ?? 0) + Number(i.qty ?? 1))
    }
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
})

const last7Days = computed(() => {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - i)
    const key = d.toDateString()
    const dayOrders = orders.orders.filter((o) => {
      if (!o.createdAt) return false
      return new Date(o.createdAt).toDateString() === key
    })
    days.push({
      label: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
      count: dayOrders.length,
      sales: dayOrders.reduce((s, o) => s + Number(o.total || 0), 0),
    })
  }
  const max = Math.max(1, ...days.map((d) => d.sales))
  return days.map((d) => ({ ...d, pct: Math.round((d.sales / max) * 100) }))
})

function fmtPrice(p) {
  return new Intl.NumberFormat('fr-FR').format(Number(p) || 0) + ' FCFA'
}

const kpis = computed(() => [
  { label: 'CA du jour', value: fmtPrice(todaySales.value), icon: DollarSign, color: 'text-tola-orange bg-tola-orange/10' },
  { label: 'Commandes du jour', value: String(todayCount.value), icon: ShoppingCart, color: 'text-tola-teal bg-tola-teal/10' },
  { label: 'En cours', value: String(activeCount.value), icon: ListOrdered, color: 'text-tola-yellow bg-tola-yellow/10' },
  { label: 'Panier moyen', value: fmtPrice(averageOrder.value), icon: TrendingUp, color: 'text-tola-ink bg-tola-cream' },
])
</script>

<template>
  <div>
    <h1 class="mb-6 text-xl font-extrabold text-tola-ink font-display">Statistiques</h1>

    <!-- KPI -->
    <div class="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div v-for="k in kpis" :key="k.label" class="rounded-2xl bg-white p-4 ring-1 ring-tola-cream-dark/60">
        <div class="flex items-center gap-2">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl" :class="k.color">
            <component :is="k.icon" :size="18" />
          </div>
          <span class="text-[11px] font-bold uppercase tracking-wider text-tola-gray">{{ k.label }}</span>
        </div>
        <p class="mt-2 text-xl font-extrabold text-tola-ink">{{ k.value }}</p>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Répartition par statut -->
      <div class="rounded-2xl bg-white p-5 ring-1 ring-tola-cream-dark/60">
        <h2 class="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-tola-gray">
          <ListOrdered :size="16" class="text-tola-orange" /> Par statut
        </h2>
        <div v-if="orders.orders.length === 0" class="flex items-center justify-center py-10 text-sm text-tola-gray">Aucune donnée</div>
        <div v-else class="space-y-3">
          <div v-for="s in byStatus" :key="s.key" class="flex items-center gap-3">
            <span class="w-24 shrink-0 text-xs font-semibold text-tola-gray">{{ s.label }}</span>
            <div class="h-2.5 flex-1 overflow-hidden rounded-full bg-tola-cream">
              <div class="h-full rounded-full bg-tola-orange transition-all" :style="{ width: s.pct + '%' }"></div>
            </div>
            <span class="w-8 shrink-0 text-right text-xs font-bold text-tola-ink">{{ s.value }}</span>
          </div>
        </div>
      </div>

      <!-- Répartition par type -->
      <div class="rounded-2xl bg-white p-5 ring-1 ring-tola-cream-dark/60">
        <h2 class="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-tola-gray">
          <Utensils :size="16" class="text-tola-orange" /> Par type
        </h2>
        <div v-if="orders.orders.length === 0" class="flex items-center justify-center py-10 text-sm text-tola-gray">Aucune donnée</div>
        <div v-else class="space-y-4">
          <div v-for="t in byType" :key="t.key">
            <div class="mb-1 flex items-center justify-between text-xs">
              <span class="font-semibold text-tola-gray">{{ t.label }}</span>
              <span class="font-bold text-tola-ink">{{ t.value }} ({{ t.pct }}%)</span>
            </div>
            <div class="h-3 overflow-hidden rounded-full bg-tola-cream">
              <div class="h-full rounded-full bg-tola-teal transition-all" :style="{ width: t.pct + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 7 derniers jours -->
      <div class="rounded-2xl bg-white p-5 ring-1 ring-tola-cream-dark/60">
        <h2 class="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-tola-gray">
          <TrendingUp :size="16" class="text-tola-orange" /> CA des 7 derniers jours
        </h2>
        <div v-if="orders.orders.length === 0" class="flex items-center justify-center py-10 text-sm text-tola-gray">Aucune donnée</div>
        <div v-else class="flex h-40 items-end gap-2">
          <div v-for="d in last7Days" :key="d.label" class="flex flex-1 flex-col items-center gap-1">
            <span class="text-[10px] font-bold text-tola-ink">{{ d.count }}</span>
            <div class="w-full rounded-t-lg bg-tola-orange/80 transition-all" :style="{ height: Math.max(d.pct, 3) + '%' }"></div>
            <span class="text-[10px] font-semibold capitalize text-tola-gray">{{ d.label }}</span>
          </div>
        </div>
      </div>

      <!-- Top produits -->
      <div class="rounded-2xl bg-white p-5 ring-1 ring-tola-cream-dark/60">
        <h2 class="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-tola-gray">
          <Wallet :size="16" class="text-tola-orange" /> Top produits
        </h2>
        <div v-if="topProducts.length === 0" class="flex items-center justify-center py-10 text-sm text-tola-gray">Aucune donnée</div>
        <div v-else class="space-y-2">
          <div v-for="([name, qty], i) in topProducts" :key="name"
            class="flex items-center gap-3 rounded-lg px-2 py-1.5" :class="i === 0 ? 'bg-tola-orange/[0.06]' : ''">
            <span class="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-extrabold text-white"
              :class="i === 0 ? 'bg-tola-orange' : 'bg-tola-gray/40'">{{ i + 1 }}</span>
            <span class="flex-1 truncate text-sm font-semibold text-tola-ink">{{ name }}</span>
            <span class="text-xs font-bold text-tola-gray">{{ qty }} vendu(s)</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>