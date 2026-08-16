<script setup>
import { Search, SlidersHorizontal, X } from '@lucide/vue'

defineProps({ modelValue: { type: String, required: true } })
const emit = defineEmits(['update:modelValue', 'filter'])

function onInput(e) {
  emit('update:modelValue', (e.target).value)
}
</script>

<template>
  <div class="flex items-center gap-2">
    <div class="relative flex-1">
      <Search :size="18" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-tola-gray" />
      <input
        :value="modelValue"
        @input="onInput"
        type="search"
        placeholder="Rechercher un plat, une boisson…"
        class="w-full rounded-full bg-tola-cream py-3 pl-11 pr-10 text-sm text-tola-ink placeholder:text-tola-gray/70 focus:outline-none focus:ring-2 focus:ring-tola-orange/40"
      />
      <button
        v-if="modelValue"
        @click="emit('update:modelValue', '')"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-tola-gray hover:text-tola-ink"
        aria-label="Effacer"
      >
        <X :size="16" />
      </button>
    </div>
    <button
      @click="emit('filter')"
      class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-tola-cream text-tola-ink transition hover:bg-tola-cream-dark"
      aria-label="Filtres"
    >
      <SlidersHorizontal :size="18" />
    </button>
  </div>
</template>
