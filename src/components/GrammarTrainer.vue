<script setup>
import { computed, reactive, ref } from 'vue'
import SurfacePanel from './SurfacePanel.vue'
import ChoiceGroup from './ChoiceGroup.vue'
import FeedbackMessage from './FeedbackMessage.vue'
import ProgressMeter from './ProgressMeter.vue'
import TouchButton from './TouchButton.vue'
import CommaSentence from './CommaSentence.vue'

const props = defineProps({ modes: { type: Array, required: true }, help: { type: Array, required: true } })
const active = ref(props.modes[0].id)
const sessions = reactive({})
const mode = computed(() => props.modes.find(m => m.id === active.value))
const session = computed(() => sessions[active.value])
const task = computed(() => session.value?.tasks[session.value.index])
const step = computed(() => task.value?.steps[session.value.step])
const options = computed(() => (step.value?.options || []).map(label => ({ value: label, label })))
function shuffled(items) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
function start() {
  const m = mode.value
  const tasks = shuffled(m.sample ? m.sample(shuffled) : shuffled(m.tasks).slice(0, m.count || 10))
    .map(q => ({ ...q, steps: q.steps.map(s => ({ ...s, options: shuffled(s.options) })) }))
  sessions[active.value] = { tasks, index: 0, step: 0, score: 0, started: true, finished: false, selected: null, spots: [], history: [], mistakes: [] }
}
function select(value) {
  const s = session.value
  if (s.selected !== null) return
  s.selected = value
  const ok = value === step.value.answer
  if (ok) s.score++
  let explanation = step.value.explanation
  if (task.value.gaps && !ok) {
    const chosen = task.value.selectable ? s.spots : task.value.optionSpots[value]
    const missed = task.value.commas.filter(n => !chosen.includes(n))
    const extra = chosen.filter(n => !task.value.commas.includes(n))
    explanation = [missed.length ? `Пропущены номера: ${missed.join(', ')}.` : '', extra.length ? `Лишние номера: ${extra.join(', ')}.` : '', explanation].filter(Boolean).join(' ')
  }
  const response = { selected: value, correct: step.value.answer, ok, explanation, title: step.value.title }
  s.history.push(response)
  if (!ok) s.mistakes.push({ sentence: task.value.parts.join(task.value.gaps ? ' ' : ''), ...response })
}
function toggleSpot(index) {
  if (session.value.selected !== null) return
  const spots = session.value.spots
  session.value.spots = spots.includes(index) ? spots.filter(n => n !== index) : [...spots, index].sort((a, b) => a - b)
}
function checkSpots() {
  select(session.value.spots.length ? session.value.spots.map(n => `(${n})`).join(', ') : 'Запятые не нужны')
}
function next() {
  const s = session.value
  if (s.selected === null) return
  if (s.step < task.value.steps.length - 1) s.step++
  else { s.index++; s.step = 0; s.history = []; if (s.index === s.tasks.length) s.finished = true }
  s.selected = null
  s.spots = []
}
const maxPoints = computed(() => session.value?.tasks.reduce((n, q) => n + q.steps.length, 0) || 0)
const nextLabel = computed(() => session.value.step < task.value.steps.length - 1 ? 'Дальше: задать вопрос' : session.value.index === session.value.tasks.length - 1 ? 'Показать итог' : 'Дальше')
</script>

<template>
  <div class="game-layout">
    <nav class="action-row" :class="{ 'grammar-modes--many': modes.length > 3 }" aria-label="Режимы тренажёра">
      <TouchButton v-for="item in modes" :key="item.id" variant="secondary" :aria-pressed="active === item.id" @click="active = item.id">
        {{ active === item.id ? '✓ ' : '' }}{{ item.shortTitle || item.title }}
      </TouchButton>
    </nav>
    <details class="game-help">
      <summary>Памятка</summary>
      <p v-for="(line, i) in help" :key="i">{{ line }}</p>
    </details>
    <SurfacePanel v-if="!session" class="game-layout">
      <h2>{{ mode.title }}</h2><p>{{ mode.instruction }}</p>
      <TouchButton @click="start">Начать тренировку</TouchButton>
    </SurfacePanel>
    <SurfacePanel v-else-if="session.finished" class="game-layout">
      <h2>Тренировка завершена</h2>
      <p>{{ session.score }} из {{ maxPoints }} {{ mode.multi ? 'баллов' : 'верных ответов' }}.</p>
      <p v-if="mode.multi">За верное определение роли — 1 балл; за верный вопрос — ещё 1 балл.</p>
      <p>{{ session.mistakes.length ? 'Посмотрите разбор ошибок и попробуйте ещё раз.' : 'Все ответы верны! Ошибок нет!' }}</p>
      <TouchButton @click="start">Пройти ещё раз</TouchButton>
      <template v-if="session.mistakes.length">
        <h3>Разбор ошибок</h3>
        <article v-for="(error, i) in session.mistakes" :key="i" class="game-help">
          <p><strong>{{ error.sentence }}</strong></p><p>{{ error.title }}</p>
          <p>Ваш ответ: {{ error.selected }}. Правильно: {{ error.correct }}.</p><p>{{ error.explanation }}</p>
        </article>
      </template>
    </SurfacePanel>
    <SurfacePanel v-else class="game-layout">
      <h2>{{ mode.title }}</h2>
      <ProgressMeter :current="session.index + 1" :total="session.tasks.length" label="Задание" />
      <p>Баллы: {{ session.score }} из {{ maxPoints }}</p>
      <CommaSentence v-if="task.gaps" :chunks="task.parts" :selectable="task.selectable" :selected="session.spots" :disabled="session.selected !== null" @toggle="toggleSpot" />
      <p v-else class="grammar-sentence"><template v-for="(part, i) in task.parts" :key="i"><mark v-if="task.highlight && i === 1">{{ part }}</mark><template v-else>{{ part }}</template></template></p>
      <h3>{{ step.title }}</h3><p v-if="step.base">Опора: {{ step.base }}</p>
      <p v-if="task.steps.length > 1">Шаг {{ session.step + 1 }} из {{ task.steps.length }}. Вопрос задавайте внутри придаточной части.</p>
      <TouchButton v-if="task.selectable && session.selected === null" @click="checkSpots">Проверить</TouchButton>
      <ChoiceGroup v-else-if="!task.selectable" :options="options" :selected="session.selected" :disabled="session.selected !== null" :label="step.title" @select="select" />
      <FeedbackMessage v-for="(response, i) in session.history" :key="i" :kind="response.ok ? 'success' : 'error'" :title="`${response.ok ? 'Верно' : 'Пока неверно'}. Правильный ответ: ${response.correct}`">
        <p>{{ response.explanation }}</p>
      </FeedbackMessage>
      <div class="action-row">
        <TouchButton v-if="session.selected !== null" @click="next">{{ nextLabel }}</TouchButton>
        <TouchButton variant="secondary" @click="start">Начать заново</TouchButton>
      </div>
    </SurfacePanel>
  </div>
</template>

<style scoped>
.grammar-sentence { font-size: 1.15em; overflow-wrap: anywhere; }
mark { background: var(--color-selected); color: var(--color-text); border-bottom: 4px solid var(--color-primary); padding: 0 4px; font-weight: 850; }
nav :deep(button[aria-pressed="true"]) { border-width: 4px; background: var(--color-selected); }
.grammar-modes--many { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grammar-modes--many :deep(button) { min-width: 0; padding: 8px 12px; }
@media (min-width: 1200px) { .grammar-modes--many { grid-template-columns: repeat(6, minmax(0, 1fr)); } }
@media (max-width: 600px) { .grammar-modes--many { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
