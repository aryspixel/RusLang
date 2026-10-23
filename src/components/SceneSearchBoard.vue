<script setup>
import TouchButton from './TouchButton.vue'
defineProps({
  image: { type: String, required: true },
  description: { type: String, required: true },
  items: { type: Array, required: true },
  completed: { type: Array, default: () => [] },
})
const emit = defineEmits(['select'])
</script>

<template>
  <div class="game-layout">
    <div class="search-scene">
      <img :src="image" :alt="description">
      <button v-for="item in items" :key="item.id" type="button"
        class="search-scene__marker" :class="{ 'search-scene__marker--done': completed.includes(item.id) }"
        :style="item.position" :disabled="completed.includes(item.id)"
        :aria-label="`${item.label}${completed.includes(item.id) ? ' — разобрано' : ''}`"
        @click="emit('select', item.id)">
        <span v-if="completed.includes(item.id)" aria-hidden="true">✓</span>
      </button>
    </div>
    <details class="game-help">
      <summary>Список предметов</summary>
      <div class="search-items" role="group" aria-label="Предметы на рисунке">
        <TouchButton v-for="item in items" :key="item.id" variant="secondary"
          :disabled="completed.includes(item.id)" @click="emit('select', item.id)">
          {{ item.label }}{{ completed.includes(item.id) ? ' · ✓ Разобрано' : '' }}
        </TouchButton>
      </div>
    </details>
  </div>
</template>

<style scoped>
.search-scene { position: relative; }
.search-scene img { display: block; width: 100%; height: auto; border-radius: var(--radius-card); }
.search-scene__marker { position: absolute; border: 3px solid transparent; border-radius: var(--radius-control); background: transparent; padding: 0; color: var(--color-text); }
.search-scene__marker span { position: absolute; left: 0; top: 0; display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--color-primary); background: var(--color-surface); font-size: 18px; font-weight: 800; }
.search-scene__marker--done { border-color: var(--color-success); opacity: 1; }
.search-scene__marker--done span { color: var(--color-success); background: var(--color-success-bg); border-color: var(--color-success); }
.search-items { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-2); }
.search-items :deep(button) { min-height: 64px; min-width: 0; text-align: left; overflow-wrap: anywhere; }
@media (min-width: 1100px) { .search-scene__marker { min-width: 48px; min-height: 48px; } }
@media (max-width: 600px) { .search-items { grid-template-columns: 1fr; } .search-scene__marker span { width: 22px; height: 22px; font-size: 14px; } }
</style>
