<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import SurfacePanel from './SurfacePanel.vue'
import TouchButton from './TouchButton.vue'
import ChoiceGroup from './ChoiceGroup.vue'
import ProgressMeter from './ProgressMeter.vue'


const props = defineProps({ data: { type: Object, required: true }, config: { type: Object, required: true } })
const DATA = props.data
const config = props.config

const kinds = config.kinds
const storageKey = config.storageKey
const validIds = new Set(DATA.questions.map(q => q.id))
let saved = []
try { const value = JSON.parse(localStorage.getItem(storageKey) || '[]'); if (Array.isArray(value)) saved = value.filter(id => validIds.has(id)) } catch { /* История необязательна. */ }
const mistakes = ref(new Set(saved))
const view = ref('setup')
const mode = ref('learn')
const sections = ref(DATA.sections.map((_, index) => index))
const kind = ref('all')
const count = ref('20')
const hints = ref(true)
const session = ref(null)
const pendingTarget = ref(null)
const confirmFinish = ref(false)
const onlyWrong = ref(false)
const search = ref('')
const refSection = ref('all')
const pool = computed(() => DATA.questions.filter(q => sections.value.includes(q.section) && (kind.value === 'all' || q.kind === kind.value)))
const savedPool = computed(() => pool.value.filter(q => mistakes.value.has(q.id)))
const current = computed(() => session.value?.queue[session.value.index])
const answered = computed(() => session.value?.queue.filter(item => item.selected !== null).length || 0)
const score = computed(() => session.value?.queue.filter(item => item.selected === 0).length || 0)
const wrong = computed(() => session.value?.queue.filter(item => item.selected !== 0) || [])
const reviews = computed(() => onlyWrong.value ? wrong.value : session.value.queue)
const summary = computed(() => DATA.sections.map((name, section) => {
  const items = session.value.queue.filter(item => item.q.section === section)
  return { name, total: items.length, right: items.filter(item => item.selected === 0).length }
}).filter(row => row.total))
const normalize = value => value.toLocaleLowerCase('ru').replace(/ё/g, 'е').trim()
const passports = computed(() => DATA.works.filter(work => (refSection.value === 'all' || work.section === Number(refSection.value)) && normalize(config.referenceFields.map(field => work[field]).join(' ')).includes(normalize(search.value))))
function shuffle(items) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]] }
  return result
}
function begin(questions, sessionMode = mode.value) {
  if (!questions.length) return
  session.value = { mode: sessionMode, hints: hints.value, queue: questions.map(q => ({ q, order: shuffle(q.choices.map((_, i) => i)), selected: null, checked: false, hintLevel: 0 })), index: 0, finished: false, started: Date.now(), ended: null }
  view.value = 'session'; pendingTarget.value = null; confirmFinish.value = false; onlyWrong.value = false
}
function start(onlyMistakes = false) {
  const questions = shuffle(onlyMistakes ? savedPool.value : pool.value)
  begin(count.value === 'all' ? questions : questions.slice(0, Number(count.value)))
}
function record(item) {
  if (item.selected === 0) mistakes.value.delete(item.q.id)
  else mistakes.value.add(item.q.id)
}
function save() { try { localStorage.setItem(storageKey, JSON.stringify([...mistakes.value])) } catch { /* Можно заниматься без localStorage. */ } }
function select(value) { if (!current.value.checked) { current.value.selected = value; confirmFinish.value = false } }
function check() {
  if (current.value.checked || current.value.selected === null) return
  current.value.checked = true; record(current.value); save()
}
function go(index) { session.value.index = index; confirmFinish.value = false }
function requestFinish() {
  if (answered.value < session.value.queue.length) confirmFinish.value = true
  else finish()
}
function finish() {
  session.value.finished = true; session.value.ended = Date.now()
  for (const item of session.value.queue) { item.checked = true; record(item) }
  save(); confirmFinish.value = false; view.value = 'results'
}
function continueSession() {
  const index = session.value.queue.findIndex(item => item.selected === null)
  go(index < 0 ? session.value.index : index)
}
function navigate(target) {
  if (session.value && !session.value.finished) pendingTarget.value = target
  else view.value = target
}
function leave() { view.value = pendingTarget.value; session.value = null; pendingTarget.value = null; confirmFinish.value = false }
function retryWrong() { begin(shuffle(wrong.value.map(item => item.q)), 'learn'); session.value.hints = true }
function beforeUnload(event) { if (session.value && !session.value.finished) { event.preventDefault(); event.returnValue = '' } }
window.addEventListener('beforeunload', beforeUnload)
onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnload))
</script>

<template>
  <div class="game-layout practice-ent">
    <h1>{{ config.title }}</h1>
    <nav class="game-tabs" aria-label="Разделы тренажёра">
      <TouchButton variant="secondary" :aria-pressed="view !== 'reference'" @click="navigate('setup')">Тренировка</TouchButton>
      <TouchButton variant="secondary" :aria-pressed="view === 'reference'" @click="navigate('reference')">{{ config.referenceTitle }}</TouchButton>
    </nav>
    <SurfacePanel v-if="pendingTarget" class="game-layout" role="alert">
      <p>Текущий подход будет закрыт. {{ pendingTarget === 'reference' ? 'Открыть справочник?' : 'Вернуться к настройкам?' }}</p>
      <div class="action-row"><TouchButton @click="leave">Да, перейти</TouchButton><TouchButton variant="secondary" @click="pendingTarget = null">Продолжить подход</TouchButton></div>
    </SurfacePanel>

    <template v-if="view === 'setup'">
      <SurfacePanel class="game-layout">
        <h2>{{ config.introTitle }}</h2>
        <p>{{ config.intro }}</p>
        <p>{{ DATA.questions.length }} заданий · {{ DATA.sections.length }} разделов · {{ DATA.works.length }} {{ config.referenceCountLabel }}</p>
        <h3>Выберите режим</h3>
        <ChoiceGroup :options="[{ value: 'learn', label: 'Обучение с разбором' }, { value: 'test', label: 'Тест без подсказок' }]" :selected="mode" label="Режим" @select="mode = $event" />
        <p>{{ mode === 'learn' ? 'Выберите вариант и проверьте ответ. После проверки — объяснение и отдельный переход. Подсказки не снижают оценку.' : 'Ответ можно изменить до завершения теста. Подсказки, справочник и разбор откроются после завершения.' }}</p>
        <label v-if="mode === 'learn'" class="practice-check"><input v-model="hints" type="checkbox">Включить подсказки в обучении</label>
        <div class="catalog-grid">
          <label class="practice-field">Что повторяем<select v-model="kind"><option value="all">Все типы заданий</option><option v-for="(label, key) in kinds" :key="key" :value="key">{{ label }}</option></select></label>
          <label class="practice-field">Заданий в подходе<select v-model="count"><option v-for="n in ['10', '20', '40']" :key="n" :value="n">{{ n }}</option><option value="all">Все доступные</option></select></label>
        </div>
        <p>Вопросы и варианты перемешиваются. Если заданий меньше выбранного количества, попадут все доступные.</p>
      </SurfacePanel>
      <SurfacePanel class="game-layout">
        <h2>Выберите разделы</h2>
        <div class="action-row"><TouchButton variant="secondary" @click="sections = DATA.sections.map((_, i) => i)">Выбрать все</TouchButton><TouchButton variant="secondary" @click="sections = []">Снять выбор</TouchButton></div>
        <div class="catalog-grid"><label v-for="(name, index) in DATA.sections" :key="name" class="practice-check"><input v-model="sections" type="checkbox" :value="index">{{ name }}</label></div>
        <p role="status">Доступно заданий: {{ pool.length }}. В сохранённом повторении ошибок: {{ mistakes.size }}.</p>
        <div class="action-row"><TouchButton :disabled="!pool.length" @click="start()">Начать тренировку</TouchButton><TouchButton variant="secondary" :disabled="!savedPool.length" @click="start(true)">Повторить ошибки</TouchButton></div>
      </SurfacePanel>
    </template>

    <template v-else-if="view === 'session'">
      <SurfacePanel class="game-layout">
        <h2>{{ session.mode === 'test' ? 'Тест без подсказок' : 'Обучение с разбором' }}</h2>
        <ProgressMeter :current="session.index + 1" :total="session.queue.length" label="Вопрос" />
        <p>Ответов выбрано: {{ answered }} из {{ session.queue.length }}</p>
        <p class="muted">{{ kinds[current.q.kind] }} · {{ DATA.sections[current.q.section] }}</p>
        <h2>{{ current.q.prompt }}</h2>
        <blockquote v-if="current.q.passage" class="practice-passage">{{ current.q.passage }}</blockquote>
        <ChoiceGroup :options="current.order.map((index, i) => ({ value: index, label: `${'АБВГ'[i]}. ${current.q.choices[index].text}` }))" :selected="current.selected" :disabled="current.checked || !!pendingTarget" label="Варианты ответа" @select="select" />
        <template v-if="session.mode === 'learn' && !current.checked">
          <div class="action-row">
            <TouchButton variant="secondary" :aria-pressed="session.hints" @click="session.hints = !session.hints">Подсказки: {{ session.hints ? 'вкл.' : 'выкл.' }}</TouchButton>
            <TouchButton v-if="session.hints" variant="secondary" :disabled="current.hintLevel >= current.q.hints.length" @click="current.hintLevel++">{{ current.hintLevel ? 'Ещё подсказка' : 'Открыть подсказку' }}</TouchButton>
          </div>
          <div v-if="session.hints && current.hintLevel" class="game-help" aria-live="polite"><p v-for="(hint, index) in current.q.hints.slice(0, current.hintLevel)" :key="hint"><strong>Подсказка {{ index + 1 }}.</strong> {{ hint }}</p></div>
        </template>
        <slot v-if="current.checked" name="review" :item="current" />
        <div class="action-row">
          <TouchButton v-if="session.index > 0" variant="secondary" @click="go(session.index - 1)">Назад</TouchButton>
          <TouchButton v-if="session.mode === 'learn' && !current.checked" :disabled="current.selected === null" @click="check">Проверить ответ</TouchButton>
          <TouchButton v-if="session.mode === 'test' || current.checked" @click="session.index === session.queue.length - 1 ? requestFinish() : go(session.index + 1)">{{ session.index === session.queue.length - 1 ? 'К результатам' : 'Дальше' }}</TouchButton>
        </div>
        <div v-if="confirmFinish" class="game-help" role="alert">
          <p>Без ответа: {{ session.queue.length - answered }}. Можно вернуться к вопросам или завершить с пропусками.</p>
          <div class="action-row"><TouchButton @click="finish">Завершить с пропусками</TouchButton><TouchButton variant="secondary" @click="continueSession">Вернуться к вопросам</TouchButton></div>
        </div>
      </SurfacePanel>
      <SurfacePanel class="game-layout">
        <details class="game-help"><summary>Карта подхода: вопрос {{ session.index + 1 }} из {{ session.queue.length }}</summary>
          <p>✓ — ответ выбран; «текущий» — открытый вопрос.</p>
          <div class="practice-map"><TouchButton v-for="(item, index) in session.queue" :key="item.q.id" variant="secondary" :aria-current="index === session.index ? 'step' : undefined" :aria-label="`Вопрос ${index + 1}${item.selected !== null ? ', ответ выбран' : ', без ответа'}`" @click="go(index)">{{ item.selected !== null ? '✓ ' : '' }}{{ index + 1 }}{{ index === session.index ? ' · текущий' : '' }}</TouchButton></div>
        </details>
        <div class="action-row"><TouchButton variant="secondary" @click="requestFinish">{{ session.mode === 'test' ? 'Завершить тест' : 'Закончить подход' }}</TouchButton><TouchButton variant="secondary" @click="navigate('setup')">К настройкам</TouchButton></div>
      </SurfacePanel>
    </template>

    <template v-else-if="view === 'results'">
      <SurfacePanel class="game-layout">
        <h2>{{ score }} из {{ session.queue.length }} — ваш результат</h2>
        <p>{{ score === session.queue.length ? 'Все ответы верны. Попробуйте другой раздел или тестовый режим.' : 'Откройте разбор сложных вопросов и повторите их отдельным подходом.' }}</p>
        <div class="game-stats"><span>{{ Math.round(score / session.queue.length * 100) }}% верных ответов</span><span>{{ wrong.length }} ошибок и пропусков</span></div>
        <p>Пропущено: {{ session.queue.filter(item => item.selected === null).length }}. Вопросов с подсказкой: {{ session.mode === 'test' ? 0 : session.queue.filter(item => item.hintLevel > 0).length }}. Время: {{ Math.max(1, Math.round((session.ended - session.started) / 60000)) }} мин.</p>
        <p>{{ session.mode === 'learn' ? 'При обучении результат включает ответы с помощью подсказок.' : 'В тестовом режиме помощь была отключена.' }}</p>
        <div class="action-row"><TouchButton :disabled="!wrong.length" @click="retryWrong">Повторить ошибки этого подхода</TouchButton><TouchButton variant="secondary" @click="navigate('setup')">Выбрать новый подход</TouchButton></div>
        <h3>По разделам</h3><p v-for="row in summary" :key="row.name">{{ row.name }}: {{ row.right }} из {{ row.total }}</p>
      </SurfacePanel>
      <SurfacePanel class="game-layout">
        <h2>Разбор ответов</h2>
        <label class="practice-check"><input v-model="onlyWrong" type="checkbox">Только ошибки и пропуски</label>
        <p v-if="!reviews.length">Ошибок и пропусков нет.</p>
        <details v-for="item in reviews" :key="item.q.id" class="game-help">
          <summary>{{ session.queue.indexOf(item) + 1 }}. {{ item.selected === 0 ? '✓ Верно' : item.selected === null ? '○ Пропуск' : '× Ошибка' }} · {{ item.q.prompt }}</summary>
          <blockquote v-if="item.q.passage" class="practice-passage">{{ item.q.passage }}</blockquote>
          <ul><li v-for="index in item.order" :key="index">{{ item.q.choices[index].text }}{{ index === 0 ? ' · правильный ответ' : '' }}{{ index === item.selected ? ' · ваш выбор' : '' }}</li></ul>
          <slot name="review" :item="item" />
        </details>
      </SurfacePanel>
    </template>

    <SurfacePanel v-else-if="view === 'reference'" class="game-layout">
      <h2>{{ config.referenceTitle }}</h2>
      <p>{{ config.referenceIntro }}</p>
      <label class="practice-field">{{ config.searchLabel }}<input v-model="search" type="search" :placeholder="config.searchPlaceholder"></label>
      <label class="practice-field">Раздел<select v-model="refSection"><option value="all">Все разделы</option><option v-for="(name, index) in DATA.sections" :key="name" :value="index">{{ name }}</option></select></label>
      <p role="status">Найдено карточек: {{ passports.length }}</p>
      <p v-if="!passports.length">{{ config.emptySearch }}</p>
      <template v-for="work in passports" :key="work.id"><slot name="reference" :work="work" /></template>
    </SurfacePanel>
    <p class="muted">Учебный тренажёр по презентации «{{ config.referenceTitle }}». Задания составлены для обучения и не являются официальными заданиями ЕНТ. История ошибок хранится только в этом браузере.</p>
  </div>
</template>

<style scoped>
.practice-ent { overflow-wrap: anywhere; }
.practice-field { display: grid; gap: var(--space-1); min-width: 0; }
.practice-field input, .practice-field select { width: 100%; min-width: 0; min-height: var(--touch-min); padding: 12px; border: 2px solid var(--color-border); border-radius: var(--radius-control); background: var(--color-surface); color: var(--color-text); font: inherit; }
.practice-check { display: flex; align-items: center; gap: var(--space-2); min-height: var(--touch-min); cursor: pointer; }
.practice-check input { width: 24px; height: 24px; flex: 0 0 24px; }
.practice-passage { margin: 0; padding: var(--space-2); border-left: 4px solid var(--color-primary); background: var(--color-selected); white-space: pre-line; }
.practice-map { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 160px), 1fr)); gap: var(--space-1); }
.practice-map .touch-button { min-width: 0; }
.practice-map [aria-current] { outline: 3px solid var(--color-primary); outline-offset: -4px; }
</style>

