<script setup>
import { computed, ref } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import TouchButton from '../../components/TouchButton.vue'
import ChoiceGroup from '../../components/ChoiceGroup.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import ProgressMeter from '../../components/ProgressMeter.vue'
import { colors, forms, tasks } from './data.js'

const index = ref(0)
const selected = ref(null)
const selectedNoun = ref(null)
const checked = ref(false)
const finished = ref(false)
const score = ref(0)
const task = computed(() => tasks[index.value])
const color = computed(() => colors.find(item => item.id === task.value.color))
const correctWord = computed(() => task.value.stage === 1 ? color.value.name : forms[task.value.color][task.value.gender])
const correct = computed(() => selected.value === correctWord.value && (task.value.stage !== 3 || selectedNoun.value === task.value.noun))
const wordOptions = computed(() => {
  if (task.value.stage === 1) return colors.map(item => ({ value: item.name, label: item.name }))
  return Object.values(forms[task.value.color]).map(word => ({ value: word, label: word }))
})
const nounOptions = computed(() => {
  const nouns = ['мяч', 'книга', 'яблоко', 'лист', 'чашка', 'перо']
  return nouns.map(word => ({ value: word, label: word }))
})
const stageTitle = computed(() => ['Узнай цвет', 'Подбери слово', 'Собери описание'][task.value.stage - 1])

function check() {
  if (checked.value || selected.value === null || (task.value.stage === 3 && selectedNoun.value === null)) return
  checked.value = true
  if (correct.value) score.value++
}
function next() {
  if (!checked.value) return
  if (index.value === tasks.length - 1) finished.value = true
  else { index.value++; selected.value = null; selectedNoun.value = null; checked.value = false }
}
function repeat() {
  index.value = 0; selected.value = null; selectedNoun.value = null
  checked.value = false; finished.value = false; score.value = 0
}
</script>

<template>
  <div class="game-layout">
    <h1>Цветная мастерская</h1>
    <p>Рассмотри цвет, выбери ответ и нажми «Проверить». После разбора нажми «Дальше».</p>

    <SurfacePanel v-if="finished" class="game-layout">
      <h2>Мастерская готова!</h2>
      <p>Верных ответов: {{ score }} из {{ tasks.length }}.</p>
      <h3>Расскажи сам</h3>
      <p>Выбери три предмета вокруг себя. Назови каждый предмет и его цвет: «Это красная книга».</p>
      <p>Проверь себя: название цвета подходит к слову «он», «она» или «оно»?</p>
      <div class="action-row"><TouchButton @click="repeat">Пройти заново</TouchButton></div>
    </SurfacePanel>

    <SurfacePanel v-else class="game-layout">
      <ProgressMeter :current="index + 1" :total="tasks.length" label="Задание" />
      <h2>{{ task.stage }} · {{ stageTitle }}</h2>
      <p class="color-prompt">{{ task.stage === 1 ? 'Как называется этот цвет?' : task.prompt }}</p>
      <div class="paint-sample" :style="{ backgroundColor: color.swatch }" role="img" :aria-label="`Образец цвета для задания ${index + 1}`" />
      <p v-if="task.stage > 1">{{ task.stage === 2 ? `Предмет: ${task.noun}. Выбери подходящее слово.` : 'Выбери сначала слово о цвете, затем название предмета.' }}</p>
      <p v-if="task.stage === 3" class="phrase-preview">{{ selected || '…' }} {{ selectedNoun || '…' }}</p>
      <ChoiceGroup :options="wordOptions" :selected="selected" :disabled="checked" :label="task.stage === 1 ? 'Название цвета' : 'Слово о цвете'" @select="selected = $event" />
      <template v-if="task.stage === 3">
        <h3>Предмет</h3>
        <ChoiceGroup :options="nounOptions" :selected="selectedNoun" :disabled="checked" label="Название предмета" @select="selectedNoun = $event" />
      </template>
      <FeedbackMessage v-if="checked" :kind="correct ? 'success' : 'error'" :title="correct ? 'Верно!' : 'Попробуем запомнить.'">
        <p>Правильный ответ: {{ correctWord }}{{ task.stage > 1 ? ` ${task.noun}` : '' }}.</p>
        <p>{{ task.explanation }}</p>
      </FeedbackMessage>
      <div class="action-row">
        <TouchButton v-if="!checked" :disabled="selected === null || (task.stage === 3 && selectedNoun === null)" @click="check">Проверить</TouchButton>
        <TouchButton v-else @click="next">{{ index === tasks.length - 1 ? 'Показать результат' : 'Дальше' }}</TouchButton>
      </div>
    </SurfacePanel>
  </div>
</template>

<style scoped>
.color-prompt { font-size: clamp(24px, 2vw, 32px); font-weight: 750; }
.paint-sample { width: min(100%, 260px); height: 100px; border: 4px solid var(--color-text); border-radius: var(--radius-control); }
.phrase-preview { min-height: 56px; padding: 12px 18px; border: 2px solid var(--color-border); border-radius: var(--radius-control); font-size: clamp(24px, 2vw, 32px); font-weight: 750; }
</style>
