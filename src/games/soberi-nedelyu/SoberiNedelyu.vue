<script setup>
import { computed, ref } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import TouchButton from '../../components/TouchButton.vue'
import SequenceBoard from '../../components/SequenceBoard.vue'
import { days, vocabulary, ui } from './data.js'
const attempt = ref(0)
const stage = ref('editing'), bank = ref([]), slots = ref(Array(7).fill(null)), incomplete = ref(false), checks = ref(0)
const correct = computed(() => slots.value.filter((id,index) => id === days[index].id).length)
const filled = computed(() => slots.value.filter(id => id !== null).length)
const locked = computed(() => stage.value !== 'editing')
const items = computed(() => bank.value.concat(slots.value.filter(id => id !== null)).map(id => ({ id, label: days[id].ru })))
function shuffle() {
 attempt.value++
 const ids = days.map(day => day.id)
 for(let i=ids.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [ids[i],ids[j]]=[ids[j],ids[i]] }
 bank.value=ids; slots.value=Array(7).fill(null); incomplete.value=false; checks.value=0; stage.value='editing'
}
function place(index,id) {
 if(locked.value || id == null) return
 const previous=slots.value.indexOf(id), displaced=slots.value[index]
 if(previous===index) return
 if(previous>=0) slots.value[previous]=null
 bank.value=bank.value.filter(value => value!==id)
 if(displaced!==null) bank.value.push(displaced)
 slots.value[index]=id; incomplete.value=false
}
function returnToBank(id) { if(locked.value) return; const index=slots.value.indexOf(id); if(index>=0) { slots.value[index]=null; bank.value.push(id) } }
function check() { if(locked.value) return; if(filled.value<7) { incomplete.value=true; return } checks.value++; incomplete.value=false; stage.value='checked' }
function next() { stage.value=correct.value===7 ? 'finished' : 'editing' }
shuffle()
</script>
<template>
 <div class="game-layout">
  <h1>🗓️ {{ ui.title.ru }}</h1>
  <SurfacePanel v-if="stage !== 'finished'">
   <p class="week-instruction">Перетащи дни по порядку. <span class="game-translation" lang="kk">Күндерді ретімен сүйре.</span></p>
   <SequenceBoard :key="attempt" :items="items" :slots="slots" :disabled="locked" :results="stage === 'checked' ? slots.map((id,index) => id === days[index].id) : []" @place="place" @return="returnToBank" />
   <FeedbackMessage v-if="incomplete" :title="ui.incomplete.ru"><span lang="kk">{{ ui.incomplete.kz }}</span></FeedbackMessage>
   <FeedbackMessage v-if="stage === 'checked'" :kind="correct === 7 ? 'success' : 'error'" :title="correct === 7 ? ui.success.ru : `Правильно: ${correct} из 7`"><p lang="kk">{{ correct === 7 ? ui.success.kz : ui.result(correct).kz }}</p><p>{{ days.map(day => day.ru).join(' → ') }}</p><details><summary>Объяснение / Түсіндіру</summary><p>{{ ui.explanation.ru }}</p><p lang="kk">{{ ui.explanation.kz }}</p><p lang="kk">{{ days.map(day => day.kz).join(' → ') }}</p></details></FeedbackMessage>
   <div class="action-row"><TouchButton v-if="stage === 'editing'" @click="check">✓ {{ ui.check.ru }} / {{ ui.check.kz }}</TouchButton><TouchButton v-else @click="next">{{ correct === 7 ? 'Итог / Нәтиже' : 'Дальше / Келесі' }}</TouchButton><TouchButton variant="secondary" @click="shuffle">↻ {{ ui.shuffle.ru }} / {{ ui.shuffle.kz }}</TouchButton></div>
   <details class="week-help"><summary>{{ ui.vocabularyTitle.ru }} / {{ ui.vocabularyTitle.kz }}</summary><dl class="week-vocabulary"><template v-for="day in vocabulary" :key="day.ru"><dt>{{ day.ru }}</dt><dd lang="kk">{{ day.kz }}</dd></template></dl><p>{{ ui.tapInstruction.ru }}</p><p lang="kk">{{ ui.tapInstruction.kz }}</p></details>
  </SurfacePanel>
  <SurfacePanel v-else><h2>{{ ui.success.ru }}</h2><p lang="kk">{{ ui.success.kz }}</p><p>7 из 7 · Проверок: {{ checks }}</p><TouchButton @click="shuffle">Повторить / Қайта ойнау</TouchButton></SurfacePanel>
 </div>
</template>
<style scoped>
.week-instruction { margin-bottom: 12px; }
.week-help summary { min-height: 48px; padding: 10px 0; cursor: pointer; font-weight: 700; }
.week-vocabulary { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 20px; max-width: 650px; }
.week-vocabulary dt { font-weight: 700; }.week-vocabulary dd { margin: 0; }
</style>
