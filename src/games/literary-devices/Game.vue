<script setup>
import { computed, reactive, ref } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import TouchButton from '../../components/TouchButton.vue'
import ChoiceGroup from '../../components/ChoiceGroup.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import ProgressMeter from '../../components/ProgressMeter.vue'
import { title, intro, help, modes } from './data.js'
const active = ref('types')
const sessions = reactive({})
const mode = computed(()=>modes.find(item=>item.id===active.value))
const session = computed(()=>sessions[active.value])
const task = computed(()=>mode.value.items[session.value?.index??0])
const options = computed(()=>(task.value.options||mode.value.labels).map((label,value)=>({label,value})))
const answer = computed(()=>session.value?.answers[session.value.index])
const score = computed(()=>session.value?.answers.filter((value,index)=>value===mode.value.items[index].answer).length??0)
function start() { sessions[active.value]={index:0,answers:[],hint:false,finished:false} }
function choose(value) { if(answer.value===undefined)session.value.answers[session.value.index]=value }
function next() { if(answer.value===undefined)return;if(session.value.index===mode.value.items.length-1)session.value.finished=true;else {session.value.index++;session.value.hint=false} }
</script>
<template>
  <div class="game-layout">
    <h1>{{ title }}</h1><p>{{ intro }}</p>
    <nav class="action-row" aria-label="Блоки тренажёра"><TouchButton v-for="item in modes" :key="item.id" :variant="active===item.id?'primary':'secondary'" :aria-pressed="active===item.id" @click="active=item.id">{{ item.label }}</TouchButton></nav>
    <details class="game-help"><summary>Памятка: типы речи и художественные средства</summary><p v-for="line in help" :key="line">{{ line }}</p></details>
    <SurfacePanel v-if="!session"><h2>{{ mode.question }}</h2><p>Прочитай текст и выбери ответ. В этом блоке {{ mode.items.length }} заданий.</p><TouchButton @click="start">Начать</TouchButton></SurfacePanel>
    <SurfacePanel v-else-if="session.finished"><h2>Блок завершён</h2><p>Верных ответов: {{ score }} из {{ mode.items.length }}.</p><details class="game-help"><summary>Разбор ответов</summary><article v-for="(item,index) in mode.items" :key="index" class="literary-review"><p>{{ item.passage }}</p><p v-if="item.question">{{ item.question }}</p><p>Твой ответ: {{ (item.options||mode.labels)[session.answers[index]] }}.</p><p>Правильный ответ: {{ (item.options||mode.labels)[item.answer] }}. {{ item.explain }}</p></article></details><div class="action-row"><TouchButton @click="start">Пройти блок заново</TouchButton></div></SurfacePanel>
    <SurfacePanel v-else>
      <ProgressMeter :current="session.index+1" :total="mode.items.length" />
      <h2>{{ mode.question }}</h2><p class="literary-passage">{{ task.passage }}</p><h3 v-if="task.question">{{ task.question }}</h3>
      <ChoiceGroup :options="options" :selected="answer??null" :disabled="answer!==undefined" label="Варианты ответа" @select="choose" />
      <FeedbackMessage v-if="answer!==undefined" :kind="answer===task.answer?'success':'error'" :title="answer===task.answer?'Верно':'Пока неверно'"><p>Правильный ответ: {{ options[task.answer].label }}.</p><p>{{ task.explain }}</p><p v-if="answer!==task.answer">{{ task.hint }}</p></FeedbackMessage>
      <FeedbackMessage v-else-if="session.hint" title="Подсказка">{{ task.hint }}</FeedbackMessage>
      <div class="action-row"><TouchButton v-if="answer!==undefined" @click="next">{{ session.index===mode.items.length-1?'Показать итог':'Следующее задание' }}</TouchButton><TouchButton variant="secondary" :aria-expanded="session.hint" @click="session.hint=!session.hint">{{ session.hint?'Скрыть подсказку':'Подсказка' }}</TouchButton></div><p>Верных ответов: {{ score }} из {{ mode.items.length }}.</p>
    </SurfacePanel>
  </div>
</template>
<style scoped>
.literary-passage { font-size:clamp(22px,1.6vw,30px);margin:var(--space-2) 0;overflow-wrap:anywhere }
.literary-review { margin:var(--space-3) 0 }
</style>
