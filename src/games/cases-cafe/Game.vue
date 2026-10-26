<script setup>
import { computed, reactive, ref } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import TouchButton from '../../components/TouchButton.vue'
import ChoiceGroup from '../../components/ChoiceGroup.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import ProgressMeter from '../../components/ProgressMeter.vue'
import sourceTasks from './data.json'

const caseNames = ['Именительный падеж', 'Родительный падеж', 'Дательный падеж', 'Винительный падеж', 'Творительный падеж', 'Предложный падеж']
const modes = [
  { id: 'ending', label: '1. Выбери окончание', instruction: 'Прочитай предложение и выбери правильное окончание слова.' },
  { id: 'case', label: '2. Определи падеж', instruction: 'Прочитай предложение и определи падеж выделенного слова.' },
]
const active = ref('ending')
const sound = ref(false)
const sessions = reactive({})
let audioContext
const mode = computed(() => modes.find(item => item.id === active.value))
const session = computed(() => sessions[active.value])
const task = computed(() => session.value?.items[session.value.index])
const isCase = computed(() => active.value === 'case')
const options = computed(() => isCase.value ? caseNames.map(label => ({ value: label, label })) : task.value.forms.map(label => ({ value: label, label: `-${label}` })))
const correct = computed(() => isCase.value ? task.value.case : task.value.ending)
const answerSentence = computed(() => task.value ? `${task.value.prefix}${task.value.ending}${task.value.suffix}` : '')
const markedPrefix = computed(() => {
  const prefix = task.value?.prefix || ''
  const boundary = prefix.lastIndexOf(' ')
  return boundary < 0 ? '' : prefix.slice(0, boundary + 1)
})
const markedWord = computed(() => `${task.value?.prefix.slice(markedPrefix.value.length) || ''}${task.value?.ending || ''}`)

function shuffled(items) {
  const list = [...items]
  for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [list[i], list[j]] = [list[j], list[i]] }
  return list
}
function start(items = sourceTasks) {
  sessions[active.value] = { items: shuffled(items), index: 0, selected: null, checked: false, score: 0, misses: [], finished: false }
}
for (const item of modes) {
  active.value = item.id
  start()
}
active.value = 'ending'
function playTone(ok) {
  if (!sound.value) return
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)()
    audioContext.resume()
    const oscillator = audioContext.createOscillator(), gain = audioContext.createGain()
    oscillator.connect(gain); gain.connect(audioContext.destination)
    oscillator.frequency.setValueAtTime(ok ? 660 : 220, audioContext.currentTime)
    oscillator.frequency.setValueAtTime(ok ? 880 : 165, audioContext.currentTime + 0.1)
    gain.gain.setValueAtTime(0.06, audioContext.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.25)
    oscillator.start(); oscillator.stop(audioContext.currentTime + 0.26)
  } catch { /* Audio is optional; text feedback remains complete. */ }
}
function choose(value) {
  const s = session.value
  if (s.checked || s.finished) return
  s.selected = value
}
function check() {
  const s = session.value
  if (s.checked || s.selected === null || s.finished) return
  s.checked = true
  const ok = s.selected === correct.value
  if (ok) s.score++
  else s.misses.push({ task: task.value, selected: options.value.find(option => option.value === s.selected).label, correct: isCase.value ? correct.value : `-${correct.value}` })
  playTone(ok)
}
function next() {
  const s = session.value
  if (!s.checked) return
  if (s.index === s.items.length - 1) s.finished = true
  else { s.index++; s.selected = null; s.checked = false; s.hint = false }
}
function retryErrors() { start(session.value.misses.map(item => item.task)) }
function toggleSound() { sound.value = !sound.value; if (sound.value) playTone(true) }
</script>

<template>
  <div class="game-layout">
    <h1>Падежи в кафе</h1>
      <p>Два блока по 20 заданий. При переключении ответы сохраняются, пока открыта страница.</p>
    <nav class="action-row" aria-label="Блоки тренажёра">
      <TouchButton v-for="item in modes" :key="item.id" :variant="active === item.id ? 'primary' : 'secondary'" :aria-pressed="active === item.id" @click="active = item.id">{{ item.label }}</TouchButton>
      <TouchButton variant="secondary" :aria-pressed="sound" @click="toggleSound">Звук: {{ sound ? 'включён' : 'выключен' }}</TouchButton>
    </nav>
    <details class="game-help">
      <summary>Памятка: падежи / Септіктер</summary>
      <table><thead><tr><th>Падеж</th><th>Вопросы</th><th>Қазақша</th></tr></thead><tbody>
        <tr><td>Именительный</td><td>кто? что?</td><td>Атау: кім? не?</td></tr><tr><td>Родительный</td><td>кого? чего?</td><td>Ілік: кімнің? ненің?</td></tr><tr><td>Дательный</td><td>кому? чему?</td><td>Барыс: кімге? неге?</td></tr><tr><td>Винительный</td><td>кого? что?</td><td>Табыс: кімді? нені?</td></tr><tr><td>Творительный</td><td>кем? чем?</td><td>Көмектес: кіммен? немен?</td></tr><tr><td>Предложный</td><td>о ком? о чём? где?</td><td>Жатыс: кімде? неде? қайда?</td></tr>
      </tbody></table>
      <p>Сначала найди слово, от которого задаётся вопрос. Учти значение предлога: «в школу» — куда? (В. п.), «в школе» — где? (П. п.).</p>
      <p>Қазақ тілінде 7 септік бар. Орыс және қазақ тілдеріндегі септіктердің қолданылуы әрдайым сәйкес келе бермейді.</p>
    </details>
    <SurfacePanel v-if="session.finished" class="game-layout">
      <h2>{{ session.score === session.items.length ? 'Отличный результат!' : 'Продолжай тренироваться' }}</h2>
      <p class="cafe-score">{{ session.score }} / {{ session.items.length }}</p>
      <p>Верных ответов с первой попытки. Подсказки не уменьшают балл.</p>
      <div class="action-row"><TouchButton v-if="session.misses.length" @click="retryErrors">Повторить ошибки ({{ session.misses.length }})</TouchButton><TouchButton variant="secondary" @click="start()">Пройти блок заново</TouchButton><TouchButton variant="secondary" @click="active = isCase ? 'ending' : 'case'">{{ isCase ? 'К окончаниям' : 'К определению падежа' }}</TouchButton></div>
      <h3 v-if="session.misses.length">Разберём ещё раз</h3>
      <article v-for="(miss, index) in session.misses" :key="index" class="game-help"><p><strong>{{ miss.task.prefix }}{{ miss.task.ending }}{{ miss.task.suffix }}</strong></p><p>Ваш ответ: {{ miss.selected }}. Правильно: {{ miss.correct }}.</p><p>{{ miss.task.case }}. {{ miss.task.explanation }}</p><p>{{ miss.task.kz }}</p></article>
    </SurfacePanel>
    <SurfacePanel v-else-if="session" class="game-layout">
      <p>{{ mode.instruction }}</p>
      <ProgressMeter :current="session.index + 1" :total="session.items.length" label="Задание" />
      <p>Набрано: {{ session.score }}</p>
      <p class="cafe-sentence"><template v-if="isCase">{{ markedPrefix }}<mark>{{ markedWord }}</mark>{{ task.suffix }}</template><template v-else>{{ task.prefix }}<span class="cafe-gap">{{ session.checked ? task.ending : '…' }}</span>{{ task.suffix }}</template></p>
      <p v-if="isCase">Какой падеж у выделенного слова?</p><p v-else>Начальная форма: <strong>{{ task.noun }}</strong></p>
      <ChoiceGroup :options="options" :selected="session.selected" :disabled="session.checked" :label="mode.instruction" @select="choose" />
      <TouchButton v-if="!session.checked" variant="secondary" @click="session.hint = !session.hint">{{ isCase ? 'Подсказка: задай вопрос' : 'Подсказка: вопрос и падеж' }}</TouchButton>
      <p v-if="session.hint && !session.checked" class="cafe-hint">{{ task.explanation }}</p>
      <FeedbackMessage v-if="session.checked" :kind="session.selected === correct ? 'success' : 'error'" :title="session.selected === correct ? 'Верно!' : (isCase ? 'Правильный ответ: ' + correct : 'Правильное окончание: -' + task.ending + '. ' + task.case)">
        <p v-if="!isCase">Правильное предложение: {{ answerSentence }}</p><p>{{ task.explanation }}</p><p>{{ task.kz }}</p>
      </FeedbackMessage>
      <div class="action-row"><TouchButton v-if="!session.checked" :disabled="session.selected === null" @click="check">Проверить</TouchButton><TouchButton v-else @click="next">{{ session.index === session.items.length - 1 ? 'Результат' : 'Дальше' }} →</TouchButton></div>
    </SurfacePanel>
  </div>
</template>

<style scoped>
.cafe-sentence { font-size: clamp(25px, 3vw, 36px); line-height: 1.5; overflow-wrap: anywhere; }
.cafe-gap { display: inline-block; min-width: 56px; border-bottom: 3px solid var(--color-primary); color: var(--color-primary-dark); text-align: center; }
.cafe-hint { padding: var(--space-2); color: var(--color-muted); }
.cafe-score { font-size: 54px; font-weight: 800; color: var(--color-primary-dark); }
mark { background: var(--color-selected); color: var(--color-text); border-bottom: 4px solid var(--color-primary); padding: 0 4px; font-weight: 850; }
table { width: 100%; border-collapse: collapse; margin-block: var(--space-2); }
th, td { padding: 8px; border-bottom: 1px solid var(--color-border); text-align: left; }
@media (max-width: 600px) { th, td { padding: 6px 3px; font-size: 14px; } }
</style>
