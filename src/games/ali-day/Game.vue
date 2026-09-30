<script setup>
import { computed, ref } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import TouchButton from '../../components/TouchButton.vue'
import ChoiceGroup from '../../components/ChoiceGroup.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import ProgressMeter from '../../components/ProgressMeter.vue'
import { routine, questions, text, explanation } from './data.js'
const mode = ref('clock'), phase = ref('intro'), qi = ref(0), score = ref(0), selected = ref(null), options = ref([])
const orderPhase = ref('intro'), expected = ref(0), orderSelected = ref(null), order = ref([]), ordered = ref([])
const question = computed(() => questions[qi.value]), event = computed(() => routine[question.value.correct])
const correct = computed(() => selected.value === question.value.correct)
const orderCorrect = computed(() => orderSelected.value === expected.value)
const shuffle = items => { const result = [...items]; for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]] } return result }
function showQuestion() {
 selected.value = null; phase.value = 'question'
 const choices = shuffle(routine.map((r, i) => i).filter(i => i !== question.value.correct)).slice(0, 3)
 options.value = shuffle([question.value.correct, ...choices]).map(i => ({ value: i, label: question.value.type ? routine[i].t : `${routine[i].e} ${routine[i].ru} / ${routine[i].kz}` }))
}
function start() { qi.value = 0; score.value = 0; showQuestion() }
function answer(value) { if (phase.value !== 'question') return; selected.value = value; if (correct.value) score.value++; phase.value = 'feedback' }
function next() { if (qi.value === questions.length - 1) phase.value = 'result'; else { qi.value++; showQuestion() } }
function startOrder() { expected.value = 0; orderSelected.value = null; ordered.value = []; order.value = shuffle(routine.map((_, i) => i)); orderPhase.value = 'question' }
function answerOrder(value) { if (orderPhase.value !== 'question' || ordered.value.includes(value)) return; orderSelected.value = value; orderPhase.value = 'feedback' }
function nextOrder() {
 if (orderCorrect.value) { ordered.value.push(orderSelected.value); expected.value++ }
 orderSelected.value = null; orderPhase.value = expected.value === routine.length ? 'result' : 'question'
}
</script>
<template>
 <div class="game-layout">
  <h1>☀️ День Али</h1>
  <div class="action-row" role="group" aria-label="Части игры"><TouchButton :variant="mode === 'clock' ? 'primary' : 'secondary'" :aria-pressed="mode === 'clock'" @click="mode = 'clock'">Часы / Сағат</TouchButton><TouchButton :variant="mode === 'order' ? 'primary' : 'secondary'" :aria-pressed="mode === 'order'" @click="mode = 'order'">Распорядок / Күн тәртібі</TouchButton></div>
  <SurfacePanel v-if="mode === 'clock'">
   <template v-if="phase === 'intro'"><h2>{{ text.title }}</h2><p class="game-translation" lang="kk">{{ text.titleKz }}</p><p>{{ text.choiceInstruction }}</p><p class="game-translation" lang="kk">{{ text.choiceInstructionKz }}</p><TouchButton @click="start">Начать / Бастау</TouchButton></template>
   <template v-else-if="phase === 'result'"><h2>🏆 Готово! {{ score }} из 10</h2><p lang="kk">{{ text.finished }}</p><TouchButton @click="start">{{ text.repeat }}</TouchButton></template>
   <template v-else>
    <ProgressMeter :current="qi + 1" :total="questions.length" /><p>⭐ Баллы / Ұпай: {{ score }}</p>
    <h2>{{ question.ru }}</h2><p class="game-translation" lang="kk">{{ question.kz }}</p>
    <div class="ali-task-body"><div class="clock" role="img" :aria-label="`Время / Уақыт: ${event.t}`"><span class="n12">12</span><span class="n3">3</span><span class="n6">6</span><span class="n9">9</span><span class="hand hour" :style="{ transform: `rotate(${event.h * 30}deg)` }"></span><span class="hand minute"></span><span class="dot"></span></div>
    <ChoiceGroup :options="options" :selected="selected" :disabled="phase === 'feedback'" :label="question.ru" @select="answer" /></div>
    <FeedbackMessage v-if="phase === 'feedback'" :kind="correct ? 'success' : 'error'" :title="correct ? text.correct : 'Неверно / Қате'"><p>Правильно: {{ explanation(event).ru }}</p><p lang="kk">{{ explanation(event).kz }}</p></FeedbackMessage>
    <div v-if="phase === 'feedback'" class="action-row"><TouchButton @click="next">{{ qi === questions.length - 1 ? 'Показать итог / Нәтиже' : text.next }}</TouchButton></div>
   </template>
  </SurfacePanel>
  <SurfacePanel v-else>
   <h2>{{ text.orderTitle }}</h2>
   <template v-if="orderPhase === 'intro'"><p>{{ text.orderInstruction }}</p><p class="game-translation" lang="kk">{{ text.orderInstructionKz }}</p><TouchButton @click="startOrder">Начать / Бастау</TouchButton></template>
   <template v-else-if="orderPhase === 'result'"><FeedbackMessage kind="success" :title="text.orderFinished" /><ol><li v-for="r in routine" :key="r.t">{{ r.t }} {{ r.ru }} / {{ r.kz }}</li></ol><TouchButton @click="startOrder">{{ text.repeat }}</TouchButton></template>
   <template v-else>
    <ProgressMeter :current="expected + 1" :total="routine.length" label="Событие / Оқиға" /><p>{{ text.orderInstruction }} <span lang="kk">{{ text.orderInstructionKz }}</span></p>
    <ol v-if="ordered.length"><li v-for="id in ordered" :key="id">✓ {{ routine[id].t }} {{ routine[id].ru }} / {{ routine[id].kz }}</li></ol>
    <div class="routine-options choice-group" role="group" aria-label="События дня"><button v-for="id in order" :key="id" class="choice-group__option" :class="{ 'choice-group__option--selected': orderSelected === id }" :aria-pressed="orderSelected === id" :disabled="orderPhase === 'feedback' || ordered.includes(id)" @click="answerOrder(id)"><b>{{ ordered.includes(id) ? '✓ ' : '' }}{{ routine[id].e }} {{ routine[id].t }}</b><br>{{ routine[id].ru }}<br><span class="game-translation" lang="kk">{{ routine[id].kz }}</span></button></div>
    <FeedbackMessage v-if="orderPhase === 'feedback'" :kind="orderCorrect ? 'success' : 'error'" :title="orderCorrect ? text.correct : text.wrongOrder"><p>Следующее событие: {{ explanation(routine[expected]).ru }}</p><p lang="kk">{{ explanation(routine[expected]).kz }}</p></FeedbackMessage>
    <div class="action-row"><TouchButton v-if="orderPhase === 'feedback'" @click="nextOrder">{{ text.next }}</TouchButton><TouchButton variant="secondary" @click="startOrder">{{ text.repeat }}</TouchButton></div>
   </template>
  </SurfacePanel>
 </div>
</template>
<style scoped>
.ali-task-body { display: grid; grid-template-columns: 210px minmax(0,1fr); align-items: center; gap: var(--space-3); }
.clock { width: 210px; height: 210px; border: 8px solid var(--color-primary-dark); border-radius: 50%; margin: 20px auto; position: relative; background: var(--color-surface); }
.clock > span:not(.hand):not(.dot) { position: absolute; font-weight: 800; font-size: 22px; }
.n12 { top: 5px; left: 83px; }.n3 { right: 9px; top: 79px; }.n6 { bottom: 4px; left: 89px; }.n9 { left: 9px; top: 79px; }
.hand { position: absolute; left: 94px; bottom: 97px; transform-origin: bottom center; border-radius: 8px; }.hour { width: 7px; height: 57px; background: var(--color-primary-dark); }.minute { width: 4px; height: 78px; background: var(--color-error); }.dot { position: absolute; width: 15px; height: 15px; background: var(--color-primary-dark); border-radius: 50%; left: 90px; top: 90px; }
.routine-options { grid-template-columns: repeat(3, minmax(0, 1fr)); }
@media(max-width: 900px) { .routine-options { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media(max-width: 600px) { .ali-task-body { grid-template-columns: 1fr; }.routine-options { grid-template-columns: 1fr; } }
</style>
