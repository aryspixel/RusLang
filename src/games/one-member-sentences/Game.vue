<script setup>
import { computed, reactive, ref } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import TouchButton from '../../components/TouchButton.vue'
import ChoiceGroup from '../../components/ChoiceGroup.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import ProgressMeter from '../../components/ProgressMeter.vue'
import { TYPES, levels, intro, help } from './data.js'

const active = ref(0)
const sessions = reactive({})
const level = computed(() => levels[active.value])
const session = computed(() => sessions[active.value])
const task = computed(() => session.value?.items[session.value.index])
const options = computed(() => (session.value?.options || []).map(label => ({ value: label, label })))
const correct = computed(() => session.value.selected === task.value.a)

function shuffled(items) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
function prepareQuestion(s) {
  const q = s.items[s.index]
  s.selected = null
  s.options = shuffled(q.o || (active.value === 2 ? TYPES : TYPES.slice(0, 5)))
}
function start(items = level.value.items, retry = false) {
  const s = { items: [...items], retry, index: 0, selected: null, options: [], score: 0, misses: [], finished: false }
  prepareQuestion(s)
  sessions[active.value] = s
}
function repeatErrors() {
  start(session.value.misses.map(error => error.q), true)
}
function choose(value) {
  const s = session.value
  if (s.selected !== null || s.finished) return
  s.selected = value
  if (value === task.value.a) s.score++
  else s.misses.push({ q: task.value, selected: value })
}
function next() {
  const s = session.value
  if (s.selected === null || s.finished) return
  if (s.index === s.items.length - 1) s.finished = true
  else { s.index++; prepareQuestion(s) }
}
</script>

<template>
  <div class="game-layout">
    <h1>Односоставные предложения</h1>
    <p>{{ intro }}</p>
    <nav class="game-tabs" aria-label="Уровни тренажёра">
      <TouchButton v-for="(item, index) in levels" :key="item.name"
        :variant="active === index ? 'primary' : 'secondary'"
        :aria-pressed="active === index" @click="active = index">
        {{ active === index ? '✓ ' : '' }}{{ item.name }} · {{ item.items.length }}
      </TouchButton>
    </nav>
    <details class="game-help">
      <summary>Памятка: открой правило</summary>
      <p v-for="line in help" :key="line">{{ line }}</p>
    </details>

    <SurfacePanel v-if="!session" class="game-layout">
      <h2>{{ level.name }}</h2>
      <p>{{ level.instruction }}</p>
      <p>В уровне {{ level.items.length }} вопросов. Выбери ответ, прочитай объяснение и переходи дальше. За каждый верный ответ — 1 балл.</p>
      <TouchButton @click="start()">Начать уровень</TouchButton>
    </SurfacePanel>

    <SurfacePanel v-else-if="session.finished" class="game-layout">
      <h2>{{ session.retry ? 'Повтор ошибок завершён' : 'Уровень завершён' }}</h2>
      <p>{{ level.name }}</p>
      <p>Верных ответов: {{ session.score }} из {{ session.items.length }}.</p>
      <p>{{ session.misses.length ? 'Ошибок: ' + session.misses.length + '. Посмотри разбор и попробуй ещё раз.' : 'Все ответы верны.' }}</p>
      <div class="action-row">
        <TouchButton v-if="session.misses.length" @click="repeatErrors">Повторить ошибки</TouchButton>
        <TouchButton variant="secondary" @click="start()">Начать уровень заново</TouchButton>
        <TouchButton v-if="active < levels.length - 1" variant="secondary" @click="active++">Следующий уровень</TouchButton>
      </div>
      <template v-if="session.misses.length">
        <h3>Разбор ошибок</h3>
        <article v-for="(error, index) in session.misses" :key="index" class="game-help">
          <p><strong>{{ error.q.s }}</strong></p>
          <p>Твой ответ: {{ error.selected }}</p>
          <p>Правильно: {{ error.q.a }}</p>
          <p>{{ error.q.why }}</p>
        </article>
      </template>
    </SurfacePanel>

    <SurfacePanel v-else class="game-layout">
      <p>{{ level.name }}{{ session.retry ? ' · повтор ошибок' : '' }}</p>
      <ProgressMeter :current="session.index + 1" :total="session.items.length" label="Вопрос" />
      <p>Верных ответов: {{ session.score }}</p>
      <h2>{{ level.instruction }}</h2>
      <p class="sentence">{{ task.s }}</p>
      <ChoiceGroup :options="options" :selected="session.selected"
        :disabled="session.selected !== null" :label="level.instruction" @select="choose" />
      <FeedbackMessage v-if="session.selected !== null" :kind="correct ? 'success' : 'error'"
        :title="correct ? 'Верно!' : 'Пока неверно.'">
        <p>Правильный ответ: {{ task.a }}</p>
        <p>{{ task.why }}</p>
      </FeedbackMessage>
      <div v-if="session.selected !== null" class="action-row">
        <TouchButton @click="next">{{ session.index === session.items.length - 1 ? 'Посмотреть результат' : 'Следующий вопрос' }}</TouchButton>
      </div>
    </SurfacePanel>
  </div>
</template>

<style scoped>
.sentence { font-size: clamp(24px, 2vw, 36px); font-weight: 750; overflow-wrap: anywhere; }
</style>
