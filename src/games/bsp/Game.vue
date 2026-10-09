<script setup>
import { computed, reactive, ref } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import TouchButton from '../../components/TouchButton.vue'
import ChoiceGroup from '../../components/ChoiceGroup.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import ProgressMeter from '../../components/ProgressMeter.vue'
import { BANK, blocks, help, helpIntro, helpNote, options, same } from './data.js'

const active = ref('sign')
const mode = ref('learn')
const sessions = reactive({})
const key = computed(() => `${mode.value}:${active.value}`)
const session = computed(() => sessions[key.value])
const block = computed(() => blocks.find(b => b.id === active.value))
const task = computed(() => session.value.items[session.value.index])
const choices = computed(() => options(task.value).map((label,value) => ({label,value})))
const correct = computed(() => same(session.value.selected, task.value.answer))
const score = computed(() => session.value.answers.filter(a => a.ok).length)
const prompt = computed(() => task.value.block === 'digits' ? `Где нужно поставить ${task.value.target}?` : block.value.prompt)
function start(items = BANK.filter(q => q.block === active.value)) {
  sessions[key.value] = { items: [...items], index: 0, selected: [], locked: false, hint: false, finished: false, answers: [] }
}
function activate(id) { active.value = id; if (!session.value) start() }
function setMode(value) { mode.value = value; if (!session.value) start() }
function shuffle() {
  const items = BANK.filter(q => q.block === active.value)
  for (let i = items.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i+1)); [items[i],items[j]] = [items[j],items[i]] }
  start(items)
}
function choose(value) {
  const s = session.value
  if (s.locked || s.finished) return
  s.selected = active.value === 'digits' ? s.selected.includes(value) ? s.selected.filter(v => v !== value) : [...s.selected,value] : [value]
}
function check() {
  const s = session.value
  if (s.locked || !s.selected.length || s.finished) return
  s.answers.push({ q: task.value, selected: [...s.selected], ok: correct.value })
  s.locked = true
  s.hint = false
}
function next() {
  const s = session.value
  if (!s.locked || s.finished) return
  if (s.index === s.items.length - 1) s.finished = true
  else { s.index++; s.selected = []; s.locked = false; s.hint = false }
}
function label(q,values) { return values.map(i => options(q)[i]).join(', ') }
function retry() { start(session.value.answers.filter(a => !a.ok).map(a => a.q)) }
start()
</script>

<template>
  <div class="game-layout">
    <h1>БСП: смысл подсказывает знак</h1>
    <p>36 заданий: знаки препинания, смысловые отношения, типы предложений и позиции с цифрами.</p>
    <nav class="game-tabs" aria-label="Режим работы">
      <TouchButton :variant="mode === 'learn' ? 'primary' : 'secondary'" :aria-pressed="mode === 'learn'" @click="setMode('learn')">Обучение</TouchButton>
      <TouchButton :variant="mode === 'exam' ? 'primary' : 'secondary'" :aria-pressed="mode === 'exam'" @click="setMode('exam')">Самопроверка</TouchButton>
    </nav>
    <p>{{ mode === 'learn' ? 'Объяснение после ответа. За полный правильный ответ — 1 балл.' : 'Объяснения и баллы в конце блока. Подсказки и памятка недоступны до итога.' }}</p>
    <nav class="game-tabs" aria-label="Блоки заданий">
      <TouchButton v-for="b in blocks" :key="b.id" :variant="active === b.id ? 'primary' : 'secondary'" :aria-pressed="active === b.id" @click="activate(b.id)">{{ b.name }} · {{ BANK.filter(q => q.block === b.id).length }}</TouchButton>
    </nav>
    <details v-if="mode === 'learn' || session.finished" class="game-help">
      <summary>Памятка по БСП</summary>
      <p>{{ helpIntro }}</p>
      <p v-for="row in help" :key="row[0]"><strong>{{ row[0] }}</strong> · Проверка: {{ row[1] }} · Знак: {{ row[2] }}</p>
      <p>{{ helpNote }}</p>
    </details>
    <div class="action-row">
      <TouchButton variant="secondary" @click="shuffle">Перемешать задания</TouchButton>
      <TouchButton variant="secondary" @click="start()">Начать блок заново</TouchButton>
    </div>
    <SurfacePanel v-if="session.finished" class="game-layout">
      <h2>Блок завершён</h2>
      <p>Верных ответов: {{ score }} из {{ session.items.length }} ({{ Math.round(100 * score / session.items.length) }}%).</p>
      <p>{{ score === session.items.length ? 'Все задания решены верно.' : 'Разбери объяснения и повтори задания с ошибками.' }}</p>
      <div class="action-row">
        <TouchButton v-if="score < session.items.length" @click="retry">Повторить ошибки</TouchButton>
        <TouchButton variant="secondary" @click="start()">Весь блок заново</TouchButton>
      </div>
      <details class="game-help">
        <summary>Все ответы и объяснения</summary>
        <article v-for="a in session.answers" :key="a.q.id" class="game-help">
          <p><strong>{{ a.ok ? '✓ Верно' : '✕ Неверно' }} · {{ a.q.text }}</strong></p>
          <p>Твой ответ: {{ label(a.q,a.selected) }}. Верный ответ: {{ label(a.q,a.q.answer) }}.</p>
          <p>{{ a.q.explain }}</p>
        </article>
      </details>
    </SurfacePanel>
    <SurfacePanel v-else class="game-layout">
      <ProgressMeter :current="session.index + 1" :total="session.items.length" label="Задание" />
      <p>{{ mode === 'learn' ? `Верно: ${score} / ${session.answers.length}` : `Принято ответов: ${session.answers.length}` }}</p>
      <h2>{{ prompt }}</h2>
      <p>{{ active === 'digits' ? 'Выбери все подходящие цифры. Ответ засчитывается при полном совпадении.' : 'Выбери один ответ.' }}<template v-if="task.relation"> Значение: {{ task.relation }}.</template></p>
      <p class="sentence">{{ task.text }}</p>
      <ChoiceGroup :options="choices" :selected="session.selected" :disabled="session.locked" :label="prompt" @select="choose" />
      <FeedbackMessage v-if="session.locked" :kind="mode === 'exam' ? 'info' : correct ? 'success' : 'error'" :title="mode === 'exam' ? 'Ответ принят' : correct ? 'Верно!' : 'Нужно повторить'">
        <template v-if="mode === 'learn'"><p>Правильный ответ: {{ label(task,task.answer) }}</p><p>{{ task.explain }}</p></template>
      </FeedbackMessage>
      <FeedbackMessage v-if="session.hint && !session.locked && mode === 'learn'" title="Подсказка"><p>{{ task.hint }}</p></FeedbackMessage>
      <div class="action-row">
        <TouchButton v-if="!session.locked" :disabled="!session.selected.length" @click="check">{{ mode === 'learn' ? 'Проверить' : 'Принять ответ' }}</TouchButton>
        <TouchButton v-else @click="next">{{ session.index === session.items.length - 1 ? 'Результат' : 'Дальше' }}</TouchButton>
        <TouchButton v-if="mode === 'learn' && !session.locked" variant="secondary" @click="session.hint = !session.hint">Подсказка</TouchButton>
      </div>
    </SurfacePanel>
  </div>
</template>

<style scoped>
.sentence { font-size: clamp(24px, 2vw, 36px); font-weight: 750; overflow-wrap: anywhere; }
</style>
