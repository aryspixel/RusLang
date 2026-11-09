<script setup>
import { computed, ref } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import TouchButton from '../../components/TouchButton.vue'
import ChoiceGroup from '../../components/ChoiceGroup.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import ProgressMeter from '../../components/ProgressMeter.vue'
import { data } from './data.js'
import Declension from '../numeral-declension/Declension.vue'

const part = ref('general')
const kinds = { theory: 'Разряд и строение', spelling: 'Правописание', form: 'Выбор формы' }
const mode = ref('learn')
const sections = ref(data.sections.map((_, i) => i))
const kind = ref('all')
const count = ref('20')
const hintsEnabled = ref(true)
const savedMistakes = ref(readMistakes())
const session = ref(null)
const referenceOpen = ref(false)
const referenceQuery = ref('')
const referenceSection = ref('all')
const onlyWrong = ref(false)

function readMistakes() {
  try { return JSON.parse(localStorage.getItem('numerals-ent-mistakes-v1') || '[]').filter(id => data.questions.some(q => q.id === id)) }
  catch { return [] }
}
function saveMistakes() { try { localStorage.setItem('numerals-ent-mistakes-v1', JSON.stringify(savedMistakes.value)) } catch { /* Storage is optional. */ } }
function shuffle(items) { const a = [...items]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }
const pool = computed(() => data.questions.filter(q => sections.value.includes(q.section) && (kind.value === 'all' || q.kind === kind.value)))
const current = computed(() => session.value?.items[session.value.index])
const correctCount = computed(() => session.value?.items.filter(item => item.selected === 0).length || 0)
const visibleWorks = computed(() => data.works.filter(w => (referenceSection.value === 'all' || w.section === Number(referenceSection.value)) && [w.title, w.rule, w.method, w.trap, w.example].join(' ').toLocaleLowerCase('ru').replaceAll('ё', 'е').includes(referenceQuery.value.toLocaleLowerCase('ru').replaceAll('ё', 'е').trim())))
function setAllSections(value) { sections.value = value ? data.sections.map((_, i) => i) : [] }
function start(mistakesOnly = false, retry = null) {
  let source = retry || pool.value.filter(q => !mistakesOnly || savedMistakes.value.includes(q.id))
  if (!source.length) return
  source = shuffle(source)
  if (!retry && count.value !== 'all') source = source.slice(0, Number(count.value))
  session.value = { mode: retry ? 'learn' : mode.value, hints: retry ? true : hintsEnabled.value, items: source.map(q => ({ q, order: shuffle(q.choices.map((_, i) => i)), selected: null, checked: false, hintLevel: 0 })), index: 0, finished: false, confirmFinish: false, mistakesOnly: mistakesOnly || !!retry }
  onlyWrong.value = false
}
function choose(value) { if (!current.value.checked) current.value.selected = value }
function check() {
  if (current.value.selected === null || current.value.checked) return
  current.value.checked = true
  const ids = new Set(savedMistakes.value)
  if (current.value.selected === 0) ids.delete(current.value.q.id)
  else ids.add(current.value.q.id)
  savedMistakes.value = [...ids]; saveMistakes()
}
function go(index) { if (session.value.mode === 'learn' && !current.value.checked && index > session.value.index) return; session.value.index = index; session.value.confirmFinish = false }
function next() { if (session.value.index === session.value.items.length - 1) requestFinish(); else go(session.value.index + 1) }
function requestFinish() { if (session.value.items.some(x => x.selected === null)) session.value.confirmFinish = true; else finish() }
function finish() {
  if (session.value.mode === 'test') {
    const ids = new Set(savedMistakes.value)
    session.value.items.forEach(x => { if (x.selected === 0) ids.delete(x.q.id); else ids.add(x.q.id) })
    savedMistakes.value = [...ids]; saveMistakes()
  }
  session.value.finished = true
}
function leave() { session.value = null }
function retryWrong() { start(true, session.value.items.filter(x => x.selected !== 0).map(x => x.q)) }
const reviewItems = computed(() => session.value?.items.map((item, index) => ({ item, index })).filter(({ item }) => !onlyWrong.value || item.selected !== 0) || [])
</script>

<template>
  <div class="trainer">
    <header><p class="eyebrow">Русский язык · Практика</p><h1>Имя числительное</h1><p>Разряды, правописание и падежные формы · рекомендация 5–11 классы предварительная</p></header>
    <nav class="row" aria-label="Части тренажёра"><TouchButton :variant="part === 'general' ? 'primary' : 'secondary'" :aria-pressed="part === 'general'" @click="part = 'general'">Общая практика</TouchButton><TouchButton :variant="part === 'declension' ? 'primary' : 'secondary'" :aria-pressed="part === 'declension'" @click="part = 'declension'">Склонение числительных · 45 заданий</TouchButton></nav>
    <div v-show="part === 'general'" class="trainer">
    <SurfacePanel v-if="!session" class="stack">
      <p>Определяйте разряды, выбирайте падежные формы и исправляйте ошибки. Мягкий знак, составные числительные, даты, дроби и трудные сочетания. После ответа — объяснение и памятка.</p>
      <fieldset><legend>Режим</legend><div class="row"><TouchButton :variant="mode === 'learn' ? 'primary' : 'secondary'" :aria-pressed="mode === 'learn'" @click="mode = 'learn'">Обучение</TouchButton><TouchButton :variant="mode === 'test' ? 'primary' : 'secondary'" :aria-pressed="mode === 'test'" @click="mode = 'test'">Тест</TouchButton></div><p>{{ mode === 'learn' ? 'После каждого ответа — подробный разбор.' : 'Без подсказок и оценки по ходу. Результат и объяснения — после завершения.' }}</p></fieldset>
      <label v-if="mode === 'learn'" class="check"><input v-model="hintsEnabled" type="checkbox"> Включить подсказки в обучении</label>
      <div class="settings"><label>Что повторяем<select v-model="kind"><option value="all">Все типы заданий</option><option v-for="(name, key) in kinds" :key="key" :value="key">{{ name }}</option></select></label><label>Заданий в подходе<select v-model="count"><option value="10">10</option><option value="20">20</option><option value="40">40</option><option value="all">Все доступные</option></select></label></div>
      <fieldset><legend>Выберите разделы</legend><div class="row"><TouchButton variant="secondary" @click="setAllSections(true)">Выбрать все</TouchButton><TouchButton variant="secondary" @click="setAllSections(false)">Снять выбор</TouchButton></div><div class="sections"><label v-for="(name, i) in data.sections" :key="i" class="check"><input v-model="sections" type="checkbox" :value="i"> {{ name }}</label></div></fieldset>
      <p role="status">Доступно заданий: {{ pool.length }}. В сохранённом повторении ошибок: {{ savedMistakes.length }}.</p>
      <div class="row"><TouchButton :disabled="!pool.length" @click="start()">Начать тренировку →</TouchButton><TouchButton variant="secondary" :disabled="!pool.some(q => savedMistakes.includes(q.id))" @click="start(true)">Повторить ошибки</TouchButton><TouchButton variant="secondary" @click="referenceOpen = !referenceOpen">{{ referenceOpen ? 'Скрыть памятки' : 'Памятки по теме' }}</TouchButton></div>
      <div v-if="referenceOpen" class="stack"><div class="settings"><label>Поиск по памяткам<input v-model="referenceQuery" type="search" placeholder="Например: полтора, двести, дата"></label><label>Раздел<select v-model="referenceSection"><option value="all">Все разделы</option><option v-for="(name, i) in data.sections" :key="i" :value="String(i)">{{ name }}</option></select></label></div><p>Найдено памяток: {{ visibleWorks.length }}</p><details v-for="work in visibleWorks" :key="work.id" class="reference"><summary>{{ work.title }}</summary><p><strong>Основное правило.</strong> {{ work.rule }}</p><p><strong>Порядок разбора.</strong> {{ work.method }}</p><p><strong>Частая ловушка.</strong> {{ work.trap }}</p><p><strong>Пример.</strong> {{ work.example }}</p></details></div>
    </SurfacePanel>
    <SurfacePanel v-else-if="session.finished" class="stack"><h2>{{ correctCount }} из {{ session.items.length }} — ваш результат</h2><p>{{ Math.round(correctCount / session.items.length * 100) }}% верных · {{ session.items.length - correctCount }} ошибок и пропусков · {{ session.items.filter(x => x.hintLevel > 0).length }} вопросов с подсказкой</p><div class="row"><TouchButton :disabled="correctCount === session.items.length" @click="retryWrong">Повторить ошибки этого подхода</TouchButton><TouchButton variant="secondary" @click="leave">Выбрать новый подход</TouchButton></div><h3>По разделам</h3><p v-for="(name, i) in data.sections" :key="i" v-show="session.items.some(x => x.q.section === i)">{{ name }}: {{ session.items.filter(x => x.q.section === i && x.selected === 0).length }} из {{ session.items.filter(x => x.q.section === i).length }}</p><label class="check"><input v-model="onlyWrong" type="checkbox"> Только ошибки и пропуски</label><details v-for="{ item, index } in reviewItems" :key="index" class="reference"><summary>{{ index + 1 }}. {{ item.selected === 0 ? '✓ Верно' : item.selected === null ? '○ Пропуск' : '× Ошибка' }} — {{ item.q.prompt }}</summary><p v-if="item.q.passage" class="passage">{{ item.q.passage }}</p><p><strong>Ваш ответ:</strong> {{ item.selected === null ? 'Пропуск' : item.q.choices[item.selected].text }}</p><p><strong>Правильный ответ:</strong> {{ item.q.choices[0].text }}</p><p>{{ item.q.explanation }}</p><p v-if="item.q.analysis" class="passage">{{ item.q.analysis }}</p><p>{{ data.works[item.q.section].trap }}</p></details></SurfacePanel>
    <SurfacePanel v-else class="stack"><div class="row between"><p>{{ session.mode === 'test' ? 'Тест без подсказок' : 'Обучение с разбором' }}{{ session.mistakesOnly ? ' · повторение ошибок' : '' }}</p><TouchButton variant="secondary" @click="leave">К настройкам</TouchButton></div><ProgressMeter :current="session.index + 1" :total="session.items.length" /><p>{{ kinds[current.q.kind] }} · {{ data.sections[current.q.section] }}</p><h2>{{ current.q.prompt }}</h2><p v-if="current.q.passage" class="passage">{{ current.q.passage }}</p><ChoiceGroup :options="current.order.map(i => ({ value: i, label: current.q.choices[i].text }))" :selected="current.selected" :disabled="current.checked" label="Варианты ответа" @select="choose" />
      <div v-if="session.mode === 'learn' && session.hints && !current.checked" class="stack"><TouchButton variant="secondary" :disabled="current.hintLevel >= current.q.hints.length" @click="current.hintLevel++">{{ current.hintLevel ? 'Ещё подсказка' : 'Открыть подсказку' }}</TouchButton><p v-for="(hint, i) in current.q.hints.slice(0, current.hintLevel)" :key="i" role="status">Подсказка {{ i + 1 }}. {{ hint }}</p></div>
      <FeedbackMessage v-if="current.checked && session.mode === 'learn'" :kind="current.selected === 0 ? 'success' : 'error'" :title="current.selected === 0 ? 'Верно. Разберём почему.' : 'Есть ошибка. Разберём её.'"><p><strong>Правильный ответ:</strong> {{ current.q.choices[0].text }}</p><p>{{ current.q.explanation }}</p><p v-if="current.q.analysis" class="passage">{{ current.q.analysis }}</p><p><strong>Как избежать ошибки:</strong> {{ data.works[current.q.section].trap }}</p><p><strong>Порядок проверки:</strong> {{ current.q.method }}</p></FeedbackMessage>
      <p v-if="session.mode === 'test'" role="status">Выбор сохраняется. Ответ можно изменить до завершения теста.</p><div class="row"><TouchButton v-if="session.mode === 'learn' && !current.checked" :disabled="current.selected === null" @click="check">Проверить ответ</TouchButton><TouchButton v-if="session.index > 0" variant="secondary" @click="go(session.index - 1)">← Назад</TouchButton><TouchButton v-if="session.mode === 'test' || current.checked" @click="next">{{ session.index === session.items.length - 1 ? 'Результат →' : 'Дальше →' }}</TouchButton><TouchButton v-if="session.mode === 'test'" variant="secondary" @click="requestFinish">Завершить тест</TouchButton></div>
      <div v-if="session.confirmFinish" class="reference" role="alert"><p>Без ответа: {{ session.items.filter(x => x.selected === null).length }}. Можно вернуться к вопросам или завершить с пропусками.</p><div class="row"><TouchButton @click="finish">Завершить с пропусками</TouchButton><TouchButton variant="secondary" @click="session.confirmFinish = false">Вернуться к вопросам</TouchButton></div></div><details class="reference"><summary>Карта подхода</summary><div class="map"><button v-for="(item, i) in session.items" :key="i" type="button" :aria-current="i === session.index ? 'step' : undefined" :aria-label="`Вопрос ${i + 1}${item.selected !== null ? ', ответ выбран' : ''}`" :disabled="session.mode === 'learn' && !current.checked && i > session.index" @click="go(i)">{{ i + 1 }}{{ item.selected !== null ? ' ✓' : '' }}</button></div></details>
    </SurfacePanel>
    </div>
    <Declension v-show="part === 'declension'" />
  </div>
</template>

<style scoped>
.trainer,.stack{display:grid;gap:18px}.trainer header h1{margin:.2em 0}.trainer header p{margin:.4em 0}.eyebrow{font-weight:700;text-transform:uppercase;letter-spacing:.06em}.row{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.between{justify-content:space-between}.settings,.sections{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.settings label{display:grid;gap:8px;font-weight:700}.check{display:flex;align-items:center;gap:10px;min-height:48px}.check input{width:22px;height:22px;flex:none}select,input[type=search]{min-height:56px;padding:10px 14px;border:2px solid var(--color-border);border-radius:var(--radius-control);background:var(--color-surface);color:var(--color-text);font:inherit}fieldset{border:0;padding:0;margin:0}legend{font-weight:700;margin-bottom:8px}.passage{white-space:pre-line;font-size:clamp(22px,2.3vw,34px);font-weight:700}.reference{padding:14px;border:1px solid var(--color-border);border-radius:var(--radius-control)}.reference summary{min-height:48px;cursor:pointer;font-weight:700}.reference p{margin:12px 0}.map{display:flex;flex-wrap:wrap;gap:8px}.map button{min-width:54px;min-height:54px;font:inherit;border:2px solid var(--color-border);border-radius:10px;background:var(--color-surface);color:var(--color-text)}.map button[aria-current=step]{border-color:currentColor}.map button:focus-visible{outline:3px solid currentColor}@media(max-width:700px){.settings,.sections{grid-template-columns:1fr}}
</style>
