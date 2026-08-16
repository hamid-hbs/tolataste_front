<script setup>
import { computed } from 'vue'
import {
  Egg, Coffee, Leaf, UtensilsCrossed, Cookie, Citrus, Soup,
} from '@lucide/vue'

const props = defineProps({
  name: { type: String, required: true },
  category: { type: String, default: undefined },
  size: { type: String, default: undefined },
})

// Mapping dynamique basé sur le label (insensible à la casse)
function getIconAndStyle(label) {
  const l = label.toLowerCase()
  if (l.includes('omelet') || l.includes('oeuf')) return { icon: Egg, bg: 'bg-amber-100', accent: 'text-tola-orange' }
  if (l.includes('chocolat')) return { icon: Coffee, bg: 'bg-orange-200', accent: 'text-tola-orange-dark' }
  if (l.includes('thé') || l.includes('infusion') || l.includes('the')) return { icon: Leaf, bg: 'bg-teal-100', accent: 'text-tola-teal' }
  if (l.includes('jus')) return { icon: Citrus, bg: 'bg-orange-100', accent: 'text-tola-red' }
  if (l.includes('accomp') || l.includes('frite') || l.includes('aloco')) return { icon: Cookie, bg: 'bg-yellow-100', accent: 'text-tola-yellow' }
  if (l.includes('plat') || l.includes('poulet') || l.includes('poisson') || l.includes('sauce')) return { icon: UtensilsCrossed, bg: 'bg-rose-100', accent: 'text-tola-red' }
  return { icon: Soup, bg: 'bg-tola-cream', accent: 'text-tola-gray' }
}

const style = computed(() => getIconAndStyle(props.category ?? props.name))

const sizeClasses = computed(() => {
  if (props.size === 'sm') return 'rounded-2xl'
  if (props.size === 'lg') return 'rounded-3xl'
  return 'rounded-2xl'
})
</script>

<template>
  <div
    class="relative flex items-center justify-center overflow-hidden"
    :class="[style.bg, sizeClasses]"
  >
    <div class="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/25" />
    <div class="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/15" />
    <component :is="style.icon" :class="style.accent" class="relative h-1/2 w-1/2 drop-shadow-sm" :stroke-width="1.4" />
    <span class="absolute bottom-2 left-2 max-w-[80%] truncate rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-tola-ink backdrop-blur-sm">
      {{ name }}
    </span>
  </div>
</template>
