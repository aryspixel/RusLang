<script setup>
import { computed, reactive, ref } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import TouchButton from '../../components/TouchButton.vue'
import ChoiceGroup from '../../components/ChoiceGroup.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import ProgressMeter from '../../components/ProgressMeter.vue'
import { cases, modes, help } from './data.js'

const active = ref('questions')
const sessions = reactive({})
const mode = computed(() => modes.find(item => item.id === active.value))
const session = computed(() => sessions[active.value])
const task = computed(() => session.value.items[session.value.index])
const answer = computed(() => cases.find(item => item.id === task.value.caseId))
const options = computed(() => task.value.forms
  ? task.value.forms.map(form => ({ value: form, label: form }))
  : cases.map(item => ({ value: item.id, label: active.value === 'questions' ? item.questions : item.name })))
const answerValue = computed(() => task.value.correctForm || task.value.caseId)
const answerLabel = computed(() => task.value.correctForm || (active.value === 'questions' ? answer.value.questions : `${answer.value.name} падеж`))
const followingMode = computed(() => modes[modes.findIndex(item => item.id === active.value) + 1])

function shuffled(items) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
function start(items = mode.value.items, retry = false) {
  sessions[active.value] = { items: shuffled(items), index: 0, selected: null, checked: false, score: 0, misses: [], finished: false, retry }
}
function choose(value) {
  if (session.value.checked || session.value.finished) return
  session.value.selected = value
}
function check() {
  const s = session.value
  if (s.checked || s.selected === null || s.finished) return
  s.checked = true
  if (s.selected === answerValue.value) s.score++
  else s.misses.push({ task: task.value, selected: options.value.find(item => item.value === s.selected).label, correct: answerLabel.value })
}
function next() {
  const s = session.value
  if (!s.checked || s.finished) return
  if (s.index === s.items.length - 1) s.finished = true
  else { s.index++; s.selected = null; s.checked = false }
}
function repeatErrors() {
  start(session.value.misses.map(item => item.task), true)
}
for (const item of modes) {
  sessions[item.id] = { items: shuffled(item.items), index: 0, selected: null, checked: false, score: 0, misses: [], finished: false, retry: false }
}
</script>

<template>
  <div class="game-layout">
    <h1>Падежи: первые шаги</h1>
    <nav class="game-tabs" aria-label="Тренировки по падежам">
      <TouchButton v-for="item in modes" :key="item.id" :variant="active === item.id ? 'primary' : 'secondary'"
        :aria-pressed="active === item.id" @click="active = item.id">
        {{ item.title }} · {{ item.items.length }}
      </TouchButton>
    </nav>
    <details class="game-help">
      <summary>Памятка: шесть падежей</summary>
      <p v-for="line in help" :key="line">{{ line }}</p>
      <p v-for="item in cases" :key="item.id"><strong>{{ item.name }} — {{ item.questions }}</strong><br>{{ item.clue }}</p>
    </details>

    <SurfacePanel v-if="session.finished" class="game-layout">
      <h2>{{ session.retry ? 'Повтор ошибок завершён' : 'Тренировка завершена' }}</h2>
      <p>{{ mode.title }}. Верных ответов: {{ session.score }} из {{ session.items.length }}.</p>
      <p>{{ session.misses.length ? 'Посмотри объяснения и потренируйся ещё.' : 'Все ответы верны!' }}</p>
      <div class="action-row">
        <TouchButton v-if="session.misses.length" @click="repeatErrors">Повторить ошибки</TouchButton>
        <TouchButton variant="secondary" @click="start()">Пройти заново</TouchButton>
        <TouchButton v-if="followingMode" variant="secondary" @click="active = followingMode.id">Дальше: {{ followingMode.title }}</TouchButton>
      </div>
      <template v-if="session.misses.length">
        <h3>Разбор ошибок</h3>
        <article v-for="(error, index) in session.misses" :key="index" class="game-help">
          <p v-if="error.task.prompt"><strong>{{ error.task.prompt }}</strong></p>
          <p v-else>{{ error.task.before }}<strong>{{ error.task.correctForm || error.task.word }}</strong>{{ error.task.after }}</p>
          <p>Твой ответ: {{ error.selected }}. Правильно: {{ error.correct }}.</p>
          <p>{{ error.task.link }} {{ cases.find(item => item.id === error.task.caseId).name }} падеж.</p>
        </article>
      </template>
    </SurfacePanel>

    <SurfacePanel v-else class="game-layout">
      <ProgressMeter :current="session.index + 1" :total="session.items.length" label="Задание" />
      <p v-if="session.retry">Повтор ошибок</p>
      <h2>{{ mode.instruction }}</h2>
      <p v-if="task.prompt" class="case-sentence"><strong>{{ task.prompt }}</strong></p>
      <template v-else>
        <p class="case-sentence">{{ task.before }}<strong class="case-word">{{ task.forms ? (session.checked ? task.correctForm : '…') : task.word }}</strong>{{ task.after }}</p>
        <p>{{ task.forms ? 'Начальная форма' : 'Выделенное слово' }}: «{{ task.word }}».</p>
      </template>
      <ChoiceGroup :options="options" :selected="session.selected" :disabled="session.checked"
        :label="mode.instruction" @select="choose" />
      <FeedbackMessage v-if="session.checked" :kind="session.selected === answerValue ? 'success' : 'error'"
        :title="session.selected === answerValue ? 'Верно!' : 'Пока неверно.'">
        <p>Правильный ответ: {{ answerLabel }}.</p>
        <p>{{ task.link }} {{ answer.name }} падеж: {{ answer.questions }}</p>
      </FeedbackMessage>
      <div class="action-row">
        <TouchButton v-if="!session.checked" :disabled="session.selected === null" @click="check">Проверить</TouchButton>
        <TouchButton v-else @click="next">{{ session.index === session.items.length - 1 ? 'Показать результат' : 'Дальше' }}</TouchButton>
      </div>
    </SurfacePanel>
  </div>
</template>

<style scoped>
.case-sentence { font-size: clamp(24px, 2vw, 36px); overflow-wrap: anywhere; }
.case-word { background: var(--color-selected); border-bottom: 4px solid var(--color-primary); padding-inline: 4px; }
</style>
