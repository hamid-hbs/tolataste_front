<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ordersState } from '@/state/orders'
import { tablesState } from '@/state/tables'
import { CheckCircle, Home, ShoppingBag } from '@lucide/vue'

const props = defineProps({ id: { type: String, required: true } })

const orders = ordersState
const tables = tablesState
const router = useRouter()

const order = computed(() => orders.getOrder(Number(props.id)))
const table = computed(() => (order.value?.tableId ? tables.getTable(order.value.tableId) : null))

function fmtPrice(p) {
  return new Intl.NumberFormat('fr-FR').format(p) + ' FCFA'
}
</script>

<template>
  <div v-if="order" class="text-center">
    <div class="mb-6 flex justify-center">
      <div class="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle :size="40" class="text-emerald-600" />
      </div>
    </div>

    <h1 class="text-xl font-extrabold text-gray-900">Commande confirmée !</h1>
    <p class="mt-2 text-sm text-gray-500">Votre commande a été envoyée en cuisine.</p>

    <div class="my-6 rounded-2xl bg-white p-6 text-left ring-1 ring-gray-100">
      <div class="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
        <span class="text-xs font-bold uppercase tracking-wider text-gray-500">Référence</span>
        <span class="font-bold text-gray-900">#{{ order.id }}</span>
      </div>
      <div v-if="table" class="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
        <span class="text-xs font-bold uppercase tracking-wider text-gray-500">Table</span>
        <span class="font-bold text-gray-900">{{ table.number }}</span>
      </div>
      <div class="mb-4 border-b border-gray-100 pb-4">
        <p class="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Articles</p>
        <div v-for="item in order.items" :key="item.menuItemId" class="flex items-center justify-between py-1 text-sm">
          <span class="text-gray-600"><span class="font-bold text-gray-900">{{ item.qty }}x</span> {{ item.name }}</span>
          <span class="font-bold text-gray-900">{{ fmtPrice(item.total) }}</span>
        </div>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm font-bold text-gray-900">Total</span>
        <span class="text-lg font-extrabold text-orange-600">{{ fmtPrice(order.total) }}</span>
      </div>
    </div>

    <div class="flex flex-col gap-3">
      <button @click="router.push('/client/menu')"
        class="flex items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-bold text-white transition hover:bg-orange-600">
        <ShoppingBag :size="16" /> Nouvelle commande
      </button>
      <button @click="router.push('/')"
        class="flex items-center justify-center gap-2 rounded-xl bg-gray-100 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-200">
        <Home :size="16" /> Retour à l'accueil
      </button>
    </div>
  </div>

  <div v-else class="py-12 text-center text-sm text-gray-400">Commande introuvable</div>
</template>

<style scoped>
</style>
