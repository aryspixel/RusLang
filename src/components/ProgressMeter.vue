<script setup>
import { computed } from 'vue'

const props = defineProps({
  current: { type: Number, required: true },
  total: { type: Number, required: true },
  label: { type: String, default: 'Задание' },
})
const percent = computed(() => props.total > 0 ? Math.min(100, Math.max(0, props.current / props.total * 100)) : 0)
</script>

<template>
  <div class="progress-meter">
    <div class="progress-meter__label">{{ label }} {{ current }} из {{ total }}</div>
    <div class="progress-meter__track" role="progressbar" :aria-label="label" :aria-valuenow="current" aria-valuemin="0" :aria-valuemax="total">
      <div class="progress-meter__fill" :style="{ width: `${percent}%` }" />
    </div>
  </div>
</template>
