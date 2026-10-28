<script setup>
import { computed, ref, watch } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import TouchButton from '../../components/TouchButton.vue'
import ChoiceGroup from '../../components/ChoiceGroup.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import ProgressMeter from '../../components/ProgressMeter.vue'
import { questions, reference, sections } from './data.js'

const mode = ref('learn')
const section = ref('all')
const count = ref('10')
const session = ref(null)
const current = computed(() => session.value?.items[session.value.index])
const currentAnswer = computed(() => session.value?.answers[session.value.index])
const correctCount = computed(() => session.value?.answers.filter((a, i) => a.selected === session.value.items[i].answer).length ?? 0)
const pool = computed(() => questions.filter(q => section.value === 'all' || q.section === Number(section.value)))
const usedSections = computed(() => sections.map((name, index) => ({ name, index, count: questions.filter(q => q.section === index).length })))
function shuffle(list) { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }
function start() {
  const items = shuffle(pool.value)
  const total = count.value === 'all' ? items.length : Math.min(Number(count.value), items.length)
  const chosen = items.slice(0, total)
  session.value = { items: chosen, index: 0, answers: chosen.map(() => ({ selected: null, locked: false })), finished: false }
}
function choose(value) { if (!currentAnswer.value.locked) currentAnswer.value.selected = value }
function check(reveal = false) { if (currentAnswer.value.locked || (!reveal && currentAnswer.value.selected === null)) return; if (reveal) currentAnswer.value.selected = null; currentAnswer.value.locked = true }
function next() { if (session.value.index + 1 < session.value.items.length) session.value.index++; else session.value.finished = true }
watch([mode, section], () => { session.value = null })
</script>

<template>
  <div class="trainer">
    <header class="trainer-heading"><p class="eyebrow">Морфология · ЕНТ</p><h1>Местоимения</h1><p class="audience-label">9–11 классы · рекомендация предварительная</p></header>
    <SurfacePanel v-if="!session" class="setup">
      <p>Повторите разряды местоимений, их формы, синтаксическую роль и правописание. В обучении после проверки открывается разбор; в тесте ответы проверяются в конце.</p>
      <div class="section-list" aria-label="Разделы тренажёра"><span v-for="part in usedSections" :key="part.index" class="section-chip">{{ part.index + 1 }}. {{ part.name }} <small>({{ part.count }})</small></span></div>
      <fieldset><legend>Режим</legend><div class="row"><TouchButton :variant="mode==='learn'?'primary':'secondary'" :aria-pressed="mode==='learn'" @click="mode='learn'">Обучение</TouchButton><TouchButton :variant="mode==='test'?'primary':'secondary'" :aria-pressed="mode==='test'" @click="mode='test'">Тест</TouchButton></div></fieldset>
      <label class="field-label">Раздел<select v-model="section"><option value="all">Все разделы</option><option v-for="part in usedSections" :key="part.index" :value="String(part.index)">{{ part.name }}</option></select></label>
      <label class="field-label">Заданий в подходе<select v-model="count"><option value="10">10</option><option value="20">20</option><option value="all">Все доступные ({{ pool.length }})</option></select></label>
      <details class="reference"><summary>Краткая памятка по теме</summary><article v-for="work in reference" :key="work.title"><h3>{{ work.title }}</h3><p>{{ work.text }}</p></article></details>
      <p class="muted">{{ pool.length }} авторских заданий в выбранном разделе</p>
      <TouchButton @click="start">Начать тренировку →</TouchButton>
      <p class="muted note">Учебные задания для подготовки к ЕНТ; это не официальный вариант экзамена.</p>
    </SurfacePanel>
    <SurfacePanel v-else-if="session.finished" class="result">
      <p class="eyebrow">{{ mode==='test'?'Тест завершён':'Подход завершён' }}</p><h2>{{ correctCount }} из {{ session.items.length }} — ваш результат</h2><p>{{ Math.round(100*correctCount/session.items.length) }}% верных · {{ session.items.length-correctCount }} ошибок или пропусков</p>
      <div class="actions"><TouchButton @click="start">Пройти заново</TouchButton><TouchButton variant="secondary" @click="session=null">Новый подход</TouchButton></div>
      <details v-for="(q,i) in session.items" :key="`${i}-${q.prompt}`" class="review"><summary>{{ i+1 }}. {{ session.answers[i].selected===q.answer?'✓ Верно':session.answers[i].selected===null?'○ Пропуск':'× Ошибка' }} — {{ q.prompt }}</summary><p v-if="q.passage"><strong>{{ q.passage }}</strong></p><p>Правильный ответ: {{ q.choices[q.answer] }}</p><p>{{ q.explanation }}</p></details>
    </SurfacePanel>
    <SurfacePanel v-else class="question">
      <div class="topline"><span>{{ mode==='learn'?'Обучение':'Тест' }} · {{ sections[current.section] }}</span><TouchButton variant="secondary" @click="session=null">К настройкам</TouchButton></div>
      <ProgressMeter :current="session.index+1" :total="session.items.length" />
      <h2>{{ current.prompt }}</h2><p v-if="current.passage" class="passage">{{ current.passage }}</p>
      <ChoiceGroup :options="current.choices.map((text,i)=>({value:i,label:text}))" :selected="currentAnswer.selected" :disabled="currentAnswer.locked" label="Варианты ответа" @select="choose" />
      <FeedbackMessage v-if="currentAnswer.locked && mode==='learn'" :kind="currentAnswer.selected===current.answer?'success':'error'" :title="currentAnswer.selected===null?'Разберём ответ':currentAnswer.selected===current.answer?'Верно':'Есть ошибка'"><p><strong>Правильный ответ:</strong> {{ current.choices[current.answer] }}</p><p>{{ current.explanation }}</p></FeedbackMessage>
      <p v-if="mode==='test' && currentAnswer.locked" role="status">Ответ принят. Проверка будет в конце теста.</p>
      <div class="actions"><TouchButton v-if="!currentAnswer.locked" :disabled="currentAnswer.selected===null" @click="check()">{{ mode==='test'?'Принять ответ':'Проверить ответ' }}</TouchButton><TouchButton v-else @click="next">{{ session.index===session.items.length-1?'Результат →':'Дальше →' }}</TouchButton><TouchButton v-if="mode==='learn' && !currentAnswer.locked" variant="secondary" @click="check(true)">Показать ответ и разбор</TouchButton></div>
    </SurfacePanel>
  </div>
</template>

<style scoped>
.trainer{display:grid;gap:20px}.trainer-heading h1{margin:.2em 0}.trainer-heading p{margin:.4em 0}.setup,.question,.result{display:grid;gap:18px}.eyebrow{font-weight:700;text-transform:uppercase;letter-spacing:.06em}.row,.actions,.topline{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.topline{justify-content:space-between}.field-label{display:grid;gap:8px;font-weight:650}.field-label select{min-height:56px;padding:10px 14px;font:inherit;border:2px solid var(--color-border);border-radius:var(--radius-control);background:var(--color-surface);color:var(--color-text)}fieldset{border:0;padding:0;margin:0}legend{font-weight:700;margin-bottom:8px}.passage{font-size:clamp(24px,2.4vw,38px);font-weight:750;overflow-wrap:anywhere}.reference,.review{padding:14px;border:1px solid var(--color-border);border-radius:var(--radius-control)}.reference summary,.review summary{min-height:48px;cursor:pointer;font-weight:800}.reference article{padding:10px 0;border-top:1px solid var(--color-border)}.reference article h3{font-size:1.05em;margin:0 0 6px}.section-list{display:flex;flex-wrap:wrap;gap:8px}.section-chip{padding:8px 12px;border-radius:999px;background:var(--color-selected);font-weight:700}.section-chip small{font-weight:500}.review{margin-top:10px}.muted{color:var(--color-muted)}.note{font-size:.88em}
</style>
