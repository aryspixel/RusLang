<script setup>
import { computed, reactive, ref } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import TouchButton from '../../components/TouchButton.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import ProgressMeter from '../../components/ProgressMeter.vue'
import RoomPlacementBoard from '../../components/RoomPlacementBoard.vue'
import room from './assets/room.png'
import { objects, furnishing, belongings, sentences, tabs, speechSupports } from './data.js'
import { roomObjects, roomPlaces } from './layout.js'

const mode = ref('furnishing')
const fresh = () => ({ index: 0, item: null, place: null, checked: false, done: false, answers: [], words: [] })
const states = reactive({ furnishing: fresh(), belongings: fresh(), sentences: fresh() })
const freeRoom = ref({})
const freeItem = ref(null)
const freeDone = ref(false)
const training = computed(() => mode.value !== 'free')
const state = computed(() => states[mode.value])
const tasks = computed(() => mode.value === 'furnishing' ? furnishing : mode.value === 'belongings' ? belongings : sentences)
const task = computed(() => training.value ? tasks.value[state.value.index] : null)
const itemId = computed(() => training.value ? state.value.item : freeItem.value)
const selectedItem = computed(() => objects.find(item => item.id === itemId.value))
const palette = computed(() => mode.value === 'free' ? objects : objects.filter(item => tasks.value.some(entry => entry.object === item.id)))
const places = computed(() => roomPlaces(selectedItem.value, sceneMap.value))
const locked = computed(() => training.value ? state.value.checked || state.value.done : freeDone.value)
const canonical = entries => Object.fromEntries(entries.map(entry => [entry.object, entry.target]))
const allCorrect = canonical([...furnishing, ...belongings])

const sceneMap = computed(() => {
  if (mode.value === 'free') return freeRoom.value
  if (mode.value === 'sentences') return allCorrect
  const s = state.value
  const baseline = mode.value === 'belongings' ? canonical(furnishing) : {}
  Object.assign(baseline, canonical(tasks.value.slice(0, s.done ? tasks.value.length : s.index)))
  if (!s.done && s.item && s.place) baseline[s.item] = s.place
  return baseline
})
const scene = computed(() => roomObjects(sceneMap.value))
const correct = computed(() => {
  if (mode.value === 'sentences') return state.value.words.join('|') === task.value.words.join('|')
  return state.value.item === task.value.object && state.value.place === task.value.target
})
const answerText = computed(() => {
  if (mode.value === 'sentences') return task.value.words.join(' ') + '.'
  const item = objects.find(item => item.id === task.value.object)
  return item.places.find(place => place.id === task.value.target).description
})
const score = computed(() => state.value?.answers.filter(answer => answer.correct).length || 0)
const ready = computed(() => mode.value === 'sentences' ? state.value.words.length === task.value.words.length : Boolean(state.value.item && state.value.place))

function selectItem(id) {
  if (locked.value) return
  if (mode.value === 'free') freeItem.value = freeItem.value === id ? null : id
  else {
    state.value.item = state.value.item === id ? null : id
    state.value.place = null
  }
}
function selectPlace(id) {
  if (locked.value || !selectedItem.value) return
  if (places.value.find(place => place.id === id)?.available === false) return
  if (mode.value === 'free') freeRoom.value = { ...freeRoom.value, [freeItem.value]: id }
  else state.value.place = id
}
function addWord(word) {
  if (!locked.value && !state.value.words.includes(word) && state.value.words.length < task.value.words.length) state.value.words.push(word)
}
function check() {
  if (!ready.value || locked.value) return
  state.value.answers.push({ correct: correct.value, response: mode.value === 'sentences' ? state.value.words.join(' ') : `${selectedItem.value.label}: ${places.value.find(place => place.id === state.value.place).label}` })
  state.value.checked = true
}
function next() {
  if (!state.value.checked) return
  if (state.value.index === tasks.value.length - 1) state.value.done = true
  else {
    state.value.index++
    state.value.item = null
    state.value.place = null
    state.value.checked = false
    state.value.words = []
  }
}
function repeat() { states[mode.value] = fresh() }
function clearFree() { freeRoom.value = {}; freeItem.value = null; freeDone.value = false }
function removeFree() {
  if (!freeItem.value || freeDone.value) return
  const updated = { ...freeRoom.value }
  delete updated[freeItem.value]
  // Вместе с мебелью убираем зависимые вещи: они не остаются висеть в воздухе.
  let removed = true
  while (removed) {
    removed = false
    for (const item of objects) {
      const parent = item.places.find(place => place.id === updated[item.id])?.parent
      if (parent && !updated[parent]) {
        delete updated[item.id]
        removed = true
      }
    }
  }
  freeRoom.value = updated
}
</script>

<template>
  <div class="game-layout">
    <h1>Обставь мою комнату</h1>
    <div class="game-tabs" role="group" aria-label="Части игры">
      <TouchButton v-for="tab in tabs" :key="tab.id" :aria-pressed="mode === tab.id" :variant="mode === tab.id ? 'primary' : 'secondary'" @click="mode = tab.id">{{ tab.label }}</TouchButton>
    </div>

    <SurfacePanel v-if="training && state.done">
      <h2>{{ mode === 'furnishing' ? 'Мебель расставлена!' : mode === 'belongings' ? 'Все вещи на своих местах!' : 'Предложения собраны!' }}</h2>
      <p>Верных ответов: {{ score }} из {{ tasks.length }}.</p>
      <p v-if="mode !== 'sentences'">Посмотри, как должна выглядеть комната по заданиям.</p>
      <RoomPlacementBoard :background="room" :objects="scene" />
      <details class="game-help">
        <summary>Мои ответы и разбор</summary>
        <div v-for="(entry, i) in tasks" :key="`${entry.object}-${i}`" class="furnish-review">
          <p><strong>{{ i + 1 }}. {{ entry.prompt }}</strong></p>
          <p>{{ state.answers[i]?.correct ? '✓ Верно.' : '✗ Была ошибка.' }} Твой ответ: {{ state.answers[i]?.response }}.</p>
          <p>Правильно: {{ mode === 'sentences' ? entry.words.join(' ') + '.' : objects.find(item => item.id === entry.object).places.find(place => place.id === entry.target).description }} {{ entry.explanation }}</p>
        </div>
      </details>
      <div class="action-row">
        <TouchButton @click="mode = mode === 'furnishing' ? 'belongings' : mode === 'belongings' ? 'sentences' : 'free'">{{ mode === 'furnishing' ? 'Дальше: разложи вещи →' : mode === 'belongings' ? 'Дальше: составь предложения →' : 'Создать свою комнату →' }}</TouchButton>
        <TouchButton variant="secondary" @click="repeat">Повторить эту часть</TouchButton>
      </div>
    </SurfacePanel>

    <SurfacePanel v-else>
      <ProgressMeter v-if="training" :current="state.index + 1" :total="tasks.length" />
      <h2>{{ training ? task.prompt : freeDone ? 'Расскажи о своей комнате' : 'Придумай свою комнату' }}</h2>
      <p v-if="mode === 'sentences'">Собери предложение из трёх карточек. Касание карточки в ответе убирает её.</p>
      <p v-else-if="!freeDone">Выбери предмет, затем место с номером под картинкой. {{ training ? 'После этого нажми «Проверить».' : 'Предмет можно переставить или убрать. Здесь нет неправильных ответов.' }}</p>
      <p v-if="mode === 'belongings' && state.index === 0" class="muted">Мебель здесь уже расставлена. Теперь добавим небольшие предметы.</p>
      <div class="furnish-workspace">
        <RoomPlacementBoard :background="room" :objects="scene" :places="mode === 'sentences' || freeDone ? [] : places" :selected="training ? state.place : freeRoom[freeItem] || null" :disabled="locked" @place="selectPlace" />
        <div v-if="mode !== 'sentences' && !freeDone" class="furnish-tools">
          <h3>Выбери предмет</h3>
          <div class="furnish-palette" role="group" aria-label="Предметы для комнаты">
            <button v-for="item in palette" :key="item.id" class="choice-group__option furnish-card" :class="{ 'choice-group__option--selected': itemId === item.id }" :aria-pressed="itemId === item.id" :disabled="locked" @click="selectItem(item.id)">
              <img :src="item.image" alt="" class="furnish-card__image" :style="{ transform: item.flipX ? 'scaleX(-1)' : undefined }">
              <span>{{ itemId === item.id ? '✓ ' : '' }}{{ item.label }}</span>
            </button>
          </div>
          <p role="status">{{ selectedItem ? `Выбрано: ${selectedItem.label}. Теперь выбери место под картинкой.` : 'Коснись нужного предмета.' }}</p>
          <div v-if="mode === 'free'" class="action-row">
            <TouchButton variant="secondary" :disabled="!freeRoom[freeItem]" @click="removeFree">Убрать предмет</TouchButton>
          </div>
          <p v-if="mode === 'free'" class="muted">Вещи перемещаются вместе с мебелью. Если убрать мебель, вещи на ней и рядом с ней тоже уберутся.</p>
        </div>
      </div>

      <template v-if="mode === 'sentences'">
        <div class="furnish-answer" role="group" aria-label="Собранное предложение">
          <TouchButton v-for="(word, i) in state.words" :key="word" variant="secondary" :disabled="locked" :aria-label="`Убрать: ${word}`" @click="state.words.splice(i, 1)">{{ word }}</TouchButton>
          <span v-if="!state.words.length" class="muted">Твоё предложение появится здесь…</span>
        </div>
        <div class="action-row" role="group" aria-label="Карточки слов">
          <TouchButton v-for="word in task.pool" :key="word" variant="secondary" :disabled="locked || state.words.includes(word) || state.words.length >= task.words.length" @click="addWord(word)">{{ word }}</TouchButton>
        </div>
      </template>

      <FeedbackMessage v-if="training && state.checked" :kind="correct ? 'success' : 'error'" :title="correct ? '✓ Верно!' : '✗ Пока неверно. Посмотри правильный ответ.'">
        <p>{{ answerText }}</p><p>{{ task.explanation }}</p>
        <p v-if="!correct && mode !== 'sentences'">После нажатия «Дальше» предмет займёт правильное место.</p>
      </FeedbackMessage>
      <div v-if="training" class="action-row">
        <TouchButton v-if="!state.checked" :disabled="!ready" @click="check">Проверить</TouchButton>
        <TouchButton v-else @click="next">{{ state.index === tasks.length - 1 ? 'Показать итог' : 'Дальше →' }}</TouchButton>
        <TouchButton v-if="!state.checked && mode === 'sentences'" variant="secondary" :disabled="!state.words.length" @click="state.words = []">Очистить предложение</TouchButton>
      </div>
      <template v-else>
        <div class="action-row">
          <TouchButton v-if="!freeDone" :disabled="!scene.length" @click="freeDone = true; freeItem = null">Готово! Расскажу о комнате</TouchButton>
          <TouchButton v-else @click="freeDone = false">Продолжить обустройство</TouchButton>
          <TouchButton variant="secondary" @click="clearFree">Начать новую комнату</TouchButton>
        </div>
        <div v-if="freeDone">
          <p>Опиши свою комнату: составь не менее пяти предложений. Можно воспользоваться опорами. Послушать и обсудить рассказ поможет учитель.</p>
          <p v-for="support in speechSupports" :key="support">{{ support }}</p>
        </div>
      </template>
    </SurfacePanel>
    <details class="game-help">
      <summary>Памятка: куда поставили и где находится?</summary>
      <p>На стол → на столе. Под стол → под столом. В коробку → в коробке. На кровать → на кровати.</p>
      <p>«На» — сверху, на поверхности; «под» — внизу; «в» — внутри; «около» и «рядом с» — близко.</p>
      <p>«Над» — выше предмета; «у стены» — близко к стене; «посреди комнаты» — в её середине.</p>
      <p>Поставили стул рядом со столом. Теперь стул стоит рядом со столом.</p>
    </details>
  </div>
</template>

<style scoped>
.furnish-workspace { display: grid; grid-template-columns: minmax(0, 2fr) minmax(240px, 1fr); align-items: start; gap: var(--space-3); margin-top: var(--space-3); }
.furnish-workspace > :only-child { grid-column: 1 / -1; }
.furnish-tools { min-width: 0; }
.furnish-palette { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-1); margin-bottom: var(--space-2); }
.furnish-card { display: grid; justify-items: center; align-content: center; gap: var(--space-1); text-align: center; min-width: 0; padding: 8px; }
.furnish-card__image { display: block; width: 100%; height: 85px; object-fit: contain; }
.furnish-answer { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-1); min-height: 76px; padding: var(--space-2); margin-top: var(--space-3); border: 2px dashed var(--color-primary); border-radius: var(--radius-control); }
.furnish-answer .touch-button { min-width: 0; }
.furnish-review { margin-top: var(--space-3); }
@media (max-width: 850px) { .furnish-workspace { grid-template-columns: minmax(0, 1fr); } .furnish-palette { grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); } }
@media (max-height: 800px) and (min-width: 851px) { .furnish-card__image { height: 60px; } }
</style>
