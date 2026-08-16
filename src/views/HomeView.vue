<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Truck, Leaf, Flame, Star, ArrowRight, Clock, ShieldCheck, Plus } from '@lucide/vue'
import { menuState as menu } from '@/state/menu'
import { clientState as client } from '@/state/client'
import FoodTile from '@/components/FoodTile.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import BrandLogo from '@/components/BrandLogo.vue'

const router = useRouter()

// Produits populaires (disponibles) : les 8 premiers ayant une note populaire
const popular = computed(() =>
  menu.availableItems.slice(0, 8),
)

// Catégories depuis la base de données
const categories = computed(() => menu.categories)

function goCategory(categoryLabel) {
  router.push({ name: 'client-menu', query: { cat: categoryLabel } })
}

function fmtPrice(p) {
  return new Intl.NumberFormat('fr-FR').format(p) + ' FCFA'
}

function imgFallback(e) {
  e.target.style.display = 'none'
}

onMounted(() => {
  if (menu.items.length === 0) menu.fetchAll()
})
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-4 md:py-8">
    <!-- Hero banner (red, per charte) -->
    <section class="relative overflow-hidden rounded-3xl bg-tola-red px-6 py-8 text-white shadow-xl md:px-12 md:py-14">
      <div class="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
      <div class="absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-tola-orange/30" />
      <div class="absolute right-6 top-6 hidden md:block">
        <BrandLogo :size="90" />
      </div>
      <div class="relative max-w-lg">
        <span class="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
          <Flame :size="14" /> Préparé à la commande
        </span>
        <h1 class="mt-4 font-display text-3xl font-extrabold leading-tight md:text-5xl">
          The sweetest meal,
          <span class="font-script font-bold text-tola-yellow">à votre table</span>
        </h1>
        <p class="mt-3 text-sm text-white/90 md:text-base">
          Omelettes gourmandes, plats authentiques, douceurs chocolatées et jus nature.
          Des ingrédients frais, cuisinés avec générosité.
        </p>
        <div class="mt-6 flex flex-wrap gap-3">
          <PrimaryButton variant="dark" @click="router.push({ name: 'client-menu' })">
            Découvrir le menu <ArrowRight :size="18" />
          </PrimaryButton>
          <PrimaryButton variant="secondary" @click="router.push({ name: 'client-commande' })">
            Mon panier
          </PrimaryButton>
        </div>
      </div>
    </section>

    <!-- Highlights -->
    <section class="mt-5 grid grid-cols-3 gap-3 md:mt-8 md:gap-4">
      <div class="flex flex-col items-center gap-2 rounded-2xl bg-white p-3 text-center ring-1 ring-tola-cream-dark/60 md:flex-row md:gap-3 md:p-4 md:text-left">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-tola-orange/10 text-tola-orange"><Truck :size="20" /></div>
        <div class="hidden md:block">
          <p class="text-sm font-bold text-tola-ink">Livraison</p>
          <p class="text-xs text-tola-gray">Dès 500 FCFA</p>
        </div>
        <p class="text-[11px] font-semibold text-tola-ink md:hidden">Livraison</p>
      </div>
      <div class="flex flex-col items-center gap-2 rounded-2xl bg-white p-3 text-center ring-1 ring-tola-cream-dark/60 md:flex-row md:gap-3 md:p-4 md:text-left">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-tola-teal/15 text-tola-teal"><Leaf :size="20" /></div>
        <div class="hidden md:block">
          <p class="text-sm font-bold text-tola-ink">Ingrédients frais</p>
          <p class="text-xs text-tola-gray">Au quotidien</p>
        </div>
        <p class="text-[11px] font-semibold text-tola-ink md:hidden">Frais</p>
      </div>
      <div class="flex flex-col items-center gap-2 rounded-2xl bg-white p-3 text-center ring-1 ring-tola-cream-dark/60 md:flex-row md:gap-3 md:p-4 md:text-left">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-tola-yellow/20 text-tola-orange-dark"><Clock :size="20" /></div>
        <div class="hidden md:block">
          <p class="text-sm font-bold text-tola-ink">Préparation</p>
          <p class="text-xs text-tola-gray">À la commande</p>
        </div>
        <p class="text-[11px] font-semibold text-tola-ink md:hidden"> minute</p>
      </div>
    </section>

    <!-- État de chargement -->
    <div v-if="menu.loading" class="mt-8 flex justify-center py-12">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-tola-orange border-t-transparent"></div>
    </div>

    <template v-else>
      <!-- Categories quick access depuis la BDD -->
      <section v-if="categories.length > 0" class="mt-8 md:mt-12">
        <div class="mb-4 flex items-end justify-between">
          <h2 class="font-display text-xl font-bold text-tola-ink md:text-2xl">Nos catégories</h2>
          <button @click="router.push({ name: 'client-menu' })" class="flex items-center gap-1 text-sm font-semibold text-tola-orange hover:underline">
            Tout voir <ArrowRight :size="15" />
          </button>
        </div>
        <div class="grid grid-cols-3 gap-3 md:grid-cols-6 md:gap-4">
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="goCategory(cat.label)"
            class="group flex flex-col items-center gap-2 rounded-2xl bg-white p-4 ring-1 ring-tola-cream-dark/60 transition hover:-translate-y-1 hover:shadow-lg"
          >
            <FoodTile :name="cat.label" size="sm" class="h-14 w-14 md:h-16 md:w-16" />
            <span class="text-center text-xs font-semibold leading-tight text-tola-ink md:text-sm">{{ cat.label }}</span>
          </button>
        </div>
      </section>

      <!-- Incontournables depuis la BDD -->
      <section v-if="popular.length > 0" class="mt-8 md:mt-12">
        <div class="mb-4 flex items-end justify-between">
          <div>
            <h2 class="font-display text-xl font-bold text-tola-ink md:text-2xl">Incontournables du moment</h2>
            <p class="mt-0.5 text-sm text-tola-gray">Les plats favoris de nos clients</p>
          </div>
          <button @click="router.push({ name: 'client-menu' })" class="flex items-center gap-1 text-sm font-semibold text-tola-orange hover:underline">
            Tout le menu <ArrowRight :size="15" />
          </button>
        </div>
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="p in popular" :key="p.id"
            class="group overflow-hidden rounded-2xl bg-white ring-1 ring-tola-cream-dark/60 transition hover:-translate-y-1 hover:shadow-lg">
            <div class="relative aspect-[4/3] overflow-hidden bg-tola-cream">
              <img v-if="p.image" :src="p.image" :alt="p.name"
                class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                @error="imgFallback" />
              <div v-else class="flex h-full items-center justify-center text-4xl text-tola-gray/30">🍽</div>
              <span class="absolute left-2 top-2 rounded-full bg-white/85 px-2.5 py-0.5 text-[10px] font-bold text-tola-ink shadow-sm">
                {{ p.category }}
              </span>
            </div>
            <div class="p-4">
              <h3 class="font-display text-sm font-bold text-tola-ink">{{ p.name }}</h3>
              <p class="mt-1 text-xs leading-relaxed text-tola-gray">{{ p.description }}</p>
              <div class="mt-4 flex items-center justify-between">
                <span class="font-bold text-tola-orange">{{ fmtPrice(p.price) }}</span>
                <button @click="client.addToCart({ id: p.id, name: p.name, price: p.price })"
                  class="flex items-center gap-1.5 rounded-full bg-tola-orange px-4 py-2 text-xs font-bold text-white transition hover:bg-tola-orange-dark">
                  <Plus :size="14" /> Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      
    </template>

    <!-- Trust banner -->
    <section class="mt-8 overflow-hidden rounded-3xl bg-tola-ink px-6 py-8 text-white md:mt-12 md:px-12 md:py-10">
      <div class="grid gap-6 md:grid-cols-3">
        <div class="flex items-start gap-3">
          <ShieldCheck :size="28" class="shrink-0 text-tola-teal" />
          <div>
            <h3 class="font-display text-base font-bold">Qualité garantie</h3>
            <p class="mt-1 text-sm text-white/70">Des produits frais sélectionnés chaque jour, cuisinés avec soin.</p>
          </div>
        </div>
        <div class="flex items-start gap-3">
          <Star :size="28" class="shrink-0 fill-tola-yellow text-tola-yellow" />
          <div>
            <h3 class="font-display text-base font-bold">Plats appréciés</h3>
            <p class="mt-1 text-sm text-white/70">Des recettes authentiques qui font revenir nos clients.</p>
          </div>
        </div>
        <div class="flex items-start gap-3">
          <Flame :size="28" class="shrink-0 text-tola-orange" />
          <div>
            <h3 class="font-display text-base font-bold">Cuisine généreuse</h3>
            <p class="mt-1 text-sm text-white/70">Des portions copieuses, préparées à la commande.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
