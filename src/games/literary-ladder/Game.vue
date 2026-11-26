<script setup>
import { computed, ref } from 'vue'
import source from './data.json'
import portraitNames from './portraits.json'
import { authorQuestions } from './author-quiz.js'
import { workQuestions } from './work-questions.js'
import './game.css'

const portraits = import.meta.glob('./assets/*.jpg', { eager: true, query: '?url', import: 'default' })
const storageKey = 'ent_literature_ladder_v2'
const authorStorageKey = 'literary_ladder_authors_v1'
const authors = Object.keys(source.data)
const total = Object.values(source.data).reduce((sum, works) => sum + works.length, 0)
const levels = ['', 'Базовый', 'Средний', 'Высокий']
const notes = {
  'А. С. Пушкин': 'Повторяется в программе чаще других — удобно начать подготовку именно с него.',
  'А. П. Чехов': 'Много рассказов и узнаваемые сюжетные ситуации — отличный тренажёр для ЕНТ.',
  'Н. В. Гоголь': 'Подходит для повторения героев, сатиры и авторской позиции.',
  'Л. Н. Толстой': 'Вопросы по рассказам и роману помогают отработать анализ эпизода.',
}

function readProgress() {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || '{}')
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  } catch { return {} }
}
const progress = ref(readProgress())
const author = ref(null)
const questionIndex = ref(null)
const workStep = ref(0)
const choice = ref(null)
const authorMode = ref(false)
const authorQuestionIndex = ref(0)
const authorChoice = ref(null)
const authorProgress = ref(readProgressFor(authorStorageKey))
const authorMastered = computed(() => authorQuestions.filter(item => authorProgress.value[item.id] === true).length)
const activeAuthorQuestion = computed(() => authorQuestions[authorQuestionIndex.value] || null)
const masteredWorks = computed(() => authors.reduce((sum, name) => sum + source.data[name].filter((_, index) => workDone(name, index) === 5).length, 0))
const masteredQuestions = computed(() => authors.reduce((sum, name) => sum + source.data[name].reduce((count, _, index) => count + workDone(name, index), 0), 0))
const question = computed(() => author.value !== null && questionIndex.value !== null ? workQuestions[author.value][questionIndex.value][workStep.value] || null : null)

function done(name, index, step = 0) { return progress.value[step === 0 ? `${name}|${index}` : `${name}|${index}|${step}`] === true }
function workDone(name, index) { return workQuestions[name][index].filter((_, step) => done(name, index, step)).length }
function authorDone(name) { return source.data[name].filter((_, index) => workDone(name, index) === 5).length }
function portrait(name) { return portraits[`./assets/${portraitNames[name]}`] }
function authorNote(name) { return notes[name] || 'Выбери автора и потренируйся по произведениям из школьной программы.' }
function readProgressFor(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '{}')
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  } catch { return {} }
}
function save() { try { localStorage.setItem(storageKey, JSON.stringify(progress.value)) } catch { /* Storage may be unavailable. */ } }
function saveAuthorProgress() { try { localStorage.setItem(authorStorageKey, JSON.stringify(authorProgress.value)) } catch { /* Storage may be unavailable. */ } }
function openAuthorMode() { authorMode.value = true; authorQuestionIndex.value = 0; authorChoice.value = null }
function answerAuthor(name) {
  if (authorChoice.value !== null || !activeAuthorQuestion.value) return
  authorChoice.value = name
  if (name === activeAuthorQuestion.value.author) {
    authorProgress.value = { ...authorProgress.value, [activeAuthorQuestion.value.id]: true }
    saveAuthorProgress()
  }
}
function nextAuthor() { authorQuestionIndex.value += 1; authorChoice.value = null }
function openAuthor(name) { author.value = name; questionIndex.value = null; choice.value = null }
function openQuestion(index) {
  questionIndex.value = index
  workStep.value = workQuestions[author.value][index].findIndex((_, step) => !done(author.value, index, step))
  if (workStep.value < 0) workStep.value = 0
  choice.value = null
}
function answer(index) {
  if (choice.value !== null || !question.value) return
  choice.value = index
  if (index === question.value.correct) {
    const key = workStep.value === 0 ? `${author.value}|${questionIndex.value}` : `${author.value}|${questionIndex.value}|${workStep.value}`
    progress.value = { ...progress.value, [key]: true }
    save()
  }
}
function next() {
  if (choice.value !== question.value.correct) { choice.value = null; return }
  const firstOpen = workQuestions[author.value][questionIndex.value].findIndex((_, step) => !done(author.value, questionIndex.value, step))
  workStep.value = firstOpen < 0 ? 5 : firstOpen
  choice.value = null
}
function reset() {
  if (!window.confirm('Удалить все результаты игры на этом устройстве?')) return
  progress.value = {}
  save()
  authorProgress.value = {}
  saveAuthorProgress()
  author.value = null
  questionIndex.value = null
  authorMode.value = false
}
</script>

<template>
  <div class="literary-ladder">
    <header class="ladder-header">
      <p class="eyebrow">11 КЛАСС · ПОДГОТОВКА К ЕНТ</p>
      <h1>Литературная лестница</h1>
      <p>Выбери писателя, открой произведение и проверь свои знания. Каждая правильная ступень приближает к результату.</p>
      <div class="ladder-badges"><span>12 авторов</span><span>{{ total * 5 + authorQuestions.length }} заданий</span><span>Твой личный прогресс</span></div>
    </header>

    <div class="ladder-stats" aria-label="Прогресс">
      <div><strong>{{ masteredWorks }} / {{ total }}</strong><span>Освоено произведений</span></div>
      <div><strong>{{ Math.round(100 * masteredQuestions / (total * 5)) }}%</strong><span>Общий прогресс</span></div>
      <div><strong>{{ masteredQuestions }}</strong><span>Вопросов по произведениям</span></div>
      <div><strong>{{ authors.length }}</strong><span>Авторов в библиотеке</span></div>
    </div>

    <section v-if="authorMode" aria-labelledby="ladder-author-quiz-title">
      <button type="button" class="touch-button touch-button--secondary" @click="authorMode = false">← Библиотека авторов</button>
      <div class="ladder-section-heading"><div><h2 id="ladder-author-quiz-title">Угадай автора</h2><p>Определи автора по произведению. Варианты подобраны среди писателей близких эпох и жанров. После ответа прочитай пояснение и переходи дальше.</p></div><strong>{{ authorMastered }} из {{ authorQuestions.length }} освоено</strong></div>
      <section v-if="activeAuthorQuestion" class="ladder-question" aria-labelledby="ladder-author-question-title">
        <p class="eyebrow">Задание {{ authorQuestionIndex + 1 }} из {{ authorQuestions.length }}</p>
        <h3 id="ladder-author-question-title">Кто автор произведения «{{ activeAuthorQuestion.title }}»?</h3>
        <div class="ladder-options"><button v-for="name in activeAuthorQuestion.options" :key="name" type="button" :disabled="authorChoice !== null" :class="{ 'is-correct': authorChoice !== null && name === activeAuthorQuestion.author, 'is-wrong': authorChoice === name && name !== activeAuthorQuestion.author }" @click="answerAuthor(name)">{{ name }}</button></div>
        <div v-if="authorChoice !== null" class="ladder-feedback" role="status"><strong>{{ authorChoice === activeAuthorQuestion.author ? 'Верно!' : 'Пока неверно.' }}</strong> Правильный ответ: {{ activeAuthorQuestion.author }}. {{ activeAuthorQuestion.explanation }}</div>
        <button v-if="authorChoice !== null" type="button" class="touch-button" @click="nextAuthor">{{ authorQuestionIndex + 1 === authorQuestions.length ? 'К результату →' : 'Дальше →' }}</button>
      </section>
      <section v-else class="ladder-question" aria-labelledby="ladder-result-title"><h3 id="ladder-result-title">Все задания пройдены</h3><p>Освоено: {{ authorMastered }} из {{ authorQuestions.length }}. Неверные ответы можно повторить в новом прохождении.</p><button type="button" class="touch-button" @click="openAuthorMode">Пройти ещё раз</button></section>
    </section>

    <section v-else-if="!author" aria-labelledby="ladder-library">
      <div class="ladder-mode-card"><div><h2>Угадай автора</h2><p>{{ authorQuestions.length }} заданий: по названию произведения выбери писателя. {{ authorMastered }} освоено.</p></div><button type="button" class="touch-button" @click="openAuthorMode">Начать →</button></div>
      <div class="ladder-section-heading"><div><h2 id="ladder-library">Библиотека авторов</h2><p>Сначала удобно пройти Пушкина, Гоголя, Чехова и Толстого — у них в школьной программе встречается несколько произведений.</p></div><button type="button" class="touch-button touch-button--secondary" @click="reset">Сбросить результаты</button></div>
      <div class="ladder-authors">
        <button v-for="name in authors" :key="name" type="button" class="ladder-author" @click="openAuthor(name)">
          <img :src="portrait(name)" :alt="`Портрет: ${name}`">
          <span class="ladder-author-text"><strong>{{ name }}</strong><small>{{ source.meta[name].tag }} · Шкала автора</small><span>{{ authorNote(name) }}</span><span class="ladder-progress">{{ authorDone(name) }} из {{ source.data[name].length }} произведений · {{ Math.round(authorDone(name) * 100 / source.data[name].length) }}%</span></span>
        </button>
      </div>
    </section>

    <section v-else aria-labelledby="ladder-author-title">
      <button type="button" class="touch-button touch-button--secondary" @click="author = null; questionIndex = null">← Все авторы</button>
      <div class="ladder-author-heading"><img :src="portrait(author)" :alt="`Портрет: ${author}`"><div><p class="eyebrow">Личная шкала автора</p><h2 id="ladder-author-title">{{ author }}</h2><p>{{ authorNote(author) }}</p><strong>{{ authorDone(author) }} / {{ source.data[author].length }} · {{ Math.round(authorDone(author) * 100 / source.data[author].length) }}%</strong></div></div>
      <p>Выбирай произведение и отвечай на пять вопросов. Прогресс засчитывается только за верный ответ, а неверный вопрос можно сразу повторить.</p>
      <div class="ladder-works">
        <button v-for="(work, index) in source.data[author]" :key="index" type="button" :aria-pressed="questionIndex === index" @click="openQuestion(index)"><strong>{{ workDone(author, index) === 5 ? '✓' : String(index + 1).padStart(2, '0') }} {{ work[0] }}</strong><small>{{ workDone(author, index) }} из 5 вопросов · {{ workDone(author, index) === 5 ? 'Освоено' : 'В процессе' }}</small></button>
      </div>
      <section v-if="question" class="ladder-question" aria-labelledby="ladder-question-title">
        <p class="eyebrow">{{ question.title }} · Вопрос {{ workStep + 1 }} из 5 · {{ levels[question.level] }} уровень</p>
        <h3 id="ladder-question-title">{{ question.prompt }}</h3>
        <div class="ladder-options">
          <button v-for="(option, index) in question.options" :key="index" type="button" :disabled="choice !== null" :class="{ 'is-correct': choice !== null && index === question.correct, 'is-wrong': choice === index && index !== question.correct }" @click="answer(index)">{{ String.fromCharCode(65 + index) }}. {{ option }}</button>
        </div>
        <div v-if="choice !== null" class="ladder-feedback" role="status"><strong>{{ choice === question.correct ? 'Верно!' : 'Пока неверно.' }}</strong> Правильный ответ: {{ question.options[question.correct] }}. {{ question.explanation }}</div>
        <button v-if="choice !== null" type="button" class="touch-button" @click="next">{{ choice === question.correct ? 'Дальше →' : 'Повторить вопрос ↻' }}</button>
      </section>
      <section v-else-if="questionIndex !== null" class="ladder-question" aria-labelledby="ladder-work-result"><h3 id="ladder-work-result">Произведение освоено</h3><p>«{{ source.data[author][questionIndex][0] }}»: 5 из 5 верных ответов. Выбери следующее произведение или повтори это.</p><button type="button" class="touch-button" @click="workStep = 0">Повторить произведение</button></section>
    </section>
    <p class="ladder-foot">Самостоятельный учебный тренажёр, не официальный тест НЦТ. Источники: <a href="https://new.testcenter.kz/?lang=ru&amp;page_id=15094" target="_blank" rel="noopener noreferrer">Подготовка к ЕНТ — НЦТ</a> · <a href="https://new.testcenter.kz/wp-content/uploads/2025/12/%D0%A1%D0%BF%D0%B8%D1%81%D0%BE%D0%BA_%D0%BB%D0%B8%D1%82%D0%B5%D1%80%D0%B0%D1%82%D1%83%D1%80%D1%8B_%D0%BF%D0%BE-%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%BE%D0%B8%CC%86_%D0%BB%D0%B8%D1%82%D0%B5%D1%80%D0%B0%D1%82%D1%83%D1%80%D0%B5-.pdf" target="_blank" rel="noopener noreferrer">Перечень произведений</a>. Результаты хранятся только в браузере на этом устройстве.</p>
  </div>
</template>
