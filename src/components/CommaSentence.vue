<script setup>
defineProps({
  chunks: { type: Array, required: true },
  selectable: { type: Boolean, default: false },
  selected: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['toggle'])
</script>

<template>
  <p class="comma-sentence">
    <template v-for="(chunk, index) in chunks" :key="index">
      <span>{{ chunk }}</span>
      <template v-if="index < chunks.length - 1">
        <button v-if="selectable" type="button" class="filter-chip comma-sentence__spot"
          :aria-label="`Место ${index + 1}: ${selected.includes(index + 1) ? 'убрать' : 'поставить'} запятую`"
          :aria-pressed="selected.includes(index + 1)" :disabled="disabled"
          :class="{ 'filter-chip--active': selected.includes(index + 1) }" @click="emit('toggle', index + 1)">
          {{ selected.includes(index + 1) ? ', ' : '' }}({{ index + 1 }})
        </button>
        <span v-else class="comma-sentence__number"> ({{ index + 1 }}) </span>
      </template>
    </template>
  </p>
</template>

<style scoped>
.comma-sentence { font-size: 1.15em; line-height: 2.5; overflow-wrap: anywhere; }
.comma-sentence__spot { min-width: 64px; min-height: 48px; margin: 4px 10px; padding: 4px 10px; vertical-align: middle; }
.comma-sentence__number { color: var(--color-primary-dark); font-weight: 850; white-space: nowrap; padding: 2px 5px; border-radius: 5px; background: var(--color-selected); }
</style>
