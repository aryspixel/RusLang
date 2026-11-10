<script setup>
import { computed, reactive, ref } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import TouchButton from '../../components/TouchButton.vue'
import ChoiceGroup from '../../components/ChoiceGroup.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import ProgressMeter from '../../components/ProgressMeter.vue'
import { tasks, sentences, directions } from './data.js'

const blocks = [
  { id: 'sentence', title: '1 · Собери предложение', instruction: 'Нажимай слова по порядку. Слово в ответе можно нажать, чтобы убрать.', items: sentences },
  { id: 'choice', title: '2 · Выбери предлог', instruction: 'Прочитай ситуацию и выбери подходящий предлог.', items: tasks },
  { id: 'direction', title: '3 · Где или куда?', instruction: 'Сравни место и направление. Выбери предложение, которое подходит к ситуации.', items: directions },
]
const mode = ref('sentence')
const states = reactive(Object.fromEntries(blocks.map(block => [block.id, { index: 0, selected: null, words: [], checked: false, finished: false, score: 0 }])))
const block = computed(() => blocks.find(item => item.id === mode.value))
const state = computed(() => states[mode.value])
const task = computed(() => block.value.items[state.value.index])
const options = computed(() => (task.value.options || []).map((label, value) => ({ label, value })))
const sentenceAnswer = computed(() => task.value.answer.map(index => task.value.words[index]).join(' '))
const correct = computed(() => mode.value === 'sentence'
  ? state.value.words.join(',') === task.value.answer.join(',')
  : state.value.selected === task.value.answer)

function addWord(index) {
  if (!state.value.checked && !state.value.words.includes(index)) state.value.words.push(index)
}
function removeWord(position) {
  if (!state.value.checked) state.value.words.splice(position, 1)
}
function check() {
  if (state.value.checked || (mode.value === 'sentence' ? state.value.words.length !== task.value.words.length : state.value.selected === null)) return
  state.value.checked = true
  if (correct.value) state.value.score++
}
function next() {
  if (!state.value.checked) return
  if (state.value.index === block.value.items.length - 1) { state.value.finished = true; return }
  state.value.index++
  state.value.selected = null
  state.value.words = []
  state.value.checked = false
}
function replay() {
  Object.assign(state.value, { index: 0, selected: null, words: [], checked: false, finished: false, score: 0 })
}
</script>

<template>
  <div class="game-layout">
    <h1>Предлоги</h1>
    <div class="action-row" role="group" aria-label="Блоки тренажёра">
      <TouchButton v-for="item in blocks" :key="item.id" :variant="mode === item.id ? 'primary' : 'secondary'" :aria-pressed="mode === item.id" @click="mode = item.id">{{ item.title }}</TouchButton>
    </div>
    <SurfacePanel v-if="!state.finished">
      <p>{{ block.instruction }}</p>
      <ProgressMeter :current="state.index + 1" :total="block.items.length" label="Задание" />
      <p class="scene"><strong>Ситуация:</strong> {{ task.scene || task.cue }}</p>
      <h2 v-if="task.prompt">{{ task.prompt }}</h2>
      <h2 v-else-if="mode === 'sentence'">Составь предложение</h2>
      <h2 v-else>Выбери подходящее предложение</h2>
      <template v-if="mode === 'sentence'">
        <p>Слова:</p>
        <div class="word-row" role="group" aria-label="Слова для предложения">
          <button v-for="(word, index) in task.words" :key="index" type="button" class="word-card" :disabled="state.checked || state.words.includes(index)" @click="addWord(index)">{{ word }}</button>
        </div>
        <p>Твоё предложение:</p>
        <div class="word-row answer-row" role="group" aria-label="Составленное предложение">
          <button v-for="(wordIndex, position) in state.words" :key="wordIndex" type="button" class="word-card" :disabled="state.checked" :aria-label="'Убрать слово ' + task.words[wordIndex]" @click="removeWord(position)">{{ task.words[wordIndex] }}</button>
          <span v-if="!state.words.length">Нажми первое слово</span>
        </div>
      </template>
      <ChoiceGroup v-else :options="options" :selected="state.selected" :disabled="state.checked" :label="task.prompt || task.cue" @select="state.selected = $event" />
      <FeedbackMessage v-if="state.checked" :kind="correct ? 'success' : 'error'" :title="correct ? 'Верно!' : 'Пока неверно'">
        <p>Правильный ответ: {{ mode === 'sentence' ? sentenceAnswer : task.options[task.answer] }}</p>
        <p>{{ task.explanation }}</p>
      </FeedbackMessage>
      <div class="action-row">
        <TouchButton v-if="!state.checked" :disabled="mode === 'sentence' ? state.words.length !== task.words.length : state.selected === null" @click="check">Проверить</TouchButton>
        <TouchButton v-else @click="next">{{ state.index === block.items.length - 1 ? 'Показать итог' : 'Дальше' }}</TouchButton>
      </div>
    </SurfacePanel>
    <SurfacePanel v-else>
      <h2>Блок завершён</h2>
      <p>Верных ответов: {{ state.score }} из {{ block.items.length }}.</p>
      <div class="action-row">
        <TouchButton @click="replay">Пройти блок ещё раз</TouchButton>
        <TouchButton v-if="blocks.findIndex(item => item.id === mode) < blocks.length - 1" variant="secondary" @click="mode = blocks[blocks.findIndex(item => item.id === mode) + 1].id">Следующий блок</TouchButton>
      </div>
    </SurfacePanel>
  </div>
</template>

<style scoped>
.scene { padding: 18px; border-radius: var(--radius-control); background: var(--color-selected); font-size: 1.15em; }
.word-row { display: flex; flex-wrap: wrap; gap: 12px; margin: 12px 0 20px; }
.answer-row { min-height: 76px; padding: 12px; border: 2px solid var(--color-border); border-radius: var(--radius-control); align-items: center; }
.word-card { min-height: 64px; padding: 10px 22px; border: 2px solid var(--color-border); border-radius: var(--radius-control); background: var(--color-surface); color: inherit; font: inherit; cursor: pointer; }
.word-card:disabled { opacity: .55; cursor: default; }
.word-card:focus-visible { outline: 3px solid var(--color-focus); outline-offset: 2px; }
</style>
