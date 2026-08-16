<script setup>
import { Utensils } from '@lucide/vue'

defineProps({
  icon: { type: Object, default: undefined },
  title: { type: String, required: true },
  subtitle: { type: String, default: undefined },
  action: { type: String, default: '' },
})
defineEmits(['action'])
</script>

<template>
  <div class="flex flex-col items-center justify-center px-6 py-16 text-center">
    <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-tola-cream text-tola-orange">
      <component :is="icon ?? Utensils" :size="28" />
    </div>
    <h3 class="font-display text-lg font-bold text-tola-ink">{{ title }}</h3>
    <p v-if="subtitle" class="mt-1 max-w-xs text-sm text-tola-gray">{{ subtitle }}</p>
    <button
      v-if="action"
      @click="$emit('action')"
      class="mt-5 rounded-full bg-tola-orange px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-tola-orange/30 transition hover:bg-tola-orange-dark"
    >
      {{ action }}
    </button>
  </div>
</template>
