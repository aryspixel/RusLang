<script setup>
import { computed, ref } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import TouchButton from '../../components/TouchButton.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import ProgressMeter from '../../components/ProgressMeter.vue'
import SequenceBoard from '../../components/SequenceBoard.vue'
import SelectionBasket from '../../components/SelectionBasket.vue'
import SnakeMonths from './SnakeMonths.vue'
import { months, seasons, lesson, shuffle } from './data.js'

const stage = ref('sequence'), attempt = ref(0)
const sequenceChecked = ref(false), seasonChecked = ref(false), seasonsComplete = ref(false)
const sequenceNotice = ref(''), seasonNotice = ref('')
const checked = computed({ get: () => stage.value === 'sequence' ? sequenceChecked.value : seasonChecked.value, set: value => { if (stage.value === 'sequence') sequenceChecked.value = value; else seasonChecked.value = value } })
const notice = computed({ get: () => stage.value === 'sequence' ? sequenceNotice.value : seasonNotice.value, set: value => { if (stage.value === 'sequence') sequenceNotice.value = value; else seasonNotice.value = value } })
const slots = ref(Array(12).fill(null)), bank = ref([]), sequenceScore = ref(0)
const seasonIndex = ref(0), selected = ref([]), seasonChoices = ref([]), answers = ref([])
const items = computed(() => bank.value.map(month => ({ id: month.id, label: month.ru, translation: month.kz, season: seasons.find(season => season.months.includes(month.id)).id })))
const season = computed(() => seasons[seasonIndex.value])
const filled = computed(() => slots.value.filter(id => id !== null).length)
const seasonCorrect = computed(() => selected.value.length === 3 && season.value.months.every(id => selected.value.includes(id)))
const seasonScore = computed(() => answers.value.filter(answer => answer.correct).length)
const names = ids => ids.map(id => months.find(month => month.id === id).ru).join(', ')

function start() {
  attempt.value++; bank.value = shuffle(months); slots.value = Array(12).fill(null)
  sequenceChecked.value = false; seasonChecked.value = false; seasonsComplete.value = false
  sequenceNotice.value = ''; seasonNotice.value = ''; sequenceScore.value = 0
  seasonIndex.value = 0; selected.value = []; answers.value = []; stage.value = 'sequence'
  seasonChoices.value = shuffle(months).map(month => ({ id: month.id, label: month.ru }))
}
function switchLevel(level) { stage.value = level === 1 ? 'sequence' : level === 3 ? 'snakes' : seasonsComplete.value ? 'finished' : 'seasons' }
function place(index, id) {
  if (checked.value || id == null) return
  const previous = slots.value.indexOf(id), displaced = slots.value[index]
  if (previous === index) return
  if (previous >= 0) slots.value[previous] = displaced
  slots.value[index] = id; notice.value = ''
}
function returnToBank(id) {
  if (checked.value) return
  const index = slots.value.indexOf(id)
  if (index >= 0) slots.value[index] = null
  notice.value = ''
}
function checkSequence() {
  if (checked.value) return
  if (filled.value !== 12) { notice.value = 'Размести все 12 месяцев, затем проверь ответ.'; return }
  sequenceScore.value = slots.value.filter((id, index) => id === index + 1).length
  checked.value = true; notice.value = ''
}
function beginSeason() {
  seasonChecked.value = false; selected.value = []; seasonNotice.value = ''
  seasonChoices.value = shuffle(months).map(month => ({ id: month.id, label: month.ru }))
  stage.value = 'seasons'
}
function addMonth(id) {
  if (!checked.value && selected.value.length < 3 && !selected.value.includes(id)) { selected.value.push(id); notice.value = '' }
}
function removeMonth(id) {
  if (!checked.value) { selected.value = selected.value.filter(value => value !== id); notice.value = '' }
}
function checkSeason() {
  if (checked.value) return
  if (selected.value.length !== 3) { notice.value = 'Выбери ровно три месяца, затем проверь ответ.'; return }
  answers.value.push({ season: season.value, selected: [...selected.value], correct: seasonCorrect.value })
  checked.value = true; notice.value = ''
}
function nextSeason() {
  if (!checked.value) return
  if (seasonIndex.value === seasons.length - 1) { seasonsComplete.value = true; stage.value = 'finished' }
  else { seasonIndex.value++; beginSeason() }
}
start()
</script>

<template>
  <div class="game-layout year-months">
    <h1>{{ lesson.title }}</h1>
    <div class="game-tabs" role="group" aria-label="Уровни тренажёра">
      <TouchButton :variant="stage === 'sequence' ? 'primary' : 'secondary'" :aria-pressed="stage === 'sequence'" @click="switchLevel(1)">1 · Собери год</TouchButton>
      <TouchButton :variant="['seasons', 'finished'].includes(stage) ? 'primary' : 'secondary'" :aria-pressed="['seasons', 'finished'].includes(stage)" @click="switchLevel(2)">2 · Месяцы сезона</TouchButton>
      <TouchButton :variant="stage === 'snakes' ? 'primary' : 'secondary'" :aria-pressed="stage === 'snakes'" @click="switchLevel(3)">3 · Найди месяцы</TouchButton>
    </div>

    <SurfacePanel v-if="stage === 'sequence'">
      <h2>Собери год: от января до декабря</h2>
      <p class="game-stats" role="status">Размещено: {{ filled }} из 12</p>
      <SequenceBoard :key="attempt" :items="items" :slots="slots" :columns="6" bank-label="Карточки месяцев с переводом" slots-label="Месяцы от первого до двенадцатого" :disabled="checked" :results="checked ? slots.map((id, index) => id === index + 1) : []" @place="place" @return="returnToBank" />
      <FeedbackMessage v-if="notice" :title="notice" />
      <FeedbackMessage v-if="checked" :kind="sequenceScore === 12 ? 'success' : 'error'" :title="sequenceScore === 12 ? 'Верно! Все месяцы на своих местах.' : `На своих местах: ${sequenceScore} из 12. Посмотри правильный порядок.`">
        <p>{{ lesson.sequenceExplanation }}</p>
        <p>{{ months.map(month => month.ru).join(' → ') }}</p>
        <p lang="kk" class="game-translation">{{ months.map(month => month.kz).join(' → ') }}</p>
      </FeedbackMessage>
      <div class="action-row">
        <TouchButton v-if="!checked" @click="checkSequence">Проверить</TouchButton>
        <TouchButton v-else @click="switchLevel(2)">Дальше</TouchButton>
      </div>
      <details class="game-help">
        <summary>Памятка: месяцы по порядку</summary>
        <ol class="year-vocabulary"><li v-for="month in months" :key="month.id">{{ month.ru }} — <span lang="kk">{{ month.kz }}</span></li></ol>
      </details>
    </SurfacePanel>

    <SurfacePanel v-else-if="stage === 'seasons'">
      <ProgressMeter :current="seasonIndex + 1" :total="4" />
      <div class="year-season-heading">
        <img class="year-season-image" :src="season.image" :alt="season.alt" width="640" height="240" />
        <div><h2>{{ season.name }}</h2><p>Выбери три месяца этого времени года.</p><p role="status">Выбрано: {{ selected.length }} из 3</p></div>
      </div>
      <SelectionBasket :products="seasonChoices" :selected="selected" :disabled="checked" :max-selected="3" group-label="Названия месяцев" basket-title="Выбранные месяцы" @add="addMonth" @remove="removeMonth" />
      <FeedbackMessage v-if="notice" :title="notice" />
      <FeedbackMessage v-if="checked" :kind="seasonCorrect ? 'success' : 'error'" :title="seasonCorrect ? 'Верно!' : 'Есть ошибка. Запомни месяцы этого сезона.'">
        <p><strong>Правильный ответ: {{ names(season.months) }}.</strong></p>
        <p>{{ season.explanation }}</p>
      </FeedbackMessage>
      <div class="action-row"><TouchButton v-if="!checked" @click="checkSeason">Проверить</TouchButton><TouchButton v-else @click="nextSeason">{{ seasonIndex === 3 ? 'Посмотреть результат' : 'Дальше' }}</TouchButton></div>
    </SurfacePanel>

    <SurfacePanel v-else-if="stage === 'finished'">
      <h2>Тренировка завершена!</h2>
      <p v-if="sequenceChecked">Месяцы на своих местах: <strong>{{ sequenceScore }} из 12</strong>.</p>
      <p v-else>Уровень 1 ещё не проверен.</p>
      <p>Сезоны без ошибок: <strong>{{ seasonScore }} из 4</strong>.</p>
      <p>{{ sequenceScore === 12 && seasonScore === 4 ? 'Ты правильно собрал год и выбрал месяцы всех четырёх сезонов!' : 'Повтори названия и попробуй ещё раз — каждый месяц найдёт своё место.' }}</p>
      <details class="game-help">
        <summary>Посмотреть правильные ответы</summary>
        <p>{{ lesson.sequenceExplanation }}</p>
        <ol class="year-vocabulary"><li v-for="month in months" :key="month.id">{{ month.ru }} — <span lang="kk">{{ month.kz }}</span></li></ol>
        <div v-for="answer in answers" :key="answer.season.id" class="year-review">
          <h3>{{ answer.season.name }} · {{ answer.correct ? 'Верно' : 'Есть ошибка' }}</h3>
          <p>Твой ответ: {{ names(answer.selected) }}.</p>
          <p>{{ answer.season.explanation }}</p>
        </div>
      </details>
      <div class="action-row"><TouchButton @click="switchLevel(3)">К 3 уровню</TouchButton><TouchButton @click="start">Повторить</TouchButton></div>
    </SurfacePanel>
    <div v-show="stage === 'snakes'"><SnakeMonths :key="attempt" /></div>
  </div>
</template>

<style scoped>
.year-vocabulary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px 32px; padding-left: 30px; }
.year-season-heading { display: flex; align-items: center; gap: var(--space-3); margin-top: var(--space-3); }
.year-season-image { width: 45%; max-width: 480px; height: auto; border-radius: var(--radius-control); }
.year-review { margin-top: var(--space-3); }
@media (max-width: 899px) { .year-vocabulary { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 599px) { .year-season-heading { flex-direction: column; align-items: stretch; }.year-season-image { width: 100%; }.year-vocabulary { grid-template-columns: 1fr; } }
</style>
