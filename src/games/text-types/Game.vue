<script setup>
import { computed, reactive, ref } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import TouchButton from '../../components/TouchButton.vue'
import ChoiceGroup from '../../components/ChoiceGroup.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import ProgressMeter from '../../components/ProgressMeter.vue'
import { names, find, phrase, writingTasks, words, intro, reminder, writingInstruction, selfCheck } from './data.js'
const mode = ref('find')
const started = ref(false)
const modes = [{id:'find',label:'1. Узнай тип текста'},{id:'phrase',label:'2. Подбери клише'},{id:'speak',label:'3. Попробуй сам'}]
const states = reactive({find:{index:0,answers:[],hint:false,finished:false},phrase:{index:0,answers:[],hint:false,finished:false}})
const state = computed(() => states[mode.value])
const tasks = computed(() => mode.value === 'find' ? find : phrase)
const task = computed(() => tasks.value[state.value?.index ?? 0])
const answer = computed(() => state.value?.answers[state.value.index])
const options = computed(() => (mode.value === 'find' ? names : task.value.options).map((label,value)=>({label,value})))
const score = computed(() => state.value.answers.filter((value,index)=>value === tasks.value[index].answer).length)
const drafts = reactive(writingTasks.map(task => task.fields.map(()=>'')))
const samples = reactive(writingTasks.map(()=>false))
const writingFinished = ref(false)
function choose(value) { if(answer.value !== undefined) return; state.value.answers[state.value.index] = value }
function next() { if(answer.value === undefined) return; if(state.value.index === tasks.value.length-1) state.value.finished=true; else {state.value.index++;state.value.hint=false} }
function restart() { states[mode.value] = {index:0,answers:[],hint:false,finished:false} }
function restartWriting() { drafts.forEach(row=>row.fill('')); samples.fill(false);writingFinished.value=false }
</script>
<template>
  <div class="game-layout">
    <h1>Типы текста: осень</h1><p>{{ intro }}</p>
    <details class="game-help"><summary>Памятка: типы текста</summary><div class="text-reminder"><div v-for="rule in reminder" :key="rule.title"><h3>{{ rule.title }}</h3><p>{{ rule.text }}</p></div></div></details>
    <SurfacePanel v-if="!started"><p>Выбери раздел. Ответы и записи сохраняются при переключении.</p><TouchButton @click="started = true">Начать</TouchButton></SurfacePanel>
    <template v-else>
      <div class="action-row" role="group" aria-label="Разделы тренажёра"><TouchButton v-for="item in modes" :key="item.id" :variant="mode === item.id ? 'primary' : 'secondary'" :aria-pressed="mode === item.id" @click="mode = item.id">{{ item.label }}</TouchButton></div>
      <SurfacePanel v-if="mode !== 'speak' && !state.finished">
        <ProgressMeter :current="state.index+1" :total="tasks.length" :label="mode === 'find' ? 'Текст' : 'Задание'" />
        <h2>{{ mode === 'find' ? 'Какой это тип текста?' : 'Как начать ответ?' }}</h2>
        <p class="text-question">{{ task.text || task.prompt }}</p>
        <ChoiceGroup :options="options" :selected="answer ?? null" :disabled="answer !== undefined" label="Варианты ответа" @select="choose" />
        <FeedbackMessage v-if="answer !== undefined" :kind="answer === task.answer ? 'success' : 'error'" :title="answer === task.answer ? 'Верно' : 'Пока неверно'"><p>Правильный ответ: {{ options[task.answer].label }}</p><p>{{ task.why }}</p><p v-if="answer !== task.answer">{{ task.hint }}</p></FeedbackMessage>
        <FeedbackMessage v-else-if="state.hint" title="Подсказка">{{ task.hint }}</FeedbackMessage>
        <div class="action-row"><TouchButton v-if="answer !== undefined" @click="next">{{ state.index === tasks.length-1 ? 'Показать итог' : mode === 'find' ? 'Следующий текст' : 'Следующее задание' }}</TouchButton><TouchButton variant="secondary" :aria-expanded="state.hint" @click="state.hint = !state.hint">{{ state.hint ? 'Скрыть подсказку' : 'Подсказка' }}</TouchButton></div><p>Верных ответов: {{ score }}</p>
      </SurfacePanel>
      <SurfacePanel v-else-if="mode !== 'speak'"><h2>Раздел завершён</h2><p>Верных ответов: {{ score }} из {{ tasks.length }}.</p><details class="game-help"><summary>Разбор ответов</summary><div v-for="(item,index) in tasks" :key="index" class="text-review"><p>{{ item.text || item.prompt }}</p><p>Твой ответ: {{ (mode === 'find' ? names : item.options)[state.answers[index]] }}.</p><p>Правильный ответ: {{ (mode === 'find' ? names : item.options)[item.answer] }}. {{ item.why }}</p></div></details><div class="action-row"><TouchButton @click="restart">Начать заново</TouchButton></div></SurfacePanel>
      <template v-else>
        <SurfacePanel><h2>Расскажи об осени тремя способами</h2><p>{{ writingInstruction }}</p><p>{{ selfCheck }}</p></SurfacePanel>
        <SurfacePanel v-for="(item,index) in writingTasks" :key="item.name"><h3>{{ item.name }}</h3><p>{{ item.question }}</p><p><strong>Клише:</strong> {{ item.cliche }}</p><div class="text-fields"><label class="game-field" v-for="(field,j) in item.fields" :key="field" :for="`text-draft-${index}-${j}`">{{ field }}<textarea :id="`text-draft-${index}-${j}`" v-model="drafts[index][j]" placeholder="Запиши короткую мысль. Затем произнеси её вслух." /></label></div><div class="action-row"><TouchButton variant="secondary" :aria-expanded="samples[index]" @click="samples[index]=!samples[index]">{{ samples[index] ? 'Скрыть образец' : 'Показать памятку и образец' }}</TouchButton></div><FeedbackMessage v-if="samples[index]" title="Памятка"><p>{{ item.check }}</p><strong>Один из возможных ответов</strong><p>{{ item.sample }}</p></FeedbackMessage></SurfacePanel>
        <SurfacePanel><FeedbackMessage v-if="writingFinished" title="Самостоятельная работа завершена">Сравни свои тексты с памяткой и обсуди их с преподавателем. Автоматическая оценка не выставляется.</FeedbackMessage><div class="action-row"><TouchButton v-if="!writingFinished" @click="writingFinished=true">Завершить самостоятельную работу</TouchButton><TouchButton v-else @click="restartWriting">Начать заново</TouchButton></div></SurfacePanel>

      </template>
    </template>
    <details class="game-help"><summary>Словарик RU / KZ</summary><dl class="text-vocab"><template v-for="[ru,kz] in words" :key="ru"><dt>{{ ru }}</dt><dd lang="kk">{{ kz }}</dd></template></dl></details>
  </div>
</template>
<style scoped>
.text-reminder { display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-3) }
.text-question { font-size:clamp(22px,1.6vw,30px);margin-top:var(--space-3) }
.text-fields { display:grid;gap:var(--space-2) }
.text-fields label { display:grid;gap:var(--space-1);font-weight:700 }
.text-vocab { display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);margin:var(--space-2) 0 }
.text-vocab dt { font-weight:700 }.text-vocab dd { margin:0 }
.text-review { margin:var(--space-3) 0 }
@media(max-width:900px) { .text-reminder {grid-template-columns:1fr} }
</style>
