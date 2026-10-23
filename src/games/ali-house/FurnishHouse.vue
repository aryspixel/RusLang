<script setup>
import { computed, ref } from 'vue'
import FreeScenePlacementBoard from '../../components/FreeScenePlacementBoard.vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import TouchButton from '../../components/TouchButton.vue'
import emptyHouse from './assets/house-empty.png'
import { furniture, rooms, speechSupports } from './furnishing-data.js'

defineProps({ active: { type: Boolean, default: true } })
const placements = ref({})
const history = ref([])
const finished = ref(false)
const confirmReset = ref(false)
const count = computed(() => Object.keys(placements.value).length)
const description = computed(() => furniture.filter(item => placements.value[item.id]).map(item => {
  const room = rooms.find(room => room.id === placements.value[item.id].room)
  return `${item.noun} ${item.verb} ${room.phrase}.`
}))
function change(next) {
  if (finished.value) return
  history.value.push(placements.value)
  placements.value = next
}
function place(value) { change({ ...placements.value, [value.id]: value }) }
function remove(id) {
  if (!placements.value[id]) return
  const next = { ...placements.value }
  delete next[id]
  change(next)
}
function undo() { if (history.value.length && !finished.value) placements.value = history.value.pop() }
function reset() {
  placements.value = {}
  history.value = []
  finished.value = false
  confirmReset.value = false
}
</script>

<template>
  <div class="game-layout">
    <h2>Обставь дом</h2>
    <p>Дом пустой. Перетаскивай мебель из набора в комнаты и обставляй его по-своему. Можно выбрать предмет нажатием, а затем нажать на комнату.</p>
    <div class="game-stats"><span>В доме: {{ count }} из {{ furniture.length }} предметов</span></div>
    <div class="action-row">
      <TouchButton v-if="!finished" :disabled="!count" @click="finished = true">Дом готов! Расскажу о нём</TouchButton>
      <TouchButton v-else @click="finished = false">Продолжить обустройство</TouchButton>
      <TouchButton variant="secondary" :disabled="!history.length || finished" @click="undo">Отменить последнее действие</TouchButton>
      <TouchButton variant="secondary" :disabled="!count" @click="confirmReset = true">Начать новый дом</TouchButton>
    </div>
    <SurfacePanel v-if="confirmReset" class="game-layout">
      <h3>Убрать всю мебель из дома?</h3>
      <div class="action-row"><TouchButton @click="reset">Да, начать новый дом</TouchButton><TouchButton variant="secondary" @click="confirmReset = false">Оставить как есть</TouchButton></div>
    </SurfacePanel>
    <FreeScenePlacementBoard :background="emptyHouse" description="Пустой дом Али: спальня, детская, две ванные, гостиная, кухня, прихожая и гараж."
      :items="furniture" :rooms="rooms" :placements="placements" :disabled="finished" :active="active" @place="place" @remove="remove" />
    <SurfacePanel v-if="finished" class="game-layout">
      <h3>Твой дом готов!</h3>
      <p>Расскажи, как ты его обставил. Учитель и одноклассники помогут обсудить твой выбор.</p>
      <p v-for="support in speechSupports" :key="support">{{ support }}</p>
      <details class="game-help"><summary>Предложения о моём доме</summary><p v-for="(line, index) in description" :key="index">{{ line }}</p></details>
    </SurfacePanel>
  </div>
</template>
