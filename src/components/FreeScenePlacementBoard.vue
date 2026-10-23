<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import TouchButton from './TouchButton.vue'

const props = defineProps({
  background: { type: String, required: true },
  description: { type: String, required: true },
  items: { type: Array, required: true },
  rooms: { type: Array, required: true },
  placements: { type: Object, required: true },
  disabled: Boolean,
  active: { type: Boolean, default: true },
})
const emit = defineEmits(['place', 'remove'])
const scene = ref(null)
const bank = ref(null)
const selected = ref(null)
const ghost = ref(null)
const overRoom = ref(null)
const message = ref('')
const page = ref(0)
const furniture = computed(() => props.items.find(item => item.id === selected.value))
const available = computed(() => props.items.filter(item => !props.placements[item.id]))
const lastPage = computed(() => Math.max(0, Math.ceil(available.value.length / 6) - 1))
const currentPage = computed(() => Math.min(page.value, lastPage.value))
const pageItems = computed(() => available.value.slice(currentPage.value * 6, currentPage.value * 6 + 6))
const placed = computed(() => props.items.filter(item => props.placements[item.id]))
let gesture = null
let suppressClick = false
const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

function roomAt(event) {
  const bounds = scene.value.getBoundingClientRect()
  const x = (event.clientX - bounds.left) / bounds.width * 100
  const y = (event.clientY - bounds.top) / bounds.height * 100
  const room = props.rooms.find(room => x >= room.x && x <= room.x + room.width && y >= room.y && y <= room.y + room.height)
  return room ? { room, x, y } : null
}
function place(id, room, point = null) {
  if (props.disabled) return
  const item = props.items.find(item => item.id === id)
  if (!item) return
  const scale = Math.min(1, (room.width - 1) / item.width, (room.height - 1) / item.height)
  const width = item.width * scale, height = item.height * scale
  const xMin = room.x + width / 2 + .4, xMax = room.x + room.width - width / 2 - .4
  let preferredX = point?.x
  if (preferredX == null) {
    const occupied = Object.values(props.placements).filter(p => p.id !== id && p.room === room.id && Boolean(props.items.find(value => value.id === p.id)?.wall) === Boolean(item.wall))
    const overlap = x => occupied.reduce((sum, p) => sum + Math.max(0, Math.min(x + width / 2, p.x + p.width / 2) - Math.max(x - width / 2, p.x - p.width / 2)), 0)
    preferredX = [.5, .2, .8, .35, .65].map(f => clamp(room.x + room.width * f, xMin, xMax)).sort((a, b) => overlap(a) - overlap(b))[0]
  }
  const x = clamp(preferredX, xMin, xMax)
  const y = item.wall
    ? clamp(point?.y ?? room.y + height + 2, room.y + height + .4, room.y + room.height - 3)
    : room.y + room.height - .5
  emit('place', { id, room: room.id, x, y, width, height })
  selected.value = id
  message.value = `${item.label}: ${room.label}. Можно передвинуть или выбрать другой предмет.`
}
function clean() {
  const previous = gesture
  gesture = null
  if (previous) { try { previous.element.releasePointerCapture(previous.pointerId) } catch {} }
  ghost.value = null
  overRoom.value = null
}
function down(event, id) {
  if (props.disabled || !props.active || !event.isPrimary || event.button !== 0) return
  suppressClick = false
  gesture = { id, pointerId: event.pointerId, x: event.clientX, y: event.clientY, element: event.currentTarget, dragging: false }
  event.currentTarget.setPointerCapture(event.pointerId)
}
function move(event) {
  if (!gesture || event.pointerId !== gesture.pointerId) return
  if (!gesture.dragging && Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) < 8) return
  gesture.dragging = true
  event.preventDefault()
  const item = props.items.find(item => item.id === gesture.id)
  const sceneWidth = scene.value.getBoundingClientRect().width
  ghost.value = { image: item.image, label: item.label, x: event.clientX, y: event.clientY, width: Math.max(64, sceneWidth * item.width / 100) }
  overRoom.value = roomAt(event)?.room.id ?? null
}
function up(event) {
  if (!gesture || event.pointerId !== gesture.pointerId) return
  const current = gesture
  if (current.dragging) {
    event.preventDefault()
    suppressClick = true
    const target = roomAt(event)
    if (target) place(current.id, target.room, target)
    else if (bank.value?.contains(document.elementFromPoint(event.clientX, event.clientY))) {
      if (props.placements[current.id]) emit('remove', current.id)
      selected.value = null
      message.value = 'Предмет возвращён в набор.'
    } else message.value = 'Перенеси предмет внутрь комнаты. Его прежнее место сохранено.'
  }
  clean()
}
function cancel() { suppressClick = true; clean() }
function select(id, event) {
  if (suppressClick && event?.detail !== 0) { suppressClick = false; return }
  if (props.disabled) return
  selected.value = selected.value === id ? null : id
  message.value = selected.value ? `Выбрано: ${furniture.value.label}. Нажми на комнату или её название.` : 'Выбор отменён.'
}
function tapRoom(event, room) {
  if (suppressClick && event.detail !== 0) { suppressClick = false; return }
  if (!selected.value || props.disabled) return
  const target = roomAt(event)
  place(selected.value, room, target)
}
function removeSelected() {
  if (!furniture.value || props.disabled) return
  emit('remove', selected.value)
  message.value = `${furniture.value.label}: возвращено в набор.`
  selected.value = null
}
watch(() => props.active, value => { if (!value) clean() })
watch(() => props.disabled, value => { if (value) { clean(); selected.value = null } })
watch(() => props.placements, () => {
  if (selected.value && !props.placements[selected.value]) selected.value = null
  if (!Object.keys(props.placements).length) { message.value = 'Дом пуст. Выбери мебель для комнат.'; page.value = 0 }
})
onBeforeUnmount(clean)
</script>

<template>
  <div class="game-layout" @pointerdown.capture="suppressClick = false">
    <div class="free-scene-workspace">
      <div ref="scene" class="free-scene" role="group" :aria-label="description">
        <img :src="background" :alt="description" class="free-scene__background" draggable="false">
        <button v-for="room in rooms" :key="room.id" type="button" class="free-scene__room"
          :class="{ 'free-scene__room--over': overRoom === room.id }"
          :style="{ left: `${room.x}%`, top: `${room.y}%`, width: `${room.width}%`, height: `${room.height}%` }"
          :disabled="disabled || !selected" :aria-label="`Поставить выбранный предмет: ${room.label}`"
          @click="tapRoom($event, room)" />
        <button v-for="item in placed" :key="item.id" type="button" class="free-scene__object"
          :class="{ 'free-scene__object--selected': selected === item.id }"
          :style="{ left: `${placements[item.id].x}%`, top: `${placements[item.id].y}%`, width: `${placements[item.id].width}%`, height: `${placements[item.id].height}%`, zIndex: item.layer ?? 3 }"
          :disabled="disabled" :aria-label="`${item.label}: ${rooms.find(room => room.id === placements[item.id].room)?.label}. Выбрать или передвинуть.`"
          :aria-pressed="selected === item.id"
          @pointerdown="down($event, item.id)" @pointermove="move" @pointerup="up" @pointercancel="cancel" @lostpointercapture="clean" @click.stop="select(item.id, $event)">
          <img :src="item.image" alt="" draggable="false">
        </button>
      </div>
      <aside ref="bank" class="free-scene-bank" aria-label="Набор мебели">
        <h3>Мебель и вещи</h3>
        <div class="free-scene-palette">
          <button v-for="item in pageItems" :key="item.id" type="button" class="choice-group__option free-scene-card"
            :class="{ 'choice-group__option--selected': selected === item.id }" :aria-pressed="selected === item.id" :disabled="disabled"
            @pointerdown="down($event, item.id)" @pointermove="move" @pointerup="up" @pointercancel="cancel" @lostpointercapture="clean" @click="select(item.id, $event)">
            <img :src="item.image" alt="" draggable="false"><span>{{ item.label }}</span>
          </button>
        </div>
        <div v-if="lastPage" class="action-row free-scene-bank__pages">
          <TouchButton variant="secondary" :disabled="disabled || currentPage === 0" @click="page = currentPage - 1">← Назад</TouchButton>
          <TouchButton variant="secondary" :disabled="disabled || currentPage === lastPage" @click="page = currentPage + 1">Ещё мебель →</TouchButton>
        </div>
        <p v-if="!available.length">Вся мебель уже в доме.</p>
      </aside>
    </div>
    <p role="status" aria-live="polite">{{ message || 'Перетащи мебель в комнату. Или выбери предмет и нажми на комнату либо её название.' }}</p>
    <div v-if="!disabled" class="action-row" role="group" aria-label="Поставить выбранный предмет в комнату">
      <TouchButton v-for="room in rooms" :key="room.id" variant="secondary" :disabled="!selected" @click="place(selected, room)">{{ room.label }}</TouchButton>
      <TouchButton variant="secondary" :disabled="!selected || !placements[selected]" @click="removeSelected">Вернуть в набор</TouchButton>
    </div>
    <details v-if="placed.length" class="game-help">
      <summary>Что уже в доме? ({{ placed.length }})</summary>
      <div class="action-row">
        <TouchButton v-for="item in placed" :key="item.id" variant="secondary" :disabled="disabled" :aria-pressed="selected === item.id" @click="select(item.id, $event)">
          {{ item.label }} — {{ rooms.find(room => room.id === placements[item.id].room)?.label }}
        </TouchButton>
      </div>
    </details>
    <Teleport to="body">
      <div v-if="ghost" class="free-scene-ghost" :style="{ left: `${ghost.x}px`, top: `${ghost.y}px`, width: `${ghost.width}px` }" aria-hidden="true">
        <img :src="ghost.image" alt="" draggable="false">
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.free-scene-workspace { display: grid; grid-template-columns: minmax(0, 1fr) 230px; gap: var(--space-3); align-items: start; }
.free-scene { position: relative; isolation: isolate; aspect-ratio: 3 / 2; overflow: hidden; border-radius: var(--radius-control); }
.free-scene__background { display: block; width: 100%; height: 100%; object-fit: contain; }
.free-scene__room { position: absolute; border: 2px solid transparent; padding: 0; background: transparent; z-index: 1; }
.free-scene__room:disabled { opacity: 1; }
.free-scene__room--over { border-color: var(--color-primary); background: #e6f1fc55; }
.free-scene__object { position: absolute; transform: translate(-50%, -100%); border: 2px solid transparent; background: transparent; padding: 0; touch-action: none; user-select: none; -webkit-user-select: none; }
.free-scene__object--selected { border-color: var(--color-primary); border-radius: var(--radius-control); }
.free-scene__object img { display: block; width: 100%; height: 100%; object-fit: contain; object-position: center bottom; pointer-events: none; }
.free-scene__object:disabled { opacity: 1; }
.free-scene-bank { min-width: 0; }
.free-scene-palette { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-2); padding: 4px; }
.free-scene-bank__pages > :deep(button) { flex: 1 1 100%; min-width: 0; }
.free-scene-card { display: grid; justify-items: center; align-content: center; gap: var(--space-1); min-width: 0; padding: 8px; text-align: center; font-size: 18px; overflow-wrap: anywhere; user-select: none; -webkit-user-select: none; touch-action: none; }
.free-scene-card img { width: 100%; height: 80px; object-fit: contain; pointer-events: none; }
.free-scene-ghost { position: fixed; z-index: 30000; pointer-events: none; transform: translate(-50%, -65%); max-height: 220px; }
.free-scene-ghost img { display: block; width: 100%; max-height: 220px; object-fit: contain; }
@media (max-width: 850px) { .free-scene-workspace { grid-template-columns: minmax(0, 1fr); } .free-scene-bank { order: -1; } .free-scene-palette { grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); } .free-scene-card img { height: 60px; } .free-scene-bank__pages > :deep(button) { flex-basis: 120px; } }
</style>
