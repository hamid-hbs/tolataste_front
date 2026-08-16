<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  title: { type: String, required: true },
  type: { type: String, default: 'bar' },
  labels: { type: Array, default: () => [] },
  datasets: { type: Array, default: () => [] },
  legend: { type: Boolean, default: false },
  horizontal: { type: Boolean, default: false },
})

const canvas = ref(null)
let chart = null

function render() {
  if (!canvas.value) return
  const data = { labels: props.labels, datasets: props.datasets }
  if (!chart) {
    chart = new Chart(canvas.value, {
      type: props.type,
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: props.horizontal ? 'y' : 'x',
        plugins: { legend: { display: props.legend, labels: { boxWidth: 12, font: { size: 11 } } } },
        scales: {
          x: { ticks: { font: { size: 10 } }, grid: { display: false } },
          y: { ticks: { font: { size: 10 } }, grid: { display: false } },
        },
      },
    })
  } else {
    chart.data = data
    chart.update()
  }
}

onMounted(render)
watch(() => [props.labels, props.datasets], render, { deep: true })
onBeforeUnmount(() => {
  if (chart) {
    chart.destroy()
    chart = null
  }
})
</script>

<template>
  <div class="rounded-2xl bg-white p-5 ring-1 ring-tola-cream-dark/60">
    <h2 class="mb-4 text-sm font-bold uppercase tracking-wider text-tola-gray">{{ title }}</h2>
    <div v-if="labels.length === 0" class="flex items-center justify-center py-10 text-sm text-tola-gray">Aucune donnée</div>
    <div v-else class="relative h-56">
      <canvas ref="canvas"></canvas>
    </div>
  </div>
</template>