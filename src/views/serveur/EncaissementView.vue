<script setup>
import { ref, computed } from 'vue'
import { ordersState as orders, PAYMENT_LABELS } from '@/state/orders'
import { tablesState as tables } from '@/state/tables'
import { notificationsState as notif } from '@/state/notifications'
import OrderDetailsModal from '@/components/OrderDetailsModal.vue'
import { Hand, Smartphone, X, DollarSign, Printer, Eye } from '@lucide/vue'

const paymentModal = ref(null)
const selectedMethod = ref('cash')
const amountReceived = ref(0)
const detailOrderId = ref(null)

const unpaidOrders = computed(() => orders.unpaidServed)

const change = computed(() => Math.max(0, amountReceived.value - (paymentModal.value?.total ?? 0)))

function openPayment(orderId) {
  const order = orders.getOrder(orderId)
  if (!order) return
  paymentModal.value = { orderId, total: order.total }
  selectedMethod.value = 'cash'
  amountReceived.value = 0
}

async function processPay() {
  if (!paymentModal.value) return
  const orderId = paymentModal.value.orderId
  const method = selectedMethod.value
  const amountPaid = amountReceived.value || paymentModal.value.total

  try {
    await orders.processPayment(orderId, { method, amountPaid })

    const order = orders.getOrder(orderId)
    if (order?.tableId) {
      tables.updateStatus(order.tableId, 'free', null)
    }

    notif.add({ type: 'success', title: 'Paiement effectué', message: `Commande #${orderId} — ${PAYMENT_LABELS[method]}` })
    printReceipt(orderId)
  } catch (e) {
    notif.add({ type: 'danger', title: 'Paiement refusé', message: e?.message ?? 'Réessayez.' })
  }

  paymentModal.value = null
}

function printReceipt(orderId) {
  const order = orders.getOrder(orderId)
  if (!order) return

  const table = order.tableId ? tables.getTable(order.tableId) : null
  const lines = []
  lines.push('')
  lines.push('  TOLA TASTE')
  lines.push('  ' + new Date().toLocaleDateString('fr-FR', { dateStyle: 'full' }))
  lines.push('  ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))
  lines.push('  ' + ('-'.repeat(30)))
  if (table) lines.push(`  Table: ${table.number} (${table.zone})`)
  lines.push(`  Type: ${order.type === 'dine-in' ? 'Sur place' : 'À emporter'}`)
  lines.push('  Commande #' + order.id)
  lines.push('  ' + ('-'.repeat(30)))
  order.items.forEach((item) => {
    lines.push(`  ${item.qty}x ${item.name.padEnd(14)} ${fmtPriceShort(item.total).padStart(8)}`)
  })
  lines.push('  ' + ('-'.repeat(30)))
  lines.push(`  Sous-total:         ${fmtPriceShort(order.subtotal).padStart(8)}`)
  if (order.discount > 0) {
    lines.push(`  Réduction:         -${fmtPriceShort(order.discount).padStart(7)}`)
  }
  if (order.tax > 0) {
    lines.push(`  TVA (${order.taxRate}%):        ${fmtPriceShort(order.tax).padStart(8)}`)
  }
  lines.push(`  TOTAL:              ${fmtPriceShort(order.total).padStart(8)}`)
  lines.push(`  Paiement: ${PAYMENT_LABELS[order.paymentMethod]}`)
  if (order.totalPaid > order.total) {
    lines.push(`  Monnaie:            ${fmtPriceShort(order.change).padStart(8)}`)
  }
  lines.push('  ' + ('-'.repeat(30)))
  lines.push('  Merci de votre visite !')
  lines.push('  À bientôt chez Tola Taste')
  lines.push('')

  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    notif.add({ type: 'warning', title: 'Impression bloquée', message: 'Autorisez les pop-ups pour imprimer' })
    return
  }
  printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Facture #${order.id}</title>
<style>
  @page { margin: 0; size: 80mm auto; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Courier New', monospace; font-size: 13px; color: #000; padding: 10px; }
  pre { white-space: pre; font-family: 'Courier New', monospace; font-size: 13px; }
</style></head><body><pre>${lines.join('\n')}</pre><script>window.print();window.close();<\/script></body></html>`)
  printWindow.document.close()
}

function fmtPrice(p) {
  return new Intl.NumberFormat('fr-FR').format(p) + ' FCFA'
}

function fmtPriceShort(p) {
  return new Intl.NumberFormat('fr-FR').format(p) + ' FCFA'
}

const paymentMethods = [
  { key: 'cash', label: 'Espèces', icon: Hand },
  { key: 'mobile_money', label: 'Mobile Money', icon: Smartphone },
]
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="font-display text-xl font-extrabold text-tola-ink">Encaissement</h1>
        <p class="text-sm text-tola-gray">Commandes servies en attente de paiement</p>
      </div>
      <div class="text-right text-xs text-tola-gray">
        <p>{{ new Date().toLocaleDateString('fr-FR', { dateStyle: 'long' }) }}</p>
      </div>
    </div>

    <div v-if="unpaidOrders.length === 0" class="flex flex-col items-center justify-center py-16 text-tola-gray">
      <DollarSign :size="48" class="mb-3 text-tola-cream-dark" />
      <p class="text-sm font-medium">Aucune commande à encaisser</p>
    </div>

    <div v-else class="space-y-4">
      <div v-for="order in unpaidOrders" :key="order.id"
        class="rounded-2xl bg-white p-5 ring-1 ring-tola-cream-dark/60">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-lg font-extrabold text-tola-ink">#{{ order.id }}</span>
              <span v-if="order.tableId" class="rounded-full bg-tola-cream px-2.5 py-0.5 text-[10px] font-bold text-tola-gray">
                Table {{ tables.getTable(order.tableId)?.number || order.tableId }} · {{ tables.getTable(order.tableId)?.zone }}
              </span>
              <span class="text-xs text-tola-gray">{{ order.type === 'dine-in' ? 'Sur place' : 'À emporter' }}</span>
            </div>
            <p class="mt-1 text-xs text-tola-gray">Serveur: {{ order.serverName }}</p>
            <div class="mt-3 space-y-1">
              <div v-for="item in order.items" :key="item.menuItemId" class="flex items-center justify-between text-sm">
                <span class="text-tola-gray"><span class="font-bold text-tola-ink">{{ item.qty }}×</span> {{ item.name }}</span>
                <span class="text-tola-gray">{{ fmtPrice(item.total) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 border-t border-tola-cream-dark pt-3">
          <div class="space-y-1 text-sm">
            <div class="flex justify-between text-tola-gray">
              <span>Sous-total</span>
              <span>{{ fmtPrice(order.subtotal) }}</span>
            </div>
            <div v-if="order.discount > 0" class="flex justify-between text-tola-red">
              <span>Réduction</span>
              <span>-{{ fmtPrice(order.discount) }}</span>
            </div>
            <div v-if="order.tax > 0" class="flex justify-between text-tola-gray">
              <span>TVA ({{ order.taxRate }}%)</span>
              <span>{{ fmtPrice(order.tax) }}</span>
            </div>
            <div class="flex justify-between border-t border-tola-cream-dark pt-1 font-extrabold text-tola-ink">
              <span>Total</span>
              <span>{{ fmtPrice(order.total) }}</span>
            </div>
          </div>
        </div>

        <div class="mt-4 flex items-center gap-3">
          <div class="flex-1">
            <label class="text-xs font-bold text-tola-gray">Réduction (FCFA)</label>
            <input type="number" min="0" :value="order.discount"
              @input="orders.applyDiscount(order.id, Number(($event.target).value))"
              class="mt-1 w-full rounded-lg border border-tola-cream-dark px-3 py-1.5 text-sm outline-none focus:border-tola-orange" />
          </div>
          <button @click="openPayment(order.id)"
            class="flex items-center gap-1.5 rounded-full bg-tola-orange px-5 py-2.5 text-xs font-bold text-white transition hover:bg-tola-orange-dark">
            <DollarSign :size="14" /> Paiement
          </button>
          <button @click="detailOrderId = order.id"
            class="flex items-center gap-1.5 rounded-full border border-tola-cream-dark px-4 py-2.5 text-xs font-bold text-tola-gray transition hover:bg-tola-cream">
            <Eye :size="14" /> Détails
          </button>
        </div>
      </div>
    </div>

    <OrderDetailsModal v-if="detailOrderId" :order-id="detailOrderId" @close="detailOrderId = null" />

    <Teleport to="body">
      <div v-if="paymentModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm" @click.self="paymentModal = null">
        <div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
          <div class="mb-1 flex items-center justify-between">
            <h3 class="text-lg font-bold text-tola-ink">Paiement #{{ paymentModal.orderId }}</h3>
            <button @click="paymentModal = null" class="rounded-full p-1 text-tola-gray hover:bg-tola-cream-dark/50"><X :size="20" /></button>
          </div>

          <div class="mb-4 rounded-xl bg-tola-cream p-4 text-center">
            <p class="text-xs font-medium uppercase tracking-wider text-tola-gray">Total à encaisser</p>
            <p class="text-3xl font-extrabold text-tola-ink">{{ fmtPrice(paymentModal.total) }}</p>
          </div>

          <div class="mb-4 flex gap-2">
            <button v-for="pm in paymentMethods" :key="pm.key" @click="selectedMethod = pm.key"
              class="flex flex-1 flex-col items-center gap-1 rounded-xl border-2 p-3 transition"
              :class="selectedMethod === pm.key ? 'border-tola-orange bg-tola-orange/[0.06]' : 'border-tola-cream-dark hover:border-tola-orange/30'">
              <component :is="pm.icon" :size="20" :class="selectedMethod === pm.key ? 'text-tola-orange' : 'text-tola-gray'" />
              <span class="text-[10px] font-bold" :class="selectedMethod === pm.key ? 'text-tola-orange' : 'text-tola-gray'">{{ pm.label }}</span>
            </button>
          </div>

          <div class="mb-4">
            <label class="text-xs font-bold text-tola-gray">Montant reçu (FCFA)</label>
            <input v-model.number="amountReceived" type="number" min="0"
              class="mt-1 w-full rounded-xl border border-tola-cream-dark bg-tola-cream px-4 py-2.5 text-lg font-bold outline-none focus:border-tola-orange" />
            <p v-if="change > 0" class="mt-2 text-sm font-bold text-tola-teal">Monnaie: {{ fmtPrice(change) }}</p>
          </div>

          <button @click="processPay"
            class="flex w-full items-center justify-center gap-2 rounded-xl bg-tola-orange py-3 text-sm font-bold text-white transition hover:bg-tola-orange-dark">
            <Printer :size="16" /> Payer et imprimer
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
