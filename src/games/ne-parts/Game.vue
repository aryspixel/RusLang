<script setup>
import { computed, reactive, ref } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import TouchButton from '../../components/TouchButton.vue'
import ChoiceGroup from '../../components/ChoiceGroup.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import ProgressMeter from '../../components/ProgressMeter.vue'
import { title, modes, groups, parts, rules, spellingOptions, help } from './data.js'

const active = ref('quick')
const group = ref('mixed')
const sessions = reactive({})
const mode = computed(() => modes.find(item => item.id === active.value))
const block = computed(() => groups.find(item => item.id === group.value))
const key = computed(() => `${active.value}:${group.value}`)
const session = computed(() => sessions[key.value])
const task = computed(() => session.value.items[session.value.index])
const proof = computed(() => active.value === 'proof')
const paired = computed(() => active.value === 'pairs')
const stepNames = ['Часть речи', 'Написание', 'Основание']
const partOptions = parts.map(value => ({ value, label: value }))
const ruleLabel = id => rules.find(item => item.id === id)?.label || id
const options = computed(() => session.value.step === 0 ? partOptions : session.value.step === 1
  ? spellingOptions : session.value.ruleOrder.map(value => ({ value, label: ruleLabel(value) })))
const ready = computed(() => paired.value ? session.value.answers.every(Boolean) : session.value.selected !== null)
const possibleScore = computed(() => session.value.items.length * (proof.value ? 3 : 1))
const expected = computed(() => proof.value ? [task.value.part, task.value.spelling, task.value.rule][session.value.step] : task.value.spelling)
const expectedLabel = computed(() => proof.value && session.value.step === 2 ? ruleLabel(expected.value) : expected.value)
const explanation = computed(() => proof.value && session.value.step === 0 ? task.value.partWhy : task.value.explanation)

function shuffled(items) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
function itemsFor(modeId, groupId) {
  return modes.find(item => item.id === modeId).items.filter(item => groupId === 'mixed' || item.group === groupId)
}
function newSession(items, retry = false) {
  return { items: shuffled(items), retry, index: 0, step: 0, selected: null, answers: [null, null],
    checked: false, correct: false, score: 0, steps: [], misses: [], finished: false, ruleOrder: [] }
}
function ensureSession() {
  if (!sessions[key.value]) sessions[key.value] = newSession(itemsFor(active.value, group.value))
}
function selectMode(id) { active.value = id; ensureSession() }
function selectGroup(id) { group.value = id; ensureSession() }
ensureSession()

function choose(value) {
  if (!session.value.checked && !session.value.finished) session.value.selected = value
}
function choosePair(index, value) {
  if (!session.value.checked && !session.value.finished) session.value.answers[index] = value
}
function check() {
  const s = session.value
  if (s.checked || s.finished || !ready.value) return
  s.correct = paired.value ? task.value.words.every((word, i) => word.spelling === s.answers[i]) : s.selected === expected.value
  s.checked = true
  if (s.correct) s.score++
  if (proof.value) {
    s.steps.push({ label: stepNames[s.step], selected: s.step === 2 ? ruleLabel(s.selected) : s.selected,
      expected: expectedLabel.value, correct: s.correct })
  } else if (!s.correct) {
    s.misses.push({ task: task.value, answers: paired.value ? [...s.answers] : [s.selected] })
  }
}
function next() {
  const s = session.value
  if (!s.checked || s.finished) return
  if (proof.value && s.step < 2) {
    s.step++
    s.selected = null
    s.checked = false
    if (s.step === 2) {
      const distractors = shuffled(rules.filter(item => item.id !== task.value.rule)).slice(0, 3)
      s.ruleOrder = shuffled([task.value.rule, ...distractors.map(item => item.id)])
    }
    return
  }
  if (proof.value && s.steps.some(step => !step.correct)) s.misses.push({ task: task.value, steps: [...s.steps] })
  if (s.index === s.items.length - 1) { s.finished = true; return }
  s.index++
  s.step = 0
  s.selected = null
  s.answers = [null, null]
  s.checked = false
  s.correct = false
  s.steps = []
  s.ruleOrder = []
}
function restart(errorsOnly = false) {
  const items = errorsOnly ? session.value.misses.map(error => error.task) : itemsFor(active.value, group.value)
  if (items.length) sessions[key.value] = newSession(items, errorsOnly)
}
</script>

<template>
  <div class="game-layout">
    <h1>{{ title }}</h1>
    <nav class="game-tabs" aria-label="Режимы тренажёра">
      <TouchButton v-for="item in modes" :key="item.id" :aria-pressed="active === item.id"
        :variant="active === item.id ? 'primary' : 'secondary'" @click="selectMode(item.id)">{{ item.name }}</TouchButton>
    </nav>
    <details class="game-help">
      <summary>Части речи: {{ block.name }}</summary>
      <nav class="game-tabs" aria-label="Учебные блоки">
        <TouchButton v-for="item in groups" :key="item.id" :aria-pressed="group === item.id"
          :variant="group === item.id ? 'primary' : 'secondary'" @click="selectGroup(item.id)">
          {{ item.name }} · {{ itemsFor(active, item.id).length }}
        </TouchButton>
      </nav>
    </details>
    <details class="game-help">
      <summary>Памятка: слитное и раздельное написание НЕ</summary>
      <div class="game-layout">
        <section v-for="item in help" :key="item.title"><h3>{{ item.title }}</h3><p>{{ item.text }}</p></section>
      </div>
    </details>

    <SurfacePanel v-if="session.finished" class="game-layout">
      <h2>{{ session.retry ? 'Повтор ошибок завершён' : 'Тренировка завершена' }}</h2>
      <p>{{ mode.name }} · {{ block.name }}. Баллы: {{ session.score }} из {{ possibleScore }}.</p>
      <p>{{ session.misses.length ? `Заданий с ошибками: ${session.misses.length}. Прочитай разбор и попробуй ещё раз.` : 'Все ответы верны!' }}</p>
      <div class="action-row">
        <TouchButton v-if="session.misses.length" @click="restart(true)">Повторить ошибки</TouchButton>
        <TouchButton variant="secondary" @click="restart()">Начать заново</TouchButton>
      </div>
      <template v-if="session.misses.length">
        <h3>Разбор ошибок</h3>
        <article v-for="error in session.misses" :key="error.task.id" class="game-help">
          <template v-if="paired">
            <div v-for="(word, index) in error.task.words" :key="word.id">
              <p>{{ word.prompt }} Твой ответ: {{ error.answers[index] }}.</p>
              <p><strong>{{ word.answerText }}</strong> {{ word.explanation }}</p>
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
            <p>Правильно: <strong>{{ error.task.answerText }}</strong></p>
            <p>{{ error.task.explanation }}</p>
          </template>
        </article>
      </template>
    </SurfacePanel>

    <SurfacePanel v-else class="game-layout">
      <ProgressMeter :current="session.index + 1" :total="session.items.length" />
      <p>{{ session.retry ? 'Повтор ошибок. ' : '' }}{{ mode.instruction }}</p>
      <p class="muted">{{ proof ? 'За верный шаг — 1 балл (до 3 за задание).' : paired ? 'За оба верных написания — 1 балл.' : 'За верное написание — 1 балл.' }} Баллы: {{ session.score }}.</p>
      <div v-if="paired" class="ne-pair">
        <section v-for="(word, index) in task.words" :key="word.id">
          <h2 class="ne-sentence">{{ index + 1 }}. {{ word.before }}<strong>{{ word.target }}</strong>{{ word.after }}</h2>
          <ChoiceGroup :options="spellingOptions" :selected="session.answers[index]" :disabled="session.checked"
            :label="`Написание ${word.target}: ${word.prompt}`" @select="choosePair(index, $event)" />
        </section>
      </div>
      <template v-else>
        <h2 class="ne-sentence">{{ task.before }}<strong>{{ task.target }}</strong>{{ task.after }}</h2>
        <template v-if="proof">
          <p v-for="step in session.steps.filter((_, index) => index < session.step)" :key="step.label">
            {{ step.correct ? '✓' : '✗' }} {{ step.label }}: {{ step.expected }}.
          </p>
          <h3>Шаг {{ session.step + 1 }} из 3. {{ stepNames[session.step] }}</h3>
          <ChoiceGroup :options="options" :selected="session.selected" :disabled="session.checked"
            :label="stepNames[session.step]" @select="choose" />
        </template>
        <ChoiceGroup v-else :options="spellingOptions" :selected="session.selected" :disabled="session.checked"
          label="Слитно или раздельно?" @select="choose" />
      </template>
      <div v-if="!session.checked" class="action-row">
        <TouchButton :disabled="!ready" @click="check">Проверить{{ proof ? ' шаг' : '' }}</TouchButton>
      </div>
      <FeedbackMessage v-else :kind="session.correct ? 'success' : 'error'"
        :title="session.correct ? 'Верно!' : 'Пока неверно. Прочитай объяснение.'">
        <template v-if="paired">
          <p v-for="(word, index) in task.words" :key="word.id">
            {{ session.answers[index] === word.spelling ? '✓' : '✗' }} <strong>{{ word.answerText }}</strong> {{ word.explanation }}
          </p>
          <p>{{ task.explanation }}</p>
        </template>
        <template v-else>
          <p>Правильный ответ: <strong>{{ expectedLabel }}</strong>.</p>
          <p v-if="!proof || session.step > 0">{{ task.answerText }}</p>
          <p>{{ explanation }}</p>
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
.ne-sentence { font-size: clamp(24px, 2vw, 34px); font-weight: 500; overflow-wrap: anywhere; }
.ne-sentence strong { font-weight: 850; text-decoration: underline; text-underline-offset: .15em; }
.ne-pair { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-3); }
.ne-pair > section { min-width: 0; }
@media (max-width: 900px) { .ne-pair { grid-template-columns: 1fr; } }
</style>
