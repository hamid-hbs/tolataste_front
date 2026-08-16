<script setup>
import { clientState as client } from '@/state/client'
import { ShoppingCart } from '@lucide/vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="fixed bottom-6 right-6 z-50">
      <router-link v-if="client.cartCount > 0" to="/client/commande"
        class="flex items-center gap-2 rounded-full bg-tola-orange px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-tola-orange-dark">
        <ShoppingCart :size="18" />
        {{ client.cartCount }} article(s)
      </router-link>
    </div>
    <main class="mx-auto max-w-6xl px-4 py-6">
      <router-view />
    </main>
  </div>
</template>
