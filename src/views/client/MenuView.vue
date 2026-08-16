<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { menuState as menu } from '@/state/menu'
import { clientState as client } from '@/state/client'
import { Soup, ArrowRight, Plus, Flame, Search } from '@lucide/vue'

const route = useRoute()
const router = useRouter()

const selectedCategory = ref((route.query.cat) ?? null)
const searchQuery = ref('')

watch(() => route.query.cat, (v) => {
  selectedCategory.value = v ?? null
})

const filteredItems = computed(() => {
  let items = menu.availableItems
  if (selectedCategory.value) {
    items = items.filter((i) => i.category === selectedCategory.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    items = items.filter((i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q))
  }
  return items
})

const categories = computed(() => menu.categories)

function selectCategory(cat) {
  selectedCategory.value = cat
}

function fmtPrice(p) {
  return new Intl.NumberFormat('fr-FR').format(p) + ' FCFA'
}

function imgFallback(e) {
  const img = e.target
  img.style.display = 'none'
}

onMounted(() => {
  if (menu.items.length === 0 || menu.categories.length === 0) menu.fetchAll()
})
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-4 md:py-8">
    <!-- Hero banner -->
    <section class="relative overflow-hidden rounded-3xl bg-tola-red px-6 py-8 text-white shadow-xl md:px-12 md:py-14">
      <div class="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
      <div class="absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-tola-orange/30" />
      <div class="relative max-w-lg">
        <span class="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
          <Flame :size="14" /> Préparé à la commande
        </span>
        <h1 class="mt-4 font-display text-3xl font-extrabold leading-tight md:text-5xl">
          Notre Menu
        </h1>
        <p class="mt-3 text-sm text-white/90 md:text-base">
          Omelettes gourmandes, plats authentiques, douceurs chocolatées et jus nature.
          Des ingrédients frais, cuisinés avec générosité.
        </p>
      </div>
    </section>

    <!-- Loading -->
    <div v-if="menu.loading" class="mt-8 flex justify-center py-12">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-tola-orange border-t-transparent"></div>
    </div>

    <template v-else>
      <!-- Barre de recherche -->
      <section class="mt-6">
        <div class="relative">
          <Search :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-tola-gray" />
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Rechercher un plat..."
            class="w-full rounded-xl border border-tola-cream-dark bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-tola-orange"
          />
        </div>
      </section>

      <!-- Catégories depuis la BDD -->
      <section class="mt-6">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="font-display text-xl font-bold text-tola-ink">Catégories</h2>
        </div>
        <div class="flex flex-wrap gap-2">
          <button @click="selectCategory(null)"
            class="rounded-full px-5 py-2.5 text-xs font-bold transition"
            :class="selectedCategory === null ? 'bg-tola-orange text-white' : 'bg-tola-cream text-tola-gray hover:bg-tola-cream-dark hover:text-tola-ink'">
            <Soup :size="14" class="inline mr-1" />Tout
          </button>
          <button v-for="cat in categories" :key="cat.id" @click="selectCategory(cat.label)"
            class="rounded-full px-5 py-2.5 text-xs font-bold transition"
            :class="selectedCategory === cat.label ? 'bg-tola-orange text-white' : 'bg-tola-cream text-tola-gray hover:bg-tola-cream-dark hover:text-tola-ink'">
            {{ cat.label }}
          </button>
        </div>
      </section>

      <!-- Grille produits depuis la BDD -->
      <section class="mt-8">
        <div v-if="filteredItems.length === 0" class="py-12 text-center text-sm text-tola-gray">
          Aucun article disponible
        </div>

        <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="item in filteredItems" :key="item.id"
            class="group overflow-hidden rounded-2xl bg-white ring-1 ring-tola-cream-dark/60 transition hover:-translate-y-1 hover:shadow-lg">
            <div class="relative aspect-[4/3] overflow-hidden bg-tola-cream">
              <img v-if="item.image" :src="item.image" :alt="item.name"
                class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                @error="imgFallback" />
              <div v-else class="flex h-full items-center justify-center text-tola-gray/30 text-4xl">🍽</div>
              <span class="absolute left-2 top-2 rounded-full bg-white/85 px-2.5 py-0.5 text-[10px] font-bold text-tola-ink shadow-sm">
                {{ item.category }}
              </span>
            </div>
            <div class="p-4">
              <h3 class="font-display text-sm font-bold text-tola-ink">{{ item.name }}</h3>
              <p class="mt-1 text-xs leading-relaxed text-tola-gray">{{ item.description }}</p>
              <div class="mt-4 flex items-center justify-between">
                <span class="font-bold text-tola-orange">{{ fmtPrice(item.price) }}</span>
                <button @click="client.addToCart({ id: item.id, name: item.name, price: item.price })"
                  class="flex items-center gap-1.5 rounded-full bg-tola-orange px-4 py-2 text-xs font-bold text-white transition hover:bg-tola-orange-dark">
                  <Plus :size="14" /> Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Call to action panier -->
      <section v-if="client.cart.length > 0" class="mt-8">
        <div class="rounded-2xl bg-tola-ink px-6 py-5 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-display text-base font-bold">Votre panier</p>
              <p class="text-sm text-white/70">{{ client.cartCount }} article(s) — {{ fmtPrice(client.cartTotal) }}</p>
            </div>
            <button @click="router.push('/client/commande')"
              class="flex items-center gap-1.5 rounded-full bg-tola-orange px-5 py-2.5 text-sm font-bold text-white transition hover:bg-tola-orange-dark">
              Commander <ArrowRight :size="16" />
            </button>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
