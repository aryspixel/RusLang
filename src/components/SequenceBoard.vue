<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
const props = defineProps({ items: { type: Array, required: true }, slots: { type: Array, required: true }, disabled: Boolean, results: { type: Array, default: () => [] }, bankLabel: { type: String, default: 'Карточки дней' }, slotsLabel: { type: String, default: 'Порядок недели' }, columns: { type: Number, default: 7 } })
const emit = defineEmits(['place', 'return'])
const board = ref(null), selected = ref(null), ghost = ref(null), hoverSlot = ref(null)
let gesture = null, suppressClick = false
const item = id => props.items.find(value => value.id === id)
const label = id => item(id)?.label ?? ''
function clean() {
 const previous = gesture; gesture = null
 if (previous) { try { previous.element.releasePointerCapture(previous.pointerId) } catch {} }
 ghost.value = null; hoverSlot.value = null
}
function down(event, id) {
 if (props.disabled || id == null || !event.isPrimary || event.button !== 0) return
 suppressClick = false
 gesture = { id, pointerId: event.pointerId, x: event.clientX, y: event.clientY, element: event.currentTarget, dragging: false }
 event.currentTarget.setPointerCapture(event.pointerId)
}
function move(event) {
 if (!gesture || event.pointerId !== gesture.pointerId) return
 if (!gesture.dragging && Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) < 8) return
 gesture.dragging = true; event.preventDefault()
 ghost.value = { id: gesture.id, x: event.clientX, y: event.clientY }
 const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-sequence-slot]')
 hoverSlot.value = target && board.value?.contains(target) ? Number(target.dataset.sequenceSlot) : null
}
function up(event) {
 if (!gesture || event.pointerId !== gesture.pointerId) return
 const current = gesture
 if (current.dragging) {
  event.preventDefault(); suppressClick = true
  const target = document.elementFromPoint(event.clientX, event.clientY)
  const slot = target?.closest('[data-sequence-slot]'), bank = target?.closest('[data-sequence-bank]')
  if (slot && board.value?.contains(slot)) emit('place', Number(slot.dataset.sequenceSlot), current.id)
  else if (bank && board.value?.contains(bank)) emit('return', current.id)
  selected.value = null
 }
 clean()
}
function cancel() { suppressClick = true; clean() }
function click(id, index = null) {
 if (suppressClick) { suppressClick = false; return }
 if (props.disabled) return
 if (index !== null && selected.value !== null) { emit('place', index, selected.value); selected.value = null }
 else if (id !== null) selected.value = selected.value === id ? null : id
}
function returnSelected() { if (!props.disabled && selected.value !== null) { emit('return', selected.value); selected.value = null } }
watch(() => props.disabled, value => { if (value) { clean(); selected.value = null } })
onBeforeUnmount(clean)
</script>
<template>
 <div ref="board" class="sequence-board" :style="{ '--sequence-columns': columns }">
  <div class="sequence-bank sequence-grid" data-sequence-bank role="group" :aria-label="bankLabel" @click.self="returnSelected">
   <button v-for="entry in items.filter(value => !slots.includes(value.id))" :key="entry.id" type="button" class="choice-group__option sequence-card" :class="{ 'choice-group__option--selected': selected === entry.id }" :data-season="entry.season" :data-sequence-item="entry.id" :aria-pressed="selected === entry.id" :disabled="disabled" @pointerdown="down($event, entry.id)" @pointermove="move" @pointerup="up" @pointercancel="cancel" @lostpointercapture="clean" @click="click(entry.id)">{{ entry.label }}<span v-if="entry.translation" class="sequence-translation" lang="kk">{{ entry.translation }}</span></button>
   <button v-if="selected !== null && slots.includes(selected)" type="button" class="sequence-return touch-button touch-button--secondary" @click="returnSelected">↶ В набор</button>
  </div>
  <div class="sequence-slots sequence-grid" role="group" :aria-label="slotsLabel">
   <button v-for="(id,index) in slots" :key="index" type="button" class="choice-group__option sequence-slot" :class="{ 'choice-group__option--selected': selected !== null && selected === id, 'sequence-slot--over': hoverSlot === index, 'sequence-slot--correct': results[index] === true, 'sequence-slot--incorrect': results[index] === false }" :data-sequence-slot="index" :data-season="item(id)?.season" :data-sequence-item="id" :aria-label="`${index + 1}: ${id === null ? 'пусто' : label(id)}`" :aria-pressed="id !== null && selected === id" :disabled="disabled" @pointerdown="down($event,id)" @pointermove="move" @pointerup="up" @pointercancel="cancel" @lostpointercapture="clean" @click="click(id,index)"><span class="sequence-position">{{ index + 1 }}</span><span>{{ id === null ? '—' : label(id) }}</span><span v-if="item(id)?.translation" class="sequence-translation" lang="kk">{{ item(id).translation }}</span><span v-if="results[index] !== undefined">{{ results[index] ? '✓' : '✕' }}</span></button>
  </div>
  <Teleport to="body"><div v-if="ghost" :data-season="item(ghost.id)?.season" class="sequence-ghost choice-group__option" :style="{ left: `${ghost.x}px`, top: `${ghost.y}px` }">{{ label(ghost.id) }}</div></Teleport>
 </div>
</template>
<style scoped>
.sequence-grid { display: grid; grid-template-columns: repeat(var(--sequence-columns,7),minmax(0,1fr)); gap: 12px; }
.sequence-translation { display: block; color: var(--color-muted); font-weight: 500; }
.sequence-bank { min-height: 68px; margin-bottom: 12px; }
.sequence-card,.sequence-slot { min-width: 0; padding: 10px 5px; text-align: center; font-size: clamp(15px,1.28vw,22px); word-break: normal; overflow-wrap: normal; hyphens: none; user-select: none; -webkit-user-select: none; touch-action: none; }
.sequence-slot { display: flex; flex-direction: column; justify-content: center; min-height: 80px; gap: 4px; }
.sequence-card,.sequence-slot { background: var(--sequence-card-background, var(--color-surface)); }
.sequence-card.choice-group__option--selected,.sequence-slot.choice-group__option--selected { box-shadow: inset 0 0 0 2px var(--color-primary); }
.sequence-position { font-size: 16px; color: var(--color-muted); }
.sequence-slot--over { border-color: var(--color-primary); background: var(--color-selected); }
.sequence-slot--correct { border-color: var(--color-success); background: var(--color-success-bg); }
.sequence-slot--incorrect { border-color: var(--color-error); background: var(--color-error-bg); }
.sequence-slot:disabled { opacity: 1; }
.sequence-ghost { position: fixed; z-index: 9999; pointer-events: none; transform: translate(-50%,-50%); padding: 14px 18px; background: var(--sequence-card-background,var(--color-surface,#fff)); color: var(--color-text,#17356d); border-color: var(--color-primary,#17356d); font-size: 20px; }
@media(max-width:899px) { .sequence-grid { grid-template-columns: repeat(4,minmax(0,1fr)); } }
@media(max-width:599px) { .sequence-grid { grid-template-columns: repeat(2,minmax(0,1fr)); } .sequence-card,.sequence-slot { font-size: 16px; } }
</style>

