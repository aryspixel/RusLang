<script setup>
import ImageSprite from './ImageSprite.vue'
import TouchButton from './TouchButton.vue'
defineProps({
  background: { type: String, required: true },
  sheet: { type: String, required: true },
  objects: { type: Array, required: true },
  places: { type: Array, default: () => [] },
  selected: { type: String, default: null },
  disabled: Boolean,
})
defineEmits(['place'])
</script>

<template>
  <div class="room-board">
    <div class="room-board__scene" role="group" aria-label="Комната: окно слева, дверь справа. Места отмечены номерами; их подписи находятся под картинкой.">
      <img :src="background" alt="" class="room-board__background">
      <div v-for="object in objects" :key="object.id" class="room-board__object" :style="{ left: `${object.x}%`, bottom: `${100 - object.y}%`, width: `${object.width}%`, zIndex: object.layer || 1 }">
        <ImageSprite :src="sheet" :crop="object.crop" />
      </div>
      <TouchButton v-for="(place, i) in places" :key="place.id" class="room-board__marker" :class="{ 'room-board__marker--selected': selected === place.id }" :style="{ left: `${place.x}%`, top: `${Math.min(90, place.y)}%` }" :disabled="disabled" :aria-label="`${i + 1}. ${place.label}`" :aria-pressed="selected === place.id" @click="$emit('place', place.id)">{{ i + 1 }}</TouchButton>
    </div>
    <div v-if="places.length" class="action-row" role="group" aria-label="Выбери место в комнате">
      <TouchButton v-for="(place, i) in places" :key="place.id" :disabled="disabled" :variant="selected === place.id ? 'primary' : 'secondary'" :aria-pressed="selected === place.id" @click="$emit('place', place.id)">{{ i + 1 }} · {{ place.label }}</TouchButton>
    </div>
    <details v-if="objects.length" class="game-help">
      <summary>Что сейчас в комнате? ({{ objects.length }})</summary>
      <p v-for="object in objects" :key="object.id">{{ object.description }}</p>
    </details>
  </div>
</template>

<style scoped>
.room-board__scene { position: relative; isolation: isolate; aspect-ratio: 3 / 2; max-width: 900px; margin: auto; overflow: hidden; border-radius: var(--radius-control); background: var(--color-season-autumn); }
.room-board__background { display: block; width: 100%; height: 100%; object-fit: cover; }
.room-board__object { position: absolute; transform: translateX(-50%); mix-blend-mode: multiply; pointer-events: none; }
.room-board__marker { position: absolute; z-index: 20; transform: translate(-50%, -50%); display: grid; place-items: center; width: 48px; height: 48px; min-width: 48px; min-height: 48px; padding: 0; border: 3px solid var(--color-primary); border-radius: 50%; background: var(--color-surface); color: var(--color-primary-dark); font-weight: 850; font-size: 20px; }
.room-board__marker--selected { background: var(--color-primary); color: white; }
.room-board .action-row > * { flex: 1 1 170px; min-width: 0; }
</style>
