<script setup>
defineProps({ size: { type: Number, default: 36 } })
</script>

<template>
  <img :width="size" :height="size" src="/TolaTaste.jpeg" alt="Tola Taste"
    class="rounded-full object-cover" />
</template>