<script setup>
import { computed, ref, watch } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import TouchButton from '../../components/TouchButton.vue'
import ChoiceGroup from '../../components/ChoiceGroup.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import ProgressMeter from '../../components/ProgressMeter.vue'
import DATA from './data.json'

const mode = ref('learn')
const section = ref('all')
const count = ref('10')
const hintEnabled = ref(true)
const session = ref(null)
const item = computed(() => session.value?.items[session.value.index])
const selected = computed(() => session.value?.answers[session.value.index]?.selected ?? null)
const locked = computed(() => Boolean(session.value?.answers[session.value.index]?.locked))
const rightCount = computed(() => session.value?.answers.filter((a, i) => a.selected === 0).length ?? 0)
const visibleQuestions = computed(() => DATA.questions.filter(q => section.value === 'all' || q.section === Number(section.value)))
const availableCount = computed(() => visibleQuestions.value.length)
const sectionWorks = computed(() => DATA.works.filter(w => section.value === 'all' || w.section === Number(section.value)))
function shuffle(list) { const a = [...list]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]} return a }
function start() {
 const pool = shuffle(visibleQuestions.value)
 const total = count.value === 'all' ? pool.length : Math.min(Number(count.value), pool.length)
 const items = pool.slice(0,total)
 session.value = { items, index: 0, answers: items.map(() => ({ selected: null, locked: false, hints: 0 })), finished: false }
}
function choose(value) { if (!locked.value) session.value.answers[session.value.index].selected = value }
function check(reveal = false) {
 const a = session.value.answers[session.value.index]
 if (a.locked || (!reveal && a.selected === null)) return
 if (reveal) a.selected = null
 a.locked = true
}
function next() { if(session.value.index + 1 < session.value.items.length) session.value.index++; else session.value.finished = true }
function jump(index) { if(mode.value === 'test' && index >=0 && index < session.value.items.length) session.value.index=index }
watch([mode, section], () => { session.value = null })
</script>

<template>
  <div class="trainer">
    <header class="trainer-heading"><p class="eyebrow">Орфография · ЕНТ</p><h1>Гласные в корне слова</h1><p class="audience-label">5–11 классы · рекомендация предварительная</p></header>
    <SurfacePanel v-if="!session" class="setup">
      <p>Тренируй проверяемые, словарные и чередующиеся гласные. В обучении после ответа открываются разбор и памятка; в тесте результат показывается в конце.</p>
      <fieldset><legend>Режим</legend><div class="row"><TouchButton :variant="mode==='learn'?'primary':'secondary'" :aria-pressed="mode==='learn'" @click="mode='learn'">Обучение</TouchButton><TouchButton :variant="mode==='test'?'primary':'secondary'" :aria-pressed="mode==='test'" @click="mode='test'">Тест</TouchButton></div></fieldset>
      <label class="field-label">Раздел<select v-model="section"><option value="all">Все разделы</option><option v-for="(name,i) in DATA.sections" :key="name" :value="String(i)">{{ name }}</option></select></label>
      <label class="field-label">Заданий в подходе<select v-model="count"><option value="10">10</option><option value="20">20</option><option value="40">40</option><option value="all">Все доступные ({{ availableCount }})</option></select></label>
      <label v-if="mode==='learn'" class="check-label"><input v-model="hintEnabled" type="checkbox"> Подсказки в обучении</label>
      <p class="muted">{{ availableCount }} заданий · {{ sectionWorks.length }} памяток</p>
      <TouchButton @click="start">Начать тренировку →</TouchButton>
    </SurfacePanel>
    <template v-else-if="session.finished">
      <SurfacePanel class="result"><p class="eyebrow">{{ mode==='test'?'Тест завершён':'Подход завершён' }}</p><h2>{{ rightCount }} из {{ session.items.length }} — ваш результат</h2><p>{{ Math.round(100*rightCount/session.items.length) }}% верных · {{ session.items.length-rightCount }} ошибок или пропусков</p>
        <div class="actions"><TouchButton @click="start">Пройти заново</TouchButton><TouchButton variant="secondary" @click="session=null">Новый подход</TouchButton></div>
        <details v-for="(q,i) in session.items" :key="q.id" class="review"><summary>{{ i+1 }}. {{ session.answers[i].selected===0?'✓ Верно':session.answers[i].selected===null?'○ Пропуск':'× Ошибка' }} — {{ q.passage }}</summary><p>Правильный ответ: {{ q.choices[0].text }}</p><p>{{ q.explanation }}</p><p v-if="q.analysis">{{ q.analysis }}</p></details>
      </SurfacePanel>
    </template>
    <SurfacePanel v-else class="question">
      <div class="topline"><span>{{ mode==='learn'?'Обучение':'Тест' }} · {{ DATA.sections[item.section] }}</span><TouchButton variant="secondary" @click="session=null">К настройкам</TouchButton></div>
      <ProgressMeter :current="session.index+1" :total="session.items.length" />
      <h2>{{ item.prompt }}</h2><p class="passage">{{ item.passage }}</p>
      <ChoiceGroup :options="item.choices.map((c,i)=>({value:i,label:c.text}))" :selected="selected" :disabled="locked" label="Варианты ответа" @select="choose" />
      <div v-if="mode==='learn' && hintEnabled && !locked" class="help"><details><summary>Памятка: {{ DATA.works.find(w=>w.id===item.work)?.title }}</summary><p>{{ DATA.works.find(w=>w.id===item.work)?.rule }}</p><p><strong>Порядок разбора:</strong> {{ item.method }}</p></details>
        <p v-for="(hint,i) in item.hints.slice(0,session.answers[session.index].hints)" :key="i">Подсказка {{ i+1 }}. {{ hint }}</p>
      </div>
      <FeedbackMessage v-if="locked && mode==='learn'" :kind="selected===0?'success':'error'" :title="selected===null?'Разберём ответ':selected===0?'Верно':'Есть ошибка'">
        <p><strong>Правильный ответ:</strong> {{ item.choices[0].text }}</p><p>{{ item.explanation }}</p><p v-if="item.analysis">{{ item.analysis }}</p><p><strong>Порядок разбора:</strong> {{ item.method }}</p>
      </FeedbackMessage>
      <p v-if="mode==='test' && locked" role="status">Ответ принят. Проверка будет в конце теста.</p>
      <div class="actions">
        <TouchButton v-if="!locked" @click="check()" :disabled="selected===null">{{ mode==='test'?'Принять ответ':'Проверить ответ' }}</TouchButton>
        <TouchButton v-else @click="next">{{ session.index===session.items.length-1?'Результат →':'Дальше →' }}</TouchButton>
        <TouchButton v-if="mode==='learn' && hintEnabled && !locked && session.answers[session.index].hints<item.hints.length" variant="secondary" @click="session.answers[session.index].hints++">Открыть подсказку</TouchButton>
        <TouchButton v-if="mode==='learn' && !locked" variant="secondary" @click="check(true)">Показать ответ и разбор</TouchButton>
      </div>
      <nav v-if="mode==='test'" class="question-map" aria-label="Переход к вопросу"><TouchButton v-for="(_,i) in session.items" :key="i" variant="secondary" :aria-current="session.index===i?'step':undefined" @click="jump(i)">{{ i+1 }}</TouchButton></nav>
    </SurfacePanel>
  </div>
</template>

<style scoped>
.trainer{display:grid;gap:20px}.trainer-heading h1{margin:.2em 0}.trainer-heading p{margin:.4em 0}.setup,.question,.result{display:grid;gap:18px}.eyebrow{font-weight:700;text-transform:uppercase;letter-spacing:.06em}.row,.actions,.topline{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.topline{justify-content:space-between}.field-label{display:grid;gap:8px;font-weight:650}.field-label select{min-height:56px;padding:10px 14px;font:inherit;border:2px solid var(--color-border);border-radius:var(--radius-control);background:var(--color-surface);color:var(--color-text)}fieldset{border:0;padding:0;margin:0}legend{font-weight:700;margin-bottom:8px}.check-label{display:flex;gap:10px;align-items:center;min-height:48px}.passage{font-size:clamp(28px,3vw,48px);font-weight:750;letter-spacing:.03em;overflow-wrap:anywhere}.help,.review{padding:14px;border:1px solid var(--color-border);border-radius:var(--radius-control)}.question-map{display:flex;gap:8px;flex-wrap:wrap}.question-map :deep(button){min-width:48px}.review{margin-top:12px}.muted{color:var(--color-muted)}
</style>
