<script setup>
import { computed, reactive, ref } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import TouchButton from '../../components/TouchButton.vue'
import ChoiceGroup from '../../components/ChoiceGroup.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import ProgressMeter from '../../components/ProgressMeter.vue'
import { modes, parts, rules, spellingOptions, help } from './data.js'

const active = ref('quick')
const stepNames = ['Часть речи', 'Написание', 'Объяснение']
const partOptions = parts.map(value => ({ value, label: value }))
const ruleLabel = id => rules.find(rule => rule.id === id)?.label || id
const ruleOptions = computed(() => session.value.ruleOrder.map(id => ({ value: id, label: ruleLabel(id) })))
const mode = computed(() => modes.find(item => item.id === active.value))
const sessions = reactive(Object.fromEntries(modes.map(item => [item.id, newSession(item.items)])))
const session = computed(() => sessions[active.value])
const task = computed(() => session.value.items[session.value.index])
const proof = computed(() => active.value === 'proof')
const paired = computed(() => active.value === 'pairs')
const currentWords = computed(() => paired.value ? task.value.words : [task.value])
const currentLabel = computed(() => proof.value ? `Шаг ${session.value.step + 1} из 3. ${stepNames[session.value.step]}` : mode.value.instruction)
const options = computed(() => session.value.step === 0 ? partOptions : session.value.step === 1 ? spellingOptions : ruleOptions.value)
const ready = computed(() => paired.value ? session.value.choices.every(Boolean) : session.value.selected !== null)
const maxScore = computed(() => session.value.items.length * (proof.value ? 3 : 1))

function shuffled(items) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function newSession(items, retry = false) {
  return {
    items: shuffled(items), retry, index: 0, step: 0, selected: null,
    choices: [null, null], checked: false, correct: false, score: 0,
    steps: [], misses: [], finished: false, ruleOrder: [],
  }
}

function prepareRules() {
  const s = session.value
  const correct = task.value.rule
  const distractors = shuffled(rules.filter(rule => rule.id !== correct)).slice(0, 3)
  s.ruleOrder = shuffled([correct, ...distractors.map(rule => rule.id)])
}

function choose(value) {
  if (!session.value.checked && !session.value.finished) session.value.selected = value
}

function choosePair(index, value) {
  if (!session.value.checked && !session.value.finished) session.value.choices[index] = value
}

function expected() {
  if (!proof.value) return task.value.spelling
  return [task.value.part, task.value.spelling, task.value.rule][session.value.step]
}

function answerLabel(value, step) {
  return proof.value && step === 2 ? ruleLabel(value) : value
}

const expectedLabel = computed(() => answerLabel(expected(), session.value.step))
const stepExplanation = computed(() => proof.value && session.value.step === 0
  ? `Часть речи: ${task.value.part.toLocaleLowerCase('ru')}. ${task.value.explanation}`
  : task.value.explanation)

function check() {
  const s = session.value
  if (s.checked || s.finished || !ready.value) return
  s.correct = paired.value
    ? task.value.words.every((word, index) => word.spelling === s.choices[index])
    : s.selected === expected()
  s.checked = true
  if (s.correct) s.score++
  if (proof.value) {
    s.steps.push({ label: stepNames[s.step], selected: answerLabel(s.selected, s.step), expected: expectedLabel.value, correct: s.correct })
  } else if (!s.correct) {
    s.misses.push({ task: task.value, answers: paired.value ? [...s.choices] : [s.selected] })
  }
}

function next() {
  const s = session.value
  if (!s.checked || s.finished) return
  if (proof.value && s.step < 2) {
    s.step++
    s.selected = null
    s.checked = false
    if (s.step === 2) prepareRules()
    return
  }
  if (proof.value && s.steps.some(step => !step.correct)) {
    s.misses.push({ task: task.value, steps: [...s.steps] })
  }
  if (s.index === s.items.length - 1) {
    s.finished = true
    return
  }
  s.index++
  s.step = 0
  s.selected = null
  s.choices = [null, null]
  s.checked = false
  s.correct = false
  s.steps = []
  s.ruleOrder = []
}

function restart(errorsOnly = false) {
  const items = errorsOnly ? session.value.misses.map(error => error.task) : mode.value.items
  if (items.length) sessions[active.value] = newSession(items, errorsOnly)
}
</script>

<template>
  <div class="game-layout">
    <h1>Н и НН в частях речи</h1>
    <nav class="game-tabs" aria-label="Режимы тренажёра">
      <TouchButton v-for="item in modes" :key="item.id"
        :variant="active === item.id ? 'primary' : 'secondary'"
        :aria-pressed="active === item.id" @click="active = item.id">
        {{ item.name }} · {{ item.items.length }}
      </TouchButton>
    </nav>
    <details class="game-help">
      <summary>Памятка: Н и НН</summary>
      <div class="game-layout">
        <section v-for="rule in help" :key="rule.title">
          <h3>{{ rule.title }}</h3>
          <p>{{ rule.text }}</p>
        </section>
      </div>
    </details>

    <SurfacePanel v-if="session.finished" class="game-layout">
      <h2>{{ session.retry ? 'Повтор ошибок завершён' : 'Режим завершён' }}</h2>
      <p>{{ mode.name }}. Баллы: {{ session.score }} из {{ maxScore }}.</p>
      <p>{{ session.misses.length ? `Заданий с ошибками: ${session.misses.length}. Прочитай разбор и повтори их.` : 'Все ответы верны!' }}</p>
      <div class="action-row">
        <TouchButton v-if="session.misses.length" @click="restart(true)">Повторить ошибки</TouchButton>
        <TouchButton variant="secondary" @click="restart()">Начать режим заново</TouchButton>
      </div>
      <template v-if="session.misses.length">
        <h3>Разбор ошибок</h3>
        <article v-for="error in session.misses" :key="error.task.id" class="game-help">
          <template v-if="paired">
            <div v-for="(word, index) in error.task.words" :key="word.id">
              <p><strong>{{ word.prompt }}</strong> — твой ответ: {{ error.answers[index] }}.</p>
              <p>Правильно: {{ word.answerText }} ({{ word.spelling }}). {{ word.explanation }}</p>
            </div>
            <p>{{ error.task.explanation }}</p>
          </template>
          <template v-else>
            <h3>{{ error.task.prompt }}</h3>
            <template v-if="proof">
              <p v-for="step in error.steps" :key="step.label">
                {{ step.correct ? '✓' : '✗' }} {{ step.label }}. Твой ответ: {{ step.selected }}.
                <template v-if="!step.correct"> Правильно: {{ step.expected }}.</template>
              </p>
            </template>
            <p v-else>Твой ответ: {{ error.answers[0] }}.</p>
            <p>Правильно: <strong>{{ error.task.answerText }}</strong> ({{ error.task.spelling }}).</p>
            <p>{{ error.task.explanation }}</p>
          </template>
        </article>
      </template>
    </SurfacePanel>

    <SurfacePanel v-else class="game-layout">
      <ProgressMeter :current="session.index + 1" :total="session.items.length" />
      <p>{{ session.retry ? 'Повтор ошибок. ' : '' }}{{ mode.instruction }}</p>
      <p class="muted">{{ proof ? 'За каждый верный шаг — 1 балл, до 3 за задание.' : paired ? 'За оба верных написания — 1 балл.' : 'За верный ответ — 1 балл.' }} Баллы: {{ session.score }}.</p>

      <template v-if="paired">
        <div class="nn-pair">
          <section v-for="(word, index) in currentWords" :key="word.id">
            <h2 class="nn-sentence">{{ index + 1 }}. {{ word.prompt }}</h2>
            <ChoiceGroup :options="spellingOptions" :selected="session.choices[index]"
              :disabled="session.checked" :label="`Написание: ${word.prompt}`" @select="choosePair(index, $event)" />
          </section>
        </div>
      </template>
      <template v-else>
        <h2 class="nn-sentence">{{ task.prompt }}</h2>
        <template v-if="proof">
          <p v-for="step in session.steps.filter((_, index) => index < session.step)" :key="step.label">
            {{ step.correct ? '✓' : '✗' }} {{ step.label }}: {{ step.expected }}.
          </p>
          <h3>{{ currentLabel }}</h3>
          <ChoiceGroup :options="options" :selected="session.selected" :disabled="session.checked"
            :label="currentLabel" @select="choose" />
        </template>
        <ChoiceGroup v-else :options="spellingOptions" :selected="session.selected" :disabled="session.checked"
          label="Выбери Н или НН" @select="choose" />
      </template>

      <div v-if="!session.checked" class="action-row">
        <TouchButton :disabled="!ready" @click="check">Проверить{{ proof ? ' шаг' : '' }}</TouchButton>
      </div>
      <FeedbackMessage v-else :kind="session.correct ? 'success' : 'error'"
        :title="session.correct ? 'Верно!' : 'Пока неверно. Прочитай объяснение.'">
        <template v-if="paired">
          <p v-for="(word, index) in currentWords" :key="word.id">
            {{ session.choices[index] === word.spelling ? '✓' : '✗' }} {{ word.answerText }} ({{ word.spelling }}). {{ word.explanation }}
          </p>
          <p><strong>{{ task.explanation }}</strong></p>
        </template>
        <template v-else>
          <p>Правильный ответ: <strong>{{ expectedLabel }}</strong>.</p>
          <p v-if="!proof || session.step > 0">{{ task.answerText }}</p>
          <p>{{ stepExplanation }}</p>
        </template>
      </FeedbackMessage>
      <div v-if="session.checked" class="action-row">
        <TouchButton @click="next">
          {{ proof && session.step < 2 ? 'Следующий шаг' : session.index === session.items.length - 1 ? 'Посмотреть результат' : 'Дальше' }}
        </TouchButton>
      </div>
    </SurfacePanel>
  </div>
</template>

<style scoped>
.nn-sentence { font-size: clamp(24px, 2vw, 36px); overflow-wrap: anywhere; }
.nn-pair { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-3); }
@media (max-width: 900px) { .nn-pair { grid-template-columns: 1fr; } }
</style>
