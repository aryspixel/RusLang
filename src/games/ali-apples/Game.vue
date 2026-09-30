<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import TouchButton from '../../components/TouchButton.vue'
import ChoiceGroup from '../../components/ChoiceGroup.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import ProgressMeter from '../../components/ProgressMeter.vue'
import SpeechControls from '../../components/SpeechControls.vue'
import SelectionBasket from '../../components/SelectionBasket.vue'
import { story, products, questions, explanations, text } from './data.js'
const mode = ref('story'), basket = ref([]), basketPhase = ref('editing'), qi = ref(0), selected = ref(null), quizPhase = ref('question'), score = ref(0), sound = ref(false)
const basketCorrect = computed(() => basket.value.length === products.filter(p=>p.correct).length && products.filter(p=>p.correct).every(p=>basket.value.includes(p.id)))
const question = computed(()=>questions[qi.value]), correct = computed(()=>selected.value===question.value.correct)
const options = computed(()=>question.value.options.map((label,value)=>({value,label})))
const purchases = computed(()=>products.filter(p=>p.correct).map(p=>p.label).join(', '))
let audio=null, timers=[]
function tone(freq,dur=.12,type='sine') { if(!sound.value)return;try{audio ??= new (window.AudioContext || window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.value=freq;o.connect(g);g.connect(audio.destination);g.gain.setValueAtTime(.12,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+dur);o.start();o.stop(audio.currentTime+dur);o.onended=()=>{o.disconnect();g.disconnect()}}catch{} }
function goodSound() {tone(523,.1);timers.push(setTimeout(()=>tone(659,.1),110),setTimeout(()=>tone(784,.18),220))}
function toggleSound() {sound.value=!sound.value;if(sound.value)tone(660);else{timers.forEach(clearTimeout);timers=[]}}
function add(id) {if(basketPhase.value!=='editing'||basket.value.includes(id))return;basket.value.push(id);tone(440,.07)}
function remove(id) {if(basketPhase.value!=='editing')return;basket.value=basket.value.filter(value=>value!==id);tone(260,.07)}
function resetBasket() {basket.value=[];basketPhase.value='editing'}
function checkBasket() {if(basketPhase.value!=='editing')return;basketPhase.value='feedback';if(basketCorrect.value)goodSound();else tone(190,.18,'square')}
function nextBasket() {if(basketCorrect.value){basketPhase.value='complete';mode.value='quiz'}else basketPhase.value='editing'}
function answer(value) {if(quizPhase.value!=='question')return;selected.value=value;quizPhase.value='feedback';if(correct.value){score.value++;goodSound()}else tone(190,.18,'square')}
function nextQuestion() {if(qi.value===questions.length-1){quizPhase.value='result';return}qi.value++;selected.value=null;quizPhase.value='question'}
function repeat() {qi.value=0;selected.value=null;quizPhase.value='question';score.value=0;resetBasket();mode.value='story'}
onBeforeUnmount(()=>{timers.forEach(clearTimeout);audio?.close()})
</script>
<template>
 <div class="game-layout">
  <h1>{{ text.title }}</h1>
  <div class="action-row" role="group" aria-label="Части занятия"><TouchButton v-for="tab in [{id:'story',label:'1 · Текст'},{id:'basket',label:'2 · Корзина'},{id:'quiz',label:'3 · Вопросы'}]" :key="tab.id" :variant="mode === tab.id ? 'primary' : 'secondary'" :aria-pressed="mode === tab.id" @click="mode=tab.id">{{ tab.label }}</TouchButton><TouchButton variant="secondary" :aria-pressed="sound" @click="toggleSound">{{ sound ? '🔊 Звуки включены' : '🔇 Включить звуки' }}</TouchButton></div>
  <SurfacePanel v-if="mode === 'story'">
   <h2>{{ text.storyTitle }}</h2><SpeechControls :text="story" label="Послушать рассказ" :rate=".88" /><p class="ali-story">{{ story }}</p><TouchButton @click="mode='basket'">Дальше →</TouchButton>
  </SurfacePanel>
  <SurfacePanel v-else-if="mode === 'basket'">
   <h2>{{ text.basketTitle }}</h2><p>{{ text.basketInstruction }}</p>
   <SelectionBasket :products="products" :selected="basket" :disabled="basketPhase !== 'editing'" @add="add" @remove="remove" />
   <FeedbackMessage v-if="basketPhase !== 'editing'" :kind="basketCorrect ? 'success' : 'error'" :title="basketCorrect ? text.basketSuccess : text.basketWrong"><p>Покупки из рассказа: {{ purchases }}.</p></FeedbackMessage>
   <div class="action-row"><TouchButton v-if="basketPhase === 'editing'" @click="checkBasket">✓ Проверить</TouchButton><TouchButton v-else @click="nextBasket">{{ basketCorrect ? 'Вопросы →' : 'Дальше: исправить' }}</TouchButton><TouchButton variant="secondary" @click="resetBasket">↻ Сбросить</TouchButton></div>
   <details><summary>Как играть</summary><p>{{ text.basketHelp }}</p></details>
  </SurfacePanel>
  <SurfacePanel v-else-if="quizPhase !== 'result'">
   <h2>{{ text.questionTitle }}</h2><ProgressMeter :current="qi+1" :total="questions.length" label="Вопрос" /><p>Правильных ответов: {{ score }}</p><h3>{{ question.prompt }}</h3>
   <ChoiceGroup :options="options" :selected="selected" :disabled="quizPhase === 'feedback'" :label="question.prompt" @select="answer" />
   <FeedbackMessage v-if="quizPhase === 'feedback'" :kind="correct ? 'success' : 'error'" :title="correct ? text.correct : text.wrong"><p>Правильный ответ: {{ question.options[question.correct] }}.</p><p>{{ explanations[qi] }}</p></FeedbackMessage>
   <div v-if="quizPhase === 'feedback'" class="action-row"><TouchButton @click="nextQuestion">{{ qi === questions.length-1 ? 'Показать итог' : 'Следующий →' }}</TouchButton></div>
  </SurfacePanel>
  <SurfacePanel v-else><h2>🏆 Готово!</h2><p>Правильных ответов: {{ score }} из {{ questions.length }}</p><TouchButton @click="repeat">↻ Начать заново</TouchButton></SurfacePanel>
 </div>
</template>
<style scoped>
.ali-story { max-width: 950px; line-height: 1.65; padding: 18px; border-radius: var(--radius-control); background: var(--color-selected); }
details summary { min-height: 48px; padding: 10px 0; cursor: pointer; }
@media(max-width:599px) { .ali-story { padding: 12px; } }
</style>
