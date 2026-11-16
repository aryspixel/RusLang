<script setup>
import { computed, ref } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import TouchButton from '../../components/TouchButton.vue'
import ChoiceGroup from '../../components/ChoiceGroup.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import ProgressMeter from '../../components/ProgressMeter.vue'
import { colors, numberWords, tasks } from './data.js'

const index = ref(0)
const selected = ref(null)
const checked = ref(false)
const finished = ref(false)
const score = ref(0)
const task = computed(() => tasks[index.value])
const color = computed(() => colors.find(item => item.id === task.value.color))
const answer = computed(() => task.value.ask === 'count' ? task.value.count : task.value.color)
const correct = computed(() => selected.value === answer.value)
const numberOptions = computed(() => {
  const target = task.value.count
  const candidates = [target, Math.max(1, target - 2), Math.max(1, target - 1), Math.min(20, target + 1), Math.min(20, target + 2)]
  const values = [...new Set(candidates)]
  for (let n = 1; values.length < 4 && n <= 20; n++) if (!values.includes(n)) values.push(n)
  return values.slice(0, 4).sort((a, b) => a - b).map(n => ({ value: n, label: `${n} — ${numberWords[n - 1]}` }))
})
const options = computed(() => task.value.ask === 'count'
  ? numberOptions.value
  : colors.map(item => ({ value: item.id, label: item.name })))

function check() {
  if (checked.value || selected.value === null) return
  checked.value = true
  if (correct.value) score.value++
}
function next() {
  if (!checked.value) return
  if (index.value === tasks.length - 1) finished.value = true
  else { index.value++; selected.value = null; checked.value = false }
}
function replay() {
  index.value = 0; selected.value = null; checked.value = false
  finished.value = false; score.value = 0
}
</script>

<template>
  <div class="game-layout count-colors">
    <h1>Считай и называй цвет</h1>
    <p>Посмотри на кружки. Выбери число или название цвета, затем нажми «Проверить».</p>
    <SurfacePanel v-if="finished">
      <h2>Игра закончена!</h2>
      <p>Верных ответов: {{ score }} из {{ tasks.length }}.</p>
      <TouchButton @click="replay">Играть ещё раз</TouchButton>
    </SurfacePanel>
    <SurfacePanel v-else>
      <ProgressMeter :current="index + 1" :total="tasks.length" />
      <h2>{{ task.ask === 'count' ? 'Сколько кружков?' : 'Какого цвета кружки?' }}</h2>
      <div class="dots" role="img" :aria-label="`${task.count} кружков, цвет ${color.name}`">
        <span v-for="n in task.count" :key="n" class="dot" :style="{ backgroundColor: color.hex }" />
      </div>
      <ChoiceGroup :options="options" :selected="selected" :disabled="checked" :label="task.ask === 'count' ? 'Выбери число' : 'Выбери цвет'" @select="selected = $event" />
      <FeedbackMessage v-if="checked" :kind="correct ? 'success' : 'error'" :title="correct ? 'Верно!' : 'Запомним правильный ответ.'">
        <p>Правильный ответ: {{ task.ask === 'count' ? `${task.count} — ${numberWords[task.count - 1]}` : color.name }}.</p>
        <p>{{ task.ask === 'count' ? 'Сосчитай каждый кружок по одному.' : 'Все кружки одного цвета. Сравни его с названием.' }}</p>
      </FeedbackMessage>
      <div class="action-row">
        <TouchButton v-if="!checked" :disabled="selected === null" @click="check">Проверить</TouchButton>
        <TouchButton v-else @click="next">{{ index === tasks.length - 1 ? 'Показать результат' : 'Дальше' }}</TouchButton>
      </div>
    </SurfacePanel>
  </div>
</template>

<style scoped>
.dots { display:flex; flex-wrap:wrap; justify-content:center; align-items:center; gap:20px; min-height:140px; margin:var(--space-3) 0; padding:20px; border:2px solid var(--color-border); border-radius:var(--radius-control); background:var(--color-surface); }
.dot { width:76px; height:76px; border:3px solid #333; border-radius:50%; }
.action-row { display:flex; gap:var(--space-2); margin-top:var(--space-3); }
@media(max-width:600px) { .dot { width:58px; height:58px; } .dots { gap:12px; } }
</style>
