<script setup>
import { computed, ref } from 'vue'
import SurfacePanel from './SurfacePanel.vue'
import TouchButton from './TouchButton.vue'
import FeedbackMessage from './FeedbackMessage.vue'
import ProgressMeter from './ProgressMeter.vue'
import LetterSnakeBoard from './LetterSnakeBoard.vue'
import { createWordSnakeFields, russianAlphabet } from '../games/word-snake.js'
const props = defineProps({ showTargets: { type: Boolean, default: true }, vocabulary: { type: Array, required: true }, wordsPerField: { type: Number, default: 3 }, alphabet: { type: String, default: russianAlphabet }, title: { type: String, default: 'Найди слова змейкой' }, resultTitle: { type: String, default: 'Все слова найдены!' }, resultText: { type: String, default: 'Ты прочитал все слова по буквенным змейкам.' }, repeatLabel: { type: String, default: 'Повторить' } })

const fields = ref([]), index = ref(0), path = ref([]), found = ref([]), foundCells = ref([])
const feedback = ref(null), notice = ref(''), finished = ref(false)
const foundPaths = ref([])
const field = computed(() => fields.value[index.value])
const word = computed(() => path.value.map(cell => field.value.letters[cell]).join(''))
const totalFound = computed(() => fields.value.slice(0, index.value).reduce((total, field) => total + field.words.length, 0) + found.value.length)

function reset() {
  fields.value = createWordSnakeFields(props.vocabulary, { wordsPerField: props.wordsPerField, alphabet: props.alphabet }); index.value = 0; finished.value = false
  clearField()
}
function clearField() { path.value = []; found.value = []; foundCells.value = []; foundPaths.value = []; feedback.value = null; notice.value = '' }
function select(cell) {
  if (feedback.value || finished.value) return
  notice.value = ''
  const last = path.value.at(-1)
  if (last === cell) { path.value.pop(); return }
  if (path.value.includes(cell)) { notice.value = 'Эта буква уже выбрана. Последнее нажатие отменяет шаг.'; return }
  if (last !== undefined && Math.abs(Math.floor(last / 4) - Math.floor(cell / 4)) + Math.abs(last % 4 - cell % 4) !== 1) {
    notice.value = 'Выбери соседнюю букву: сверху, снизу, слева или справа.'; return
  }
  path.value.push(cell)
}
function check() {
  if (feedback.value) return
  if (!path.value.length) { notice.value = 'Выбери буквы слова по порядку.'; return }
  notice.value = ''
  const match = field.value.words.find(entry => entry.text === word.value)
  if (match && !found.value.includes(match.id)) {
    found.value.push(match.id)
    foundPaths.value.push([...path.value])
    foundCells.value = [...new Set([...foundCells.value, ...path.value])]
    feedback.value = { kind: 'success', title: `Верно! Найдено слово: ${match.label}.`, text: `${path.value.map(cell => field.value.letters[cell]).join(' → ')}. Буквы идут по соседним клеткам и образуют слово.` }
  } else {
    feedback.value = { kind: 'error', title: match ? 'Это слово уже найдено.' : `Получилось «${word.value}». Попробуй ещё раз.`, text: props.showTargets ? `На этом поле спрятаны: ${field.value.words.map(entry => entry.label).join(', ')}. Читай буквы по порядку, без диагоналей.` : 'Вспомни нужные слова и читай буквы по порядку, без диагоналей.' }
  }
}
function next() {
  if (!feedback.value) return
  if (found.value.length === field.value.words.length) {
    if (index.value === fields.value.length - 1) { finished.value = true; return }
    index.value++; clearField()
  } else { path.value = []; feedback.value = null; notice.value = '' }
}
reset()
</script>

<template>
  <SurfacePanel v-if="!finished">
    <h2>{{ title }}</h2>
    <ProgressMeter :current="index + 1" :total="fields.length" label="Поле" />
    <div class="word-snake-layout">
      <LetterSnakeBoard :letters="field.letters" :path="path" :found-cells="foundCells" :found-paths="foundPaths" :disabled="Boolean(feedback)" @select="select" />
      <div class="word-snake-controls">
        <ul v-if="showTargets || found.length" class="word-snake-targets" :aria-label="showTargets ? 'Слова для поиска' : 'Найденные слова'"><li v-for="entry in field.words.filter(entry => showTargets || found.includes(entry.id))" :key="entry.id">{{ found.includes(entry.id) ? '✓' : '○' }} {{ entry.label }}<span v-if="found.includes(entry.id)"> — найдено</span></li></ul>
        <p class="word-snake-word" role="status">{{ word || 'Выбери соседние буквы по порядку' }}</p>
        <p>Найдено на поле: {{ found.length }} из {{ field.words.length }} · Всего: {{ totalFound }} из {{ vocabulary.length }}</p>
        <FeedbackMessage v-if="notice" :title="notice" />
        <FeedbackMessage v-if="feedback" :kind="feedback.kind" :title="feedback.title">{{ feedback.text }}</FeedbackMessage>
        <div class="action-row">
          <template v-if="!feedback">
            <TouchButton @click="check">Проверить</TouchButton>
            <TouchButton variant="secondary" :disabled="!path.length" @click="path = []; notice = ''">Сбросить слово</TouchButton>
          </template>
          <TouchButton v-else @click="next">{{ found.length === field.words.length ? (index === fields.length - 1 ? 'Посмотреть результат' : 'Дальше') : feedback.kind === 'success' ? 'Искать дальше' : 'Попробовать снова' }}</TouchButton>
        </div>
      </div>
    </div>
  </SurfacePanel>
  <SurfacePanel v-else>
    <h2>{{ resultTitle }}</h2>
    <p>{{ resultText }}</p>
    <TouchButton @click="reset">{{ repeatLabel }}</TouchButton>
  </SurfacePanel>
</template>

<style scoped>
.word-snake-layout { display: grid; grid-template-columns: minmax(228px, 360px) minmax(0, 1fr); align-items: start; gap: var(--space-4); margin-top: var(--space-3); }
.word-snake-controls { min-width: 0; }
.word-snake-targets { display: flex; flex-wrap: wrap; gap: 12px 24px; list-style: none; padding: 0; margin: 0 0 var(--space-3); font-weight: 750; }
.word-snake-targets li { max-width: 100%; overflow-wrap: anywhere; }
.word-snake-word { min-height: 48px; overflow-wrap: anywhere; font-weight: 800; }
@media(max-width:699px) { .word-snake-layout { grid-template-columns: minmax(0, 1fr); }.word-snake-controls { grid-row: 1; } }
</style>
