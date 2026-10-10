<script setup>
import { computed, ref } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import TouchButton from '../../components/TouchButton.vue'
import ChoiceGroup from '../../components/ChoiceGroup.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import ProgressMeter from '../../components/ProgressMeter.vue'
import SpeechControls from '../../components/SpeechControls.vue'
import storyAudio from './assets/my-room-amina-kseniya-shkaf-up.wav'
import { story, tabs, objects, prepositions, questions } from './data.js'

const mode = ref('story')
const chosen = ref([])
const objectsChecked = ref(false)
const index = ref(0)
const answers = ref(Array(questions.length).fill(null))
const checked = ref(Array(questions.length).fill(false))
const finished = ref(false)
const expectedObjects = objects.filter(item => item.correct)
const objectsCorrect = computed(() => chosen.value.length === expectedObjects.length && expectedObjects.every(item => chosen.value.includes(item.value)))
const objectAnswer = expectedObjects.map(item => item.label).join(', ')
const question = computed(() => questions[index.value])
const options = computed(() => question.value.options.map((label, value) => ({ label, value })))
const correct = computed(() => answers.value[index.value] === question.value.correct)
const score = computed(() => questions.reduce((total, item, i) => total + Number(checked.value[i] && answers.value[i] === item.correct), 0))

function toggleObject(value) {
  if (objectsChecked.value) return
  chosen.value = chosen.value.includes(value) ? chosen.value.filter(item => item !== value) : [...chosen.value, value]
}
function selectAnswer(value) {
  if (!checked.value[index.value]) answers.value[index.value] = value
}
function checkAnswer() {
  if (answers.value[index.value] !== null) checked.value[index.value] = true
}
function next() {
  if (!checked.value[index.value]) return
  if (index.value === questions.length - 1) finished.value = true
  else index.value++
}
function repeat() {
  chosen.value = []
  objectsChecked.value = false
  index.value = 0
  answers.value = Array(questions.length).fill(null)
  checked.value = Array(questions.length).fill(false)
  finished.value = false
  mode.value = 'story'
}
</script>

<template>
  <div class="game-layout">
    <h1>Моя комната</h1>
    <div class="game-tabs" role="group" aria-label="Части занятия">
      <TouchButton v-for="tab in tabs" :key="tab.id" :variant="mode === tab.id ? 'primary' : 'secondary'" :aria-pressed="mode === tab.id" @click="mode = tab.id">{{ tab.label }}</TouchButton>
    </div>

    <SurfacePanel>
      <SpeechControls :key="mode" :text="story" :src="storyAudio" label="Послушать рассказ" />
      <details class="game-help"><summary>Текст рассказа</summary><p class="room-story">{{ story }}</p></details>
    </SurfacePanel>

    <SurfacePanel v-if="mode === 'story'">
      <h2>Послушай о комнате Амины</h2>
      <p>Запомни, кто и что есть в комнате и где находится. Рассказ можно слушать несколько раз или прочитать.</p>
      <TouchButton @click="mode = 'objects'">К заданиям →</TouchButton>
    </SurfacePanel>

    <SurfacePanel v-else-if="mode === 'objects'">
      <h2>Кого и что назвала Амина?</h2>
      <p>Выбери все подходящие карточки. Повторное касание снимает выбор. Затем нажми «Проверить».</p>
      <ChoiceGroup :options="objects" :selected="chosen" :disabled="objectsChecked" label="Кого и что назвала Амина?" @select="toggleObject" />
      <FeedbackMessage v-if="objectsChecked" :kind="objectsCorrect ? 'success' : 'error'" :title="objectsCorrect ? '✓ Верно!' : 'Есть лишние карточки или чего-то не хватает'">
        <p>Правильный набор: {{ objectAnswer }}.</p><p>Все они названы в рассказе. Робота, лампы, часов и машинки в рассказе нет.</p>
      </FeedbackMessage>
      <div class="action-row">
        <TouchButton v-if="!objectsChecked" @click="objectsChecked = true">Проверить</TouchButton>
        <TouchButton v-else @click="mode = 'questions'">Дальше: где? →</TouchButton>
        <TouchButton v-if="!objectsChecked" variant="secondary" :disabled="!chosen.length" @click="chosen = []">Снять выбор</TouchButton>
      </div>
    </SurfacePanel>

    <SurfacePanel v-else-if="!finished">
      <ProgressMeter :current="index + 1" :total="questions.length" label="Вопрос" />
      <h2>{{ question.prompt }}</h2>
      <p>Выбери ответ и нажми «Проверить».</p>
      <ChoiceGroup :options="options" :selected="answers[index]" :disabled="checked[index]" :label="question.prompt" @select="selectAnswer" />
      <FeedbackMessage v-if="checked[index]" :kind="correct ? 'success' : 'error'" :title="correct ? '✓ Верно!' : 'Пока неверно. Вспомним рассказ'">
        <p>Правильный ответ: {{ question.options[question.correct] }}.</p>
        <p>В рассказе: «{{ question.quote }}» {{ question.explanation }}</p>
      </FeedbackMessage>
      <div class="action-row">
        <TouchButton v-if="!checked[index]" :disabled="answers[index] === null" @click="checkAnswer">Проверить</TouchButton>
        <TouchButton v-else @click="next">{{ index === questions.length - 1 ? 'Показать итог' : 'Дальше →' }}</TouchButton>
      </div>
    </SurfacePanel>

    <SurfacePanel v-else>
      <h2>Занятие завершено!</h2>
      <p>Ответы на вопрос «Где?»: {{ score }} из {{ questions.length }}.</p>
      <p>{{ objectsChecked ? (objectsCorrect ? 'Все карточки выбраны верно.' : 'В выборе карточек были ошибки — правильный набор есть во второй части.') : 'Задание с карточками ещё не выполнено. Можно открыть вторую часть.' }}</p>
      <details class="game-help"><summary>Разбор ответов</summary><p v-for="item in questions" :key="item.prompt"><strong>{{ item.prompt }}</strong> {{ item.options[item.correct] }}. {{ item.explanation }}</p></details>
      <div class="action-row"><TouchButton @click="repeat">Начать заново</TouchButton></div>
    </SurfacePanel>

    <details class="game-help">
      <summary>Памятка: предлоги места · Орынды білдіретін сөздер</summary>
      <p><strong>Где? — Қайда?</strong></p>
      <p v-for="item in prepositions" :key="item.ru"><strong>{{ item.ru }} — {{ item.kz }}</strong><br>{{ item.meaning }} {{ item.example }}</p>
    </details>
  </div>
</template>

<style scoped>
.room-story { max-width: 950px; line-height: 1.65; }
</style>
