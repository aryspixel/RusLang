<script setup>
import { computed, ref } from 'vue'
import SurfacePanel from './SurfacePanel.vue'
import TouchButton from './TouchButton.vue'
import FeedbackMessage from './FeedbackMessage.vue'
import ProgressMeter from './ProgressMeter.vue'

const props = defineProps({ title: { type: String, required: true }, intro: { type: String, required: true }, questions: { type: Array, required: true }, specification: { type: String, required: true } })
const mode = ref('learn')
const index = ref(0)
const answers = ref([])
const checked = ref(false)
const finished = ref(false)
const reviewIndex = ref(null)
const sessions = {}
const question = computed(() => props.questions[index.value])
const answer = computed(() => answers.value[index.value])
const formatLabel = { single: 'Один ответ', context: 'Контекст · один ответ', multi: 'Несколько ответов', match: 'Установи соответствие' }
const answered = computed(() => question.value && (question.value.type === 'match' ? answer.value?.every(value => value !== null) : question.value.type === 'multi' ? answer.value?.length > 0 : Number.isInteger(answer.value)))
const score = computed(() => props.questions.reduce((total, item, position) => total + (isCorrect(item, answers.value[position]) ? 1 : 0), 0))
function isCorrect(item, value) {
  if (item.type === 'match') return Array.isArray(value) && value.length === item.pairs.length && value.every((entry, position) => entry === item.pairs[position][1])
  if (item.type === 'multi') return Array.isArray(value) && value.length === item.answer.length && [...value].sort().every((entry, position) => entry === [...item.answer].sort()[position])
  return value === item.answer
}
function blank(item) { return item.type === 'match' ? item.pairs.map(() => null) : item.type === 'multi' ? [] : null }
function start(nextMode = mode.value) { mode.value = nextMode; index.value = 0; answers.value = props.questions.map(blank); checked.value = false; finished.value = false; reviewIndex.value = null }
function switchMode(nextMode) {
  if (nextMode === mode.value) return
  sessions[mode.value] = { index: index.value, answers: answers.value, checked: checked.value, finished: finished.value, reviewIndex: reviewIndex.value }
  const saved = sessions[nextMode]
  if (!saved) return start(nextMode)
  mode.value = nextMode; index.value = saved.index; answers.value = saved.answers; checked.value = saved.checked; finished.value = saved.finished; reviewIndex.value = saved.reviewIndex
}
function setSingle(value) { if (!checked.value) answers.value[index.value] = value }
function toggleMulti(value) { if (checked.value) return; const values = [...(answer.value || [])]; const at = values.indexOf(value); if (at >= 0) values.splice(at, 1); else values.push(value); answers.value[index.value] = values }
function setMatch(position, value) { if (checked.value) return; const values = [...answer.value]; values[position] = value === '' ? null : Number(value); answers.value[index.value] = values }
function correctText(item) {
  if (item.type === 'match') return item.pairs.map(([left, right]) => `${left} — ${item.options[right]}`).join('; ')
  if (item.type === 'multi') return item.answer.map(value => item.options[value]).join('; ')
  return item.options[item.answer]
}
function next() {
  if (mode.value === 'learn' && !checked.value) return
  if (mode.value === 'test' && !answered.value) return
  if (index.value === props.questions.length - 1) { finished.value = true; return }
  index.value++; checked.value = false
}
start('learn')
</script>

<template>
  <div class="game-layout ent-mixed">
    <h1>{{ title }}</h1>
    <p class="lead">{{ intro }}</p>
    <p class="muted">Авторские тренировочные задания по <a :href="specification" target="_blank" rel="noopener noreferrer">спецификации НЦТ для школ с нерусским языком обучения</a>. Это учебная практика, не официальный вариант ЕНТ.</p>
    <div class="action-row" role="group" aria-label="Режим тренажёра">
      <TouchButton :variant="mode === 'learn' ? 'primary' : 'secondary'" :aria-pressed="mode === 'learn'" @click="switchMode('learn')">Обучение с разбором</TouchButton>
      <TouchButton :variant="mode === 'test' ? 'primary' : 'secondary'" :aria-pressed="mode === 'test'" @click="switchMode('test')">Пробный тест</TouchButton>
    </div>
    <SurfacePanel v-if="!finished">
      <ProgressMeter :current="index + 1" :total="questions.length" label="Задание" />
      <p class="format-label">{{ formatLabel[question.type] }} · {{ question.topic }}</p>
      <blockquote v-if="question.context" class="context-text">{{ question.context }}</blockquote>
      <h2>{{ question.prompt }}</h2>
      <div v-if="question.type === 'single' || question.type === 'context'" class="choice-grid" role="group" :aria-label="question.prompt">
        <button v-for="(option, position) in question.options" :key="position" type="button" class="choice-group__option" :class="{ 'choice-group__option--selected': answer === position }" :aria-pressed="answer === position" :disabled="checked" @click="setSingle(position)">{{ option }}</button>
      </div>
      <div v-else-if="question.type === 'multi'" class="choice-grid" role="group" :aria-label="question.prompt">
        <button v-for="(option, position) in question.options" :key="position" type="button" class="choice-group__option" :class="{ 'choice-group__option--selected': answer?.includes(position) }" :aria-pressed="answer?.includes(position)" :disabled="checked" @click="toggleMulti(position)">{{ option }}</button>
      </div>
      <div v-else class="match-grid">
        <label v-for="([left], position) in question.pairs" :key="position" class="match-row"><span>{{ left }}</span><select :value="answer?.[position] ?? ''" :disabled="checked" @change="setMatch(position, $event.target.value)"><option value="">Выбери соответствие</option><option v-for="(option, optionIndex) in question.options" :key="optionIndex" :value="optionIndex">{{ option }}</option></select></label>
      </div>
      <p v-if="question.type === 'multi'" class="muted">Отметь все верные варианты.</p>
      <FeedbackMessage v-if="mode === 'learn' && checked" :kind="isCorrect(question, answer) ? 'success' : 'error'" :title="isCorrect(question, answer) ? 'Верно!' : 'Пока неверно'">
        <p><strong>Правильный ответ:</strong> {{ correctText(question) }}</p><p>{{ question.explanation }}</p>
      </FeedbackMessage>
      <div class="action-row"><TouchButton v-if="mode === 'learn' && !checked" :disabled="!answered" @click="checked = true">Проверить</TouchButton><TouchButton v-else :disabled="mode === 'test' && !answered" @click="next">{{ index === questions.length - 1 ? 'Показать итог' : 'Дальше' }}</TouchButton></div>
    </SurfacePanel>
    <SurfacePanel v-else>
      <h2>Результат: {{ score }} из {{ questions.length }}</h2>
      <p>Каждое задание здесь оценивается в один тренировочный балл. Официальная система баллов ЕНТ может отличаться.</p>
      <div class="action-row"><TouchButton @click="start()">Пройти ещё раз</TouchButton></div>
      <h3>Разбор заданий</h3>
      <div class="review-grid"><button v-for="(item, position) in questions" :key="position" type="button" class="choice-group__option" :class="{ 'review-error': !isCorrect(item, answers[position]) }" @click="reviewIndex = position">{{ position + 1 }}. {{ isCorrect(item, answers[position]) ? 'Верно' : 'Ошибка' }} · {{ item.topic }}</button></div>
      <div v-if="reviewIndex !== null" class="review-detail" role="status"><h3>Задание {{ reviewIndex + 1 }}</h3><p>{{ questions[reviewIndex].prompt }}</p><p><strong>Правильный ответ:</strong> {{ correctText(questions[reviewIndex]) }}</p><p>{{ questions[reviewIndex].explanation }}</p></div>
    </SurfacePanel>
  </div>
</template>

<style scoped>
.format-label { margin: 20px 0 10px; color: var(--color-primary-dark); font-weight: 800; }
.context-text { white-space: pre-line; margin: 12px 0 20px; padding: 18px; border-left: 5px solid var(--color-primary); background: var(--color-selected); }
.choice-grid, .review-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin: 16px 0; }
.match-grid { display: grid; gap: 12px; margin: 16px 0; }
.match-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: center; gap: 16px; padding: 12px; border: 2px solid var(--color-border); border-radius: var(--radius-control); }
.match-row select { min-height: 56px; width: 100%; padding: 8px; border: 2px solid var(--color-border); border-radius: var(--radius-control); font: inherit; }
.review-error { border-color: var(--color-error); }
.review-detail { padding: 18px; border: 2px solid var(--color-border); border-radius: var(--radius-control); }
@media (max-width: 700px) { .choice-grid, .review-grid, .match-row { grid-template-columns: 1fr; } }
</style>
