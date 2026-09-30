<script setup>
defineProps({
  kind: { type: String, default: 'info' },
  title: { type: String, required: true },
})
</script>

<template>
  <div class="feedback-message" :class="`feedback-message--${kind}`" role="status" aria-live="polite">
    <strong>{{ title }}</strong>
    <div v-if="$slots.default"><slot /></div>
  </div>
</template>
