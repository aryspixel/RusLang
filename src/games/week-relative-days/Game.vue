<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import TouchButton from '../../components/TouchButton.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import ProgressMeter from '../../components/ProgressMeter.vue'
import { days, zones, rules, text, expectedDays, explanation } from './data.js'
const phase = ref('editing'), current = ref(Math.floor(Math.random()*7)), round = ref(1), score = ref(0), selected = ref(null), slots = ref([null,null,null]), notice = ref(''), sound = ref(false)
const answers = computed(() => expectedDays(current.value)), correct = computed(() => slots.value.every((id,index) => id === answers.value[index]))
let audio = null, soundTimers = []
function speak(message) { if(!sound.value) return;try { if(!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) { notice.value='Озвучивание недоступно. Прочитай текст на экране.';return };speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(message);u.lang='ru-RU';u.rate=.85;u.onerror=()=>{if(sound.value)notice.value='Не удалось озвучить. Прочитай текст на экране.'};speechSynthesis.speak(u) } catch { notice.value='Не удалось озвучить. Прочитай текст на экране.' } }
function tone(freq,dur,type='sine') { if(!sound.value) return; try { audio ??= new (window.AudioContext || window.webkitAudioContext)(); audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.value=freq;o.connect(g);g.connect(audio.destination);g.gain.setValueAtTime(.12,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+dur);o.start();o.stop(audio.currentTime+dur);o.onended=()=>{o.disconnect();g.disconnect()} } catch {} }
function successSound() { tone(523,.13);soundTimers.push(setTimeout(()=>tone(659,.13),130),setTimeout(()=>tone(784,.22),260)) }
function toggleSound() { sound.value=!sound.value;if(sound.value){tone(600,.12);speak('Звук включён. Сегодня '+days[current.value].ru)}else { if('speechSynthesis' in window) speechSynthesis.cancel(); soundTimers.forEach(clearTimeout);soundTimers=[] } }
function choose(id) { if(phase.value!=='editing') return;selected.value=selected.value===id?null:id;notice.value='';tone(420,.08);speak(days[id].ru) }
function place(index) { if(phase.value!=='editing') return;if(selected.value===null){notice.value=text.choose;return}slots.value[index]=selected.value;notice.value='';tone(480,.09) }
function reset() { if(phase.value!=='editing') return;slots.value=[null,null,null];selected.value=null;notice.value='';tone(300,.1) }
function check() { if(phase.value!=='editing') return;if(slots.value.some(id=>id===null)){notice.value=text.incomplete;return}notice.value='';phase.value='feedback';selected.value=null;if(correct.value){score.value++;successSound();speak('Верно! '+explanation(current.value).ru)}else{tone(180,.25,'square');speak('Есть ошибка. Попробуй ещё раз.')} }
function next() { if(!correct.value){phase.value='editing';return}if(round.value===rules.rounds){phase.value='result';return}round.value++;current.value=Math.floor(Math.random()*7);slots.value=[null,null,null];phase.value='editing';speak('Сегодня '+days[current.value].ru+'. Найди вчера, сегодня и завтра.') }
function repeat() {round.value=1;score.value=0;current.value=Math.floor(Math.random()*7);phase.value='editing';reset()}
onBeforeUnmount(()=>{soundTimers.forEach(clearTimeout);if('speechSynthesis' in window)speechSynthesis.cancel();audio?.close()})
</script>
<template>
 <div class="game-layout">
  <h1>🗓️ {{ text.title }}</h1>
  <SurfacePanel v-if="phase !== 'result'">
   <div class="relative-heading"><h2 :data-current-day="current">Сегодня {{ days[current].ru }} <span class="game-translation" lang="kk">· Бүгін {{ days[current].kz }}</span></h2><TouchButton variant="secondary" :aria-pressed="sound" @click="toggleSound">{{ sound ? text.soundOn : text.soundOff }}</TouchButton></div>
   <ProgressMeter :current="round" :total="rules.rounds" label="Раунд / Айналым" /><p>⭐ Баллы / Ұпай: {{ score }}</p>
   <p>{{ text.instruction }} <span class="game-translation" lang="kk">{{ text.instructionKz }}</span></p>
   <div class="relative-zones"><button v-for="(zone,index) in zones" :key="zone.id" class="choice-group__option relative-zone" :data-zone="zone.id" :data-value="slots[index]" :disabled="phase !== 'editing'" :aria-label="`${zone.ru}: ${slots[index] === null ? 'пусто' : days[slots[index]].ru}`" @click="place(index)"><strong>{{ zone.ru }} / {{ zone.kz }}</strong><span v-if="slots[index] !== null">{{ days[slots[index]].ru }}<br><span class="game-translation" lang="kk">{{ days[slots[index]].kz }}</span></span><span v-else>—</span><span v-if="phase === 'feedback'">{{ slots[index] === answers[index] ? '✓' : '✕' }}</span></button></div>
   <div class="relative-days" role="group" aria-label="Дни недели"><button v-for="day in days" :key="day.id" class="choice-group__option relative-day" :class="{ 'choice-group__option--selected': selected === day.id }" :data-day="day.id" :aria-pressed="selected === day.id" :disabled="phase !== 'editing'" @click="choose(day.id)">{{ day.ru }}<small class="game-translation" lang="kk">{{ day.kz }}</small></button></div>
   <FeedbackMessage v-if="notice" :title="notice" />
   <FeedbackMessage v-if="phase === 'feedback'" :kind="correct ? 'success' : 'error'" :title="correct ? '🎉 Верно! / Дұрыс!' : text.wrong"><p>{{ explanation(current).ru }}</p><p lang="kk">{{ explanation(current).kz }}</p></FeedbackMessage>
   <div class="action-row"><TouchButton v-if="phase === 'editing'" @click="check">{{ text.check }}</TouchButton><TouchButton v-else @click="next">{{ correct ? text.next : 'Дальше: исправить / Әрі қарай: түзету' }}</TouchButton><TouchButton v-if="phase === 'editing'" variant="secondary" @click="reset">{{ text.reset }}</TouchButton></div>
  </SurfacePanel>
  <SurfacePanel v-else><h2>{{ text.finish }}</h2><p>{{ score }} из {{ rules.rounds }} · {{ text.finishKz }}</p><TouchButton @click="repeat">Повторить / Қайта ойнау</TouchButton></SurfacePanel>
 </div>
</template>
<style scoped>
.relative-heading { display: flex; align-items: start; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.relative-heading h2 { max-width: 900px; }.relative-zones { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 12px; margin: 16px 0; }
.relative-zone { display: flex; flex-direction: column; text-align: center; justify-content: space-between; min-height: 140px; gap: 10px; }
.relative-days { display: grid; grid-template-columns: repeat(7,minmax(0,1fr)); gap: 10px; }.relative-day { min-width: 0; padding: 10px 4px; text-align: center; font-size: clamp(15px,1.2vw,20px); }.relative-day small { display: block; font-size: .85em; }
@media(max-width:1099px) { .relative-days { grid-template-columns: repeat(4,minmax(0,1fr)); } }
@media(max-width:599px) { .relative-zones { grid-template-columns: 1fr; }.relative-zone { min-height: 100px; }.relative-days { grid-template-columns: repeat(2,minmax(0,1fr)); } }
</style>

