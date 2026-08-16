<script setup>
import { computed } from 'vue'
import { Plus, Check } from '@lucide/vue'
import { cartState as cart } from '@/state/cart'

const props = defineProps({
  productId: { type: Number, required: true },
  size: { type: String, default: 'md' },
})

const inCart = computed(() => cart.qtyOf(props.productId))

const dims = computed(() =>
  props.size === 'lg' ? 'h-12 w-12' : props.size === 'sm' ? 'h-8 w-8' : 'h-10 w-10',
)
const iconSize = computed(() => (props.size === 'lg' ? 22 : props.size === 'sm' ? 16 : 18))
</script>

<template>
  <button
    @click.stop.prevent="cart.increment(productId)"
    :class="[dims, inCart ? 'bg-tola-teal' : 'bg-tola-ink']"
    class="flex shrink-0 items-center justify-center rounded-full text-white shadow-lg transition-all duration-200 hover:scale-110 active:scale-95"
    :aria-label="inCart ? `Ajouté, ${inCart} dans le panier` : 'Ajouter au panier'"
  >
    <template v-if="inCart">
      <Check :size="iconSize" />
    </template>
    <template v-else>
      <Plus :size="iconSize" />
    </template>
  </button>
</template>
