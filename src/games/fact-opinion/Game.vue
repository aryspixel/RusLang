<script setup>
import { computed, ref } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import TouchButton from '../../components/TouchButton.vue'
import ChoiceGroup from '../../components/ChoiceGroup.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import ProgressMeter from '../../components/ProgressMeter.vue'
import { variants, typeOptions } from './data.js'
import courtyard from './courtyard.svg'
import garden from './garden.svg'
import route from './route.svg'

const images = { courtyard, garden, route }
const active = ref(0)
const states = ref(variants.map(() => ({ index: 0, stage: 'type', selected: null, checked: false, finished: false, score: 0 })))
const variant = computed(() => variants[active.value])
const state = computed(() => states.value[active.value])
const task = computed(() => variant.value.tasks[state.value.index])
const question = computed(() => variant.value.comprehension[state.value.index - variant.value.tasks.length])
const isUnderstanding = computed(() => state.value.stage === 'understanding')
const answer = computed(() => isUnderstanding.value ? (question.value.answer + state.value.index - variant.value.tasks.length + 1) % question.value.options.length : state.value.stage === 'type' ? task.value.type : task.value.proof)
const correct = computed(() => state.value.selected === answer.value)
const options = computed(() => isUnderstanding.value
  ? question.value.options.map((_, value) => ({ value, label: question.value.options[(value - (state.value.index - variant.value.tasks.length + 1) + question.value.options.length * 2) % question.value.options.length] }))
  : state.value.stage === 'type' ? typeOptions : variant.value.evidence.map((label, value) => ({ value, label })))
const total = computed(() => variant.value.tasks.length * 2 + variant.value.comprehension.length)
const currentStep = computed(() => isUnderstanding.value ? variant.value.tasks.length * 2 + state.value.index - variant.value.tasks.length + 1 : state.value.index * 2 + (state.value.stage === 'proof' ? 2 : 1))

function check() {
  if (state.value.checked || state.value.selected === null) return
  state.value.checked = true
  if (correct.value) state.value.score++
}
function next() {
  if (!state.value.checked) return
  if (state.value.stage === 'type') state.value.stage = 'proof'
  else if (state.value.index === variant.value.tasks.length + variant.value.comprehension.length - 1) state.value.finished = true
  else {
    state.value.index++
    state.value.stage = state.value.index >= variant.value.tasks.length ? 'understanding' : 'type'
  }
  state.value.selected = null
  state.value.checked = false
}
function replay() {
  states.value[active.value] = { index: 0, stage: 'type', selected: null, checked: false, finished: false, score: 0 }
}
</script>

<template>
  <div class="game-layout fact-opinion">
    <h1>Факт или мнение? Проверяем по тексту</h1>
    <p>Выбери вариант и прочитай текст. Определи вид утверждения, найди подтверждающую строку, затем ответь на вопросы по содержанию.</p>
    <div class="game-tabs" role="group" aria-label="Вариант текста">
      <TouchButton v-for="(item, position) in variants" :key="item.title" :variant="active === position ? 'primary' : 'secondary'" :aria-pressed="active === position" @click="active = position">Вариант {{ position + 1 }}</TouchButton>
    </div>
    <SurfacePanel class="reading-panel">
      <img :src="images[variant.image]" :alt="variant.imageAlt" />
      <div>
        <h2>{{ variant.title }}</h2>
        <p v-for="paragraph in variant.paragraphs" :key="paragraph">{{ paragraph }}</p>
      </div>
    </SurfacePanel>
    <SurfacePanel v-if="state.finished">
      <h2>Результат</h2>
      <p>Верных ответов: {{ state.score }} из {{ total }}.</p>
      <p>Факт подтверждается текстом и поддаётся проверке. Мнение передаёт оценку. Если детали в тексте нет или она изменена, утверждение не подтверждено.</p>
      <TouchButton @click="replay">Пройти ещё раз</TouchButton>
    </SurfacePanel>
    <SurfacePanel v-else>
      <ProgressMeter :current="currentStep" :total="total" label="Шаг" />
      <p class="task-counter">{{ isUnderstanding ? `Вопрос на понимание ${state.index - variant.tasks.length + 1} из ${variant.comprehension.length}` : `Утверждение ${state.index + 1} из ${variant.tasks.length} · ${state.stage === 'type' ? 'вид утверждения' : 'подтверждение'}` }}</p>
      <h2>{{ isUnderstanding ? question.question : task.statement }}</h2>
      <p>{{ isUnderstanding ? 'Выбери ответ по содержанию текста.' : state.stage === 'type' ? 'Что это за утверждение?' : 'Какая строка текста помогает проверить утверждение?' }}</p>
      <ChoiceGroup :options="options" :selected="state.selected" :disabled="state.checked" :label="isUnderstanding ? 'Ответ на вопрос' : state.stage === 'type' ? 'Вид утверждения' : 'Строка текста'" @select="state.selected = $event" />
      <FeedbackMessage v-if="state.checked" :kind="correct ? 'success' : 'error'" :title="correct ? 'Верно' : 'Посмотри на текст ещё раз'">
        <p>Правильный ответ: {{ isUnderstanding ? question.options[question.answer] : state.stage === 'type' ? typeOptions.find(option => option.value === task.type).label : variant.evidence[task.proof] }}</p>
        <p>{{ isUnderstanding ? question.why : task.why }}</p>
      </FeedbackMessage>
      <div class="action-row">
        <TouchButton v-if="!state.checked" :disabled="state.selected === null" @click="check">Проверить</TouchButton>
        <TouchButton v-else @click="next">{{ state.stage === 'type' ? 'Найти строку' : state.index === variant.tasks.length + variant.comprehension.length - 1 ? 'Показать результат' : 'Дальше' }}</TouchButton>
      </div>
    </SurfacePanel>
  </div>
</template>

<style scoped>
.reading-panel { display:grid; grid-template-columns: minmax(220px, 34%) minmax(0, 1fr); gap:var(--space-3); align-items:start; }
.reading-panel img { width:100%; height:auto; border-radius:var(--radius-control); border:2px solid var(--color-border); }
.reading-panel p { max-width:68ch; }
.task-counter { margin-top:var(--space-2); font-weight:750; color:var(--color-primary-dark); }
@media(max-width:850px) { .reading-panel { grid-template-columns:1fr; }.reading-panel img { max-width:460px; } }
</style>
