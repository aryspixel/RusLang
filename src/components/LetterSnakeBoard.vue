<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
const props = defineProps({
  letters: { type: Array, required: true },
  columns: { type: Number, default: 4 },
  path: { type: Array, required: true },
  foundCells: { type: Array, default: () => [] },
  foundPaths: { type: Array, default: () => [] },
  disabled: Boolean,
})
const emit = defineEmits(['select'])
const board = ref(null), centers = ref([])
let observer
function measure() {
  const bounds = board.value?.getBoundingClientRect()
  if (!bounds?.width) return
  centers.value = [...board.value.querySelectorAll('button')].map(button => {
    const box = button.getBoundingClientRect()
    return `${box.left - bounds.left + box.width / 2},${box.top - bounds.top + box.height / 2}`
  })
}
const points = path => path.map(cell => centers.value[cell]).filter(Boolean).join(' ')
const selectedPoints = computed(() => points(props.path))
onMounted(() => { observer = new ResizeObserver(measure); observer.observe(board.value); measure() })
watch(() => [props.letters, props.columns], async () => { await nextTick(); measure() })
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div ref="board" class="letter-snake-board" role="group" aria-label="Буквенное поле" :style="{ '--letter-columns': columns }">
    <svg class="letter-snake-thread" aria-hidden="true">
      <polyline v-for="(route, index) in foundPaths" :key="index" :points="points(route)" class="letter-snake-thread--found" />
      <polyline v-if="path.length > 1" :points="selectedPoints" class="letter-snake-thread--selected" />
    </svg>
    <button v-for="(letter, index) in letters" :key="index" type="button"
      class="choice-group__option letter-snake-cell"
      :class="{ 'choice-group__option--selected': path.includes(index), 'letter-snake-cell--found': foundCells.includes(index) }"
      :data-letter-cell="index" :aria-label="`Строка ${Math.floor(index / columns) + 1}, столбец ${index % columns + 1}: ${letter}`"
      :aria-pressed="path.includes(index)" :disabled="disabled" @click="emit('select', index)">
      <span class="letter-snake-glyph">{{ letter }}</span><span v-if="path.includes(index)" class="letter-snake-step" aria-hidden="true">{{ path.indexOf(index) + 1 }}</span>
    </button>
  </div>
</template>

<style scoped>
.letter-snake-board { position: relative; display: grid; grid-template-columns: repeat(var(--letter-columns), minmax(48px, 1fr)); gap: 12px; width: 100%; max-width: 360px; isolation: isolate; }
.letter-snake-thread { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; overflow: visible; }
.letter-snake-thread polyline { fill: none; stroke-width: 5; stroke-linecap: round; stroke-linejoin: round; }
.letter-snake-thread--selected { stroke: var(--color-primary); }
.letter-snake-thread--found { stroke: var(--color-success); }
.letter-snake-glyph { position: relative; z-index: 2; background: inherit; border-radius: 50%; padding: 0 3px; }
.letter-snake-cell { position: relative; min-width: 48px; min-height: 56px; padding: 8px 4px; text-align: center; font-size: 26px; }
.letter-snake-cell--found { border-color: var(--color-success); background: var(--color-success-bg); }
.letter-snake-cell.choice-group__option--selected { border-color: var(--color-primary); background: var(--color-selected); box-shadow: inset 0 0 0 1px var(--color-primary); }
.letter-snake-step { position: absolute; top: 0; right: 4px; font-size: 12px; z-index: 2; }
</style>
