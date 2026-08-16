<script setup>
defineProps({
  variant: { type: String, default: 'primary' },
  block: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})
</script>

<template>
  <button
    :disabled="disabled"
    class="inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
    :class="[
      block ? 'w-full px-5 py-3.5 text-base' : 'px-5 py-3 text-sm',
      {
        'bg-tola-orange text-white shadow-md shadow-tola-orange/30 hover:bg-tola-orange-dark': variant === 'primary',
        'bg-white text-tola-ink ring-1 ring-tola-cream-dark hover:bg-tola-cream': variant === 'secondary',
        'bg-transparent text-tola-gray hover:text-tola-ink': variant === 'ghost',
        'bg-tola-ink text-white hover:bg-black': variant === 'dark',
        'bg-transparent text-tola-orange ring-2 ring-tola-orange hover:bg-tola-orange hover:text-white': variant === 'outline',
      },
    ]"
  >
    <slot />
  </button>
</template>
