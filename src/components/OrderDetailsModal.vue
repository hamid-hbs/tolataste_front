<script setup>
import { ref, watch } from 'vue'
import { ordersService } from '@/api/orders'
import { STATUS_LABELS, PAYMENT_LABELS } from '@/state/orders'
import {
  X, Loader2, User, Utensils, ClipboardList, Wallet, MapPin, StickyNote, Calendar, BadgeCheck,
} from '@lucide/vue'

const props = defineProps({
  orderId: { type: [Number, String], required: true },
})
const emit = defineEmits(['close'])

const loading = ref(true)
const order = ref(null)

const statusStyle = {
  pending: 'bg-yellow-100 text-yellow-800',
  waiting: 'bg-orange-100 text-orange-800',
  preparing: 'bg-blue-100 text-blue-800',
  ready: 'bg-green-100 text-green-800',
  served: 'bg-teal-100 text-teal-800',
  cancelled: 'bg-red-100 text-red-800',
}

function normalize(raw) {
  const o = raw ?? {}
  return {
    ...o,
    id: Number(o.id),
    createdAt: o.created_at ?? o.createdAt,
    type: o.type ?? 'takeaway',
    items: (o.items ?? []).map((i) => ({
      ...i,
      menuItemId: i.menuItemId ?? i.product_id,
      total: Number(i.total ?? (i.price ?? 0) * (i.qty ?? 1)),
    })),
  }
}

async function load() {
  loading.value = true
  try {
    const raw = await ordersService.getOne(props.orderId)
    order.value = normalize(raw)
  } catch {
    order.value = null
  } finally {
    loading.value = false
  }
}

watch(() => props.orderId, () => { if (props.orderId) load() }, { immediate: true })

function fmtPrice(p) {
  return new Intl.NumberFormat('fr-FR').format(Number(p) || 0) + ' FCFA'
}

function formatDate(ts) {
  try {
    return new Date(ts).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })
  } catch {
    return ''
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm" @click.self="emit('close')">
      <div class="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div class="flex items-center justify-between border-b border-tola-cream-dark px-5 py-4">
          <div class="flex items-center gap-3">
            <h3 class="text-lg font-extrabold text-tola-ink">Commande #{{ order?.id ?? props.orderId }}</h3>
            <span v-if="order" class="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
              :class="statusStyle[order.status] ?? 'bg-tola-cream text-tola-gray'">
              {{ STATUS_LABELS[order.status] ?? order.status }}
            </span>
          </div>
          <button @click="emit('close')" class="rounded-full p-1 text-tola-gray transition hover:bg-tola-cream-dark/50">
            <X :size="20" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-5 py-4">
          <div v-if="loading" class="flex justify-center py-12">
            <Loader2 :size="26" class="animate-spin text-tola-orange" />
          </div>

          <div v-else-if="!order" class="py-10 text-center text-sm text-tola-gray">Commande introuvable.</div>

          <template v-else>
            <!-- Infos -->
            <div class="grid grid-cols-2 gap-2">
              <div class="rounded-xl bg-tola-cream p-3">
                <p class="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-tola-gray"><ClipboardList :size="12" /> Type</p>
                <p class="mt-1 text-sm font-bold text-tola-ink">{{ order.type === 'dine_in' ? 'Sur place' : 'À emporter' }}</p>
              </div>
              <div class="rounded-xl bg-tola-cream p-3">
                <p class="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-tola-gray"><Calendar :size="12" /> Passée le</p>
                <p class="mt-1 text-xs font-bold text-tola-ink">{{ formatDate(order.createdAt) }}</p>
              </div>
              <div class="rounded-xl bg-tola-cream p-3">
                <p class="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-tola-gray"><MapPin :size="12" /> Table</p>
                <p class="mt-1 text-sm font-bold text-tola-ink">{{ order.table?.number ? `Table ${order.table.number}` : (order.tableId ? `Table ${order.tableId}` : '—') }}</p>
              </div>
              <div class="rounded-xl bg-tola-cream p-3">
                <p class="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-tola-gray"><User :size="12" /> Serveur</p>
                <p class="mt-1 text-sm font-bold text-tola-ink">{{ order.server?.name ?? '—' }}</p>
              </div>
            </div>

            <div v-if="order.client" class="mt-2 rounded-xl bg-tola-cream p-3">
              <p class="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-tola-gray"><BadgeCheck :size="12" /> Client</p>
              <p class="mt-1 text-sm font-bold text-tola-ink">{{ order.client.name }}</p>
            </div>

            <p v-if="order.note" class="mt-2 rounded-xl bg-tola-yellow/[0.08] p-3 text-sm text-tola-ink">
              <span class="font-bold">Note :</span> {{ order.note }}
            </p>

            <!-- Articles -->
            <h4 class="mb-2 mt-5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-tola-gray">
              <Utensils :size="14" /> Articles
            </h4>
            <div class="space-y-1.5">
              <div v-for="item in order.items" :key="item.menuItemId"
                class="flex items-center justify-between rounded-lg border border-tola-cream-dark px-3 py-2 text-sm">
                <span class="text-tola-gray"><span class="font-bold text-tola-ink">{{ item.qty }}×</span> {{ item.name }}</span>
                <span class="font-bold text-tola-ink">{{ fmtPrice(item.total) }}</span>
              </div>
            </div>

            <!-- Total -->
            <div class="mt-4 space-y-1 rounded-xl border border-tola-cream-dark p-3 text-sm">
              <div class="flex justify-between text-tola-gray">
                <span>Sous-total</span>
                <span>{{ fmtPrice(order.subtotal ?? order.total) }}</span>
              </div>
              <div v-if="order.discount > 0" class="flex justify-between text-tola-red">
                <span>Réduction</span>
                <span>-{{ fmtPrice(order.discount) }}</span>
              </div>
              <div v-if="order.tax > 0" class="flex justify-between text-tola-gray">
                <span>TVA ({{ order.taxRate }}%)</span>
                <span>{{ fmtPrice(order.tax) }}</span>
              </div>
              <div class="flex justify-between border-t border-tola-cream-dark pt-1.5 font-extrabold text-tola-ink">
                <span>Total</span>
                <span>{{ fmtPrice(order.total) }}</span>
              </div>
            </div>

            <!-- Paiement -->
            <div v-if="order.paid" class="mt-4 flex items-center justify-between rounded-xl bg-tola-teal/[0.08] p-3">
              <p class="flex items-center gap-1.5 text-sm font-bold text-tola-teal">
                <Wallet :size="15" /> Payée — {{ PAYMENT_LABELS[order.payment?.method] ?? '—' }}
              </p>
              <span class="text-sm font-extrabold text-tola-ink">{{ fmtPrice(order.payment?.amount ?? order.total) }}</span>
            </div>
            <div v-else class="mt-4 flex items-center justify-between rounded-xl bg-tola-red/[0.06] p-3">
              <p class="flex items-center gap-1.5 text-sm font-bold text-tola-red"><Wallet :size="15" /> Non payée</p>
            </div>
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>