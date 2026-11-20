<script setup>
import { computed, ref } from 'vue'
import source from './data.json'
import portraitNames from './portraits.json'
import './game.css'

const portraits = import.meta.glob('./assets/*.jpg', { eager: true, query: '?url', import: 'default' })
const storageKey = 'ent_literature_ladder_v2'
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
const choice = ref(null)
const mastered = computed(() => authors.reduce((sum, name) => sum + source.data[name].filter((_, index) => done(name, index)).length, 0))
const question = computed(() => author.value !== null && questionIndex.value !== null ? source.data[author.value][questionIndex.value] : null)

function done(name, index) { return progress.value[`${name}|${index}`] === true }
function authorDone(name) { return source.data[name].filter((_, index) => done(name, index)).length }
function portrait(name) { return portraits[`./assets/${portraitNames[name]}`] }
function authorNote(name) { return notes[name] || 'Выбери автора и потренируйся по произведениям из школьной программы.' }
function save() { try { localStorage.setItem(storageKey, JSON.stringify(progress.value)) } catch { /* Storage may be unavailable. */ } }
function openAuthor(name) { author.value = name; questionIndex.value = null; choice.value = null }
function openQuestion(index) { questionIndex.value = index; choice.value = null }
function answer(index) {
  if (choice.value !== null || !question.value) return
  choice.value = index
  if (index === question.value[3]) {
    progress.value = { ...progress.value, [`${author.value}|${questionIndex.value}`]: true }
    save()
  }
}
function next() {
  if (choice.value !== question.value[3]) { openQuestion(questionIndex.value); return }
  const firstOpen = source.data[author.value].findIndex((_, index) => !done(author.value, index))
  openQuestion(firstOpen < 0 ? (questionIndex.value + 1) % source.data[author.value].length : firstOpen)
}
function reset() {
  if (!window.confirm('Удалить все результаты игры на этом устройстве?')) return
  progress.value = {}
  save()
  author.value = null
  questionIndex.value = null
}
</script>

<template>
  <div class="literary-ladder">
    <header class="ladder-header">
      <p class="eyebrow">11 КЛАСС · ПОДГОТОВКА К ЕНТ</p>
      <h1>Литературная лестница</h1>
      <p>Выбери писателя, открой произведение и проверь свои знания. Каждая правильная ступень приближает к результату.</p>
      <div class="ladder-badges"><span>12 авторов</span><span>43 задания</span><span>Твой личный прогресс</span></div>
    </header>

    <div class="ladder-stats" aria-label="Прогресс">
      <div><strong>{{ mastered }} / {{ total }}</strong><span>Освоено произведений</span></div>
      <div><strong>{{ Math.round(100 * mastered / total) }}%</strong><span>Общий прогресс</span></div>
      <div><strong>{{ mastered }}</strong><span>Пройдено вопросов</span></div>
      <div><strong>{{ authors.length }}</strong><span>Авторов в библиотеке</span></div>
    </div>

    <section v-if="!author" aria-labelledby="ladder-library">
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
      <p>Выбирай произведение и отвечай на вопрос. Прогресс засчитывается только за верный ответ, а неверный вопрос можно сразу повторить.</p>
      <div class="ladder-works">
        <button v-for="(work, index) in source.data[author]" :key="index" type="button" :aria-pressed="questionIndex === index" @click="openQuestion(index)"><strong>{{ done(author, index) ? '✓' : String(index + 1).padStart(2, '0') }} {{ work[0] }}</strong><small>{{ done(author, index) ? 'Освоено' : 'Не пройдено' }} · {{ levels[work[5]] }} уровень</small></button>
      </div>
      <section v-if="question" class="ladder-question" aria-labelledby="ladder-question-title">
        <p class="eyebrow">{{ question[0] }} · {{ levels[question[5]] }} уровень</p>
        <h3 id="ladder-question-title">{{ question[1] }}</h3>
        <div class="ladder-options">
          <button v-for="(option, index) in question[2]" :key="index" type="button" :disabled="choice !== null" :class="{ 'is-correct': choice !== null && index === question[3], 'is-wrong': choice === index && index !== question[3] }" @click="answer(index)">{{ String.fromCharCode(65 + index) }}. {{ option }}</button>
        </div>
        <div v-if="choice !== null" class="ladder-feedback" role="status"><strong>{{ choice === question[3] ? 'Верно!' : 'Пока неверно.' }}</strong> Правильный ответ: {{ question[2][question[3]] }}. {{ question[4] }}</div>
        <button v-if="choice !== null" type="button" class="touch-button" @click="next">{{ choice === question[3] ? 'Следующий вопрос →' : 'Повторить вопрос ↻' }}</button>
      </section>
    </section>
    <p class="ladder-foot">Самостоятельный учебный тренажёр, не официальный тест НЦТ. Источники: <a href="https://new.testcenter.kz/?lang=ru&amp;page_id=15094" target="_blank" rel="noopener noreferrer">Подготовка к ЕНТ — НЦТ</a> · <a href="https://new.testcenter.kz/wp-content/uploads/2025/12/%D0%A1%D0%BF%D0%B8%D1%81%D0%BE%D0%BA_%D0%BB%D0%B8%D1%82%D0%B5%D1%80%D0%B0%D1%82%D1%83%D1%80%D1%8B_%D0%BF%D0%BE-%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%BE%D0%B8%CC%86_%D0%BB%D0%B8%D1%82%D0%B5%D1%80%D0%B0%D1%82%D1%83%D1%80%D0%B5-.pdf" target="_blank" rel="noopener noreferrer">Перечень произведений</a>. Результаты хранятся только в браузере на этом устройстве.</p>
  </div>
</template>
