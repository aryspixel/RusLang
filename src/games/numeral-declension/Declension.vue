<script setup>
import { computed, reactive, ref } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import TouchButton from '../../components/TouchButton.vue'
import ChoiceGroup from '../../components/ChoiceGroup.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import ProgressMeter from '../../components/ProgressMeter.vue'
import { blocks } from './data.js'

const mode = ref('learn')
const block = ref(0)
const sessions = reactive({})
const key = computed(() => `${mode.value}-${block.value}`)
const session = computed(() => sessions[key.value])
const question = computed(() => blocks[block.value].questions[session.value?.index ?? 0])
const selected = computed(() => session.value?.answers[session.value.index])
const checked = computed(() => !!session.value?.checked[session.value.index])
const score = computed(() => session.value?.answers.filter((answer, index) => answer === blocks[block.value].questions[index].answer).length ?? 0)
const percent = computed(() => session.value ? Math.round(score.value / blocks[block.value].questions.length * 100) : 0)
const recommendation = computed(() => percent.value >= 85 ? 'Отличный результат! Переходите к следующему блоку.' : percent.value >= 60 ? 'Хорошая основа. Повторите ошибки и попробуйте ещё раз.' : 'Рекомендуется повторить правило и пройти блок в режиме обучения.')
const mistakes = computed(() => session.value?.answers.map((answer, index) => ({ answer, index, question: blocks[block.value].questions[index] })).filter(item => item.answer !== item.question.answer) ?? [])

function setMode(value) { mode.value = value; if (value === 'exam') block.value = 5 }
function start() {
  sessions[key.value] = {
    index: 0, answers: Array(blocks[block.value].questions.length).fill(null),
    checked: Array(blocks[block.value].questions.length).fill(false),
    hint: Array(blocks[block.value].questions.length).fill(false), finished: false, showMistakes: false,
  }
}
function choose(value) { if (!checked.value) session.value.answers[session.value.index] = value }
function check() { if (selected.value !== null) session.value.checked[session.value.index] = true }
function next() {
  if (!checked.value) return
  if (session.value.index + 1 === blocks[block.value].questions.length) session.value.finished = true
  else session.value.index++
}
function showHint() { session.value.hint[session.value.index] = !session.value.hint[session.value.index] }
</script>

<template>
  <div class="declension">
    <SurfacePanel class="declension-stack">
      <h2>Склонение имён числительных</h2>
      <p>Шесть блоков: простые, сложные, составные и порядковые формы, исправление ошибок и итоговый тест. Выберите режим и блок.</p>
      <div class="declension-row" role="group" aria-label="Режим работы">
        <TouchButton :variant="mode === 'learn' ? 'primary' : 'secondary'" :aria-pressed="mode === 'learn'" @click="setMode('learn')">Обучение</TouchButton>
        <TouchButton :variant="mode === 'exam' ? 'primary' : 'secondary'" :aria-pressed="mode === 'exam'" @click="setMode('exam')">Тест без подсказок</TouchButton>
      </div>
      <nav v-if="mode === 'learn'" class="declension-row" aria-label="Блоки склонения">
        <TouchButton v-for="(entry, index) in blocks" :key="entry.name" :variant="block === index ? 'primary' : 'secondary'" :aria-pressed="block === index" @click="block = index">{{ entry.name }}</TouchButton>
      </nav>
      <p v-else>Итоговый тест · {{ blocks[5].questions.length }} заданий. Правильные ответы и объяснения появятся после завершения.</p>
    </SurfacePanel>

    <SurfacePanel v-if="!session" class="declension-stack">
      <h3>{{ blocks[block].name }}</h3>
      <p>{{ mode === 'learn' ? blocks[block].rule : 'Выберите ответ, затем нажмите «Проверить». Результат и разбор ошибок появятся после последнего вопроса.' }}</p>
      <p>В блоке {{ blocks[block].questions.length }} заданий. За верный ответ — один балл.</p>
      <TouchButton @click="start">Начать блок</TouchButton>
    </SurfacePanel>

    <SurfacePanel v-else-if="session.finished" class="declension-stack">
      <h3>Результат · {{ blocks[block].name }}</h3>
      <p>{{ score }} из {{ blocks[block].questions.length }} ({{ percent }}%)</p>
      <p>{{ recommendation }}</p>
      <div class="declension-row"><TouchButton @click="start">Пройти ещё раз</TouchButton><TouchButton variant="secondary" @click="session.showMistakes = !session.showMistakes">{{ session.showMistakes ? 'Скрыть ошибки' : 'Разобрать ошибки' }}</TouchButton></div>
      <div v-if="session.showMistakes" class="declension-stack">
        <h3>Разбор ошибок</h3>
        <p v-if="!mistakes.length">Ошибок нет!</p>
        <article v-for="item in mistakes" :key="item.index" class="declension-review">
          <h4>{{ item.index + 1 }}. {{ item.question.prompt }}</h4>
          <p>Ваш ответ: {{ item.answer === null ? 'нет ответа' : item.answer }}</p>
          <p>Правильно: {{ item.question.answer }}</p>
          <p>{{ item.question.explanation }}</p>
        </article>
      </div>
    </SurfacePanel>

    <SurfacePanel v-else class="declension-stack">
      <h3>{{ blocks[block].name }}</h3>
      <div v-if="mode === 'learn'" class="declension-rule"><strong>Правило</strong><p>{{ blocks[block].rule }}</p></div>
      <ProgressMeter :current="session.index + 1" :total="blocks[block].questions.length" label="Вопрос" />
      <p v-if="mode === 'learn'">Верно: {{ score }}</p>
      <h2>{{ question.prompt }}</h2>
      <p>Выберите один правильный ответ.</p>
      <ChoiceGroup :options="question.options.map(option => ({ value: option, label: option }))" :selected="selected" :disabled="checked" :label="question.prompt" @select="choose" />
      <div v-if="mode === 'learn'" class="declension-stack">
        <TouchButton variant="secondary" @click="showHint">{{ session.hint[session.index] ? 'Скрыть подсказку' : 'Подсказка' }}</TouchButton>
        <p v-if="session.hint[session.index]" class="declension-rule">{{ blocks[block].rule }}</p>
        <FeedbackMessage v-if="checked" :kind="selected === question.answer ? 'success' : 'error'" :title="selected === question.answer ? 'Верно!' : 'Пока неверно.'"><p>Правильный ответ: {{ question.answer }}</p><p>{{ question.explanation }}</p></FeedbackMessage>
      </div>
      <p v-else-if="checked" role="status">Ответ принят. Разбор откроется после завершения теста.</p>
      <div class="declension-row"><TouchButton v-if="!checked" :disabled="selected === null" @click="check">Проверить</TouchButton><TouchButton v-else @click="next">{{ session.index + 1 === blocks[block].questions.length ? 'Результат' : 'Дальше' }}</TouchButton></div>
    </SurfacePanel>
  </div>
</template>

<style scoped>
.declension,.declension-stack{display:grid;gap:16px}.declension-row{display:flex;flex-wrap:wrap;gap:12px}.declension-row .touch-button{min-width:0}.declension-rule,.declension-review{padding:14px;border:2px solid var(--color-border);border-radius:var(--radius-control)}.declension-review h4{margin:0}.declension-review p:last-child{margin-bottom:0}
</style>
