<script setup>
import { Star } from '@lucide/vue'
defineProps({ rating: { type: Number, required: true }, size: { type: String, default: 'md' } })
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-full bg-tola-yellow font-semibold text-tola-ink"
    :class="{
      'px-1.5 py-0.5 text-[10px]': size === 'sm',
      'px-2 py-0.5 text-xs': size === 'md',
    }"
  >
    <Star :size="size === 'sm' ? 10 : 12" class="fill-tola-ink" />
    {{ rating.toFixed(1) }}
  </span>
</template>
