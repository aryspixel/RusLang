<script setup>
import { computed, ref } from 'vue'
import data from './data.json'
import SurfacePanel from '../../components/SurfacePanel.vue'
import TouchButton from '../../components/TouchButton.vue'
import ChoiceGroup from '../../components/ChoiceGroup.vue'

const chosenBlocks = ref(data.blocks.map((_, index) => index))
const mode = ref('learn')
const count = ref('all')
const mix = ref(false)
const initialHints = ref(false)
const session = ref(null)
const screen = ref('home')
const mistakes = ref([])
const available = computed(() => data.questions.filter(q => chosenBlocks.value.includes(q.b)))
const item = computed(() => session.value?.items[session.value.index])
const correct = computed(() => item.value?.selected === item.value?.q.answer)
const score = computed(() => session.value?.items.filter(x => x.selected === x.q.answer).length ?? 0)

function shuffle(items) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
function toggleBlock(index) {
  chosenBlocks.value = chosenBlocks.value.includes(index)
    ? chosenBlocks.value.filter(value => value !== index)
    : [...chosenBlocks.value, index]
}
function start(questions = available.value, retry = false) {
  let selected = retry || mix.value ? shuffle(questions) : [...questions]
  if (!retry && count.value !== 'all') selected = selected.slice(0, Number(count.value))
  if (!selected.length) return
  session.value = { items: selected.map(q => ({ q, options: shuffle(q.choices), selected: null, checked: false, hint: false })), index: 0, mode: retry ? 'learn' : mode.value, retry, finished: false }
  screen.value = 'task'
}
function choose(value) {
  if (item.value.checked) return
  item.value.selected = value
}
function check() {
  if (item.value.selected === null || item.value.checked) return
  item.value.checked = true
}
function next() {
  if (session.value.mode === 'learn' && !item.value.checked) return
  if (session.value.index < session.value.items.length - 1) session.value.index++
  else finish()
}
function finish() {
  const wrong = session.value.items.filter(x => x.selected !== x.q.answer).map(x => x.q)
  mistakes.value = wrong
  session.value.finished = true
  screen.value = 'result'
}
</script>

<template>
  <div class="game-layout noun-declension">
    <template v-if="screen === 'home'">
      <h1>Склонение существительных</h1>
      <p>Пройдите блоки по порядку или выберите трудную тему. В каждом блоке 10 заданий.</p>
      <SurfacePanel>
        <h2>Выберите тренировку</h2>
        <div class="declension-blocks" role="group" aria-label="Блоки заданий">
          <button v-for="(block, index) in data.blocks" :key="index" type="button" class="choice-group__option"
            :class="{ 'choice-group__option--selected': chosenBlocks.includes(index) }" :aria-pressed="chosenBlocks.includes(index)" @click="toggleBlock(index)">
            {{ index + 1 }}. {{ block[0] }}
          </button>
        </div>
        <p>Выбрано заданий: {{ available.length }}</p>
        <div class="declension-settings">
          <label>Режим <select v-model="mode"><option value="learn">Обучение</option><option value="test">Тест</option></select></label>
          <label>Количество <select v-model="count"><option value="all">Все</option><option value="10">10</option><option value="20">20</option><option value="30">30</option></select></label>
          <label><input v-model="mix" type="checkbox"> Перемешать задания</label>
          <label v-if="mode === 'learn'"><input v-model="initialHints" type="checkbox"> Показывать подсказки</label>
        </div>
        <p>{{ mode === 'test' ? 'В тесте ответы и объяснения появятся после завершения.' : 'В обучении проверьте каждый ответ и прочитайте объяснение.' }}</p>
        <TouchButton :disabled="!available.length" @click="start()">Начать</TouchButton>
      </SurfacePanel>
      <TouchButton variant="secondary" @click="screen = 'guide'">Памятки по блокам</TouchButton>
    </template>

    <template v-else-if="screen === 'guide'">
      <h1>Памятки по блокам</h1>
      <TouchButton variant="secondary" @click="screen = 'home'">К блокам</TouchButton>
      <SurfacePanel v-for="(block, index) in data.blocks" :key="index">
        <h2>{{ index + 1 }}. {{ block[0] }}</h2><p>{{ block[1] }}</p>
      </SurfacePanel>
    </template>

    <template v-else-if="screen === 'task'">
      <h1>Склонение существительных</h1>
      <p>{{ session.mode === 'test' ? 'Тест' : 'Обучение' }} · {{ data.blocks[item.q.b][0] }}</p>
      <p>Задание {{ session.index + 1 }} из {{ session.items.length }}</p>
      <SurfacePanel>
        <h2>{{ item.q.prompt }}</h2>
        <p class="declension-question">{{ item.q.text }}</p>
        <ChoiceGroup :options="item.options.map(value => ({ value, label: value }))" :selected="item.selected" :disabled="item.checked" label="Варианты ответа" @select="choose" />
        <template v-if="session.mode === 'learn'">
          <details v-if="!item.checked" :open="initialHints || item.hint" @toggle="item.hint = $event.target.open"><summary>Подсказка</summary><p>{{ item.q.hint }}</p></details>
          <TouchButton v-if="!item.checked" :disabled="item.selected === null" @click="check">Проверить</TouchButton>
          <div v-else class="declension-feedback" role="status">
            <h3>{{ correct ? '✓ Верно' : '✕ Есть ошибка' }}</h3>
            <p><strong>Правильный ответ:</strong> {{ item.q.answer }}</p><p>{{ item.q.why }}</p>
          </div>
        </template>
        <div class="action-row">
          <TouchButton v-if="session.mode === 'test' && session.index > 0" variant="secondary" @click="session.index--">Назад</TouchButton>
          <TouchButton v-if="session.mode === 'test' || item.checked" @click="next">{{ session.index === session.items.length - 1 ? 'Завершить' : 'Дальше' }}</TouchButton>
        </div>
      </SurfacePanel>
    </template>

    <template v-else>
      <h1>Результат</h1>
      <SurfacePanel>
        <p>Верных ответов: {{ score }} из {{ session.items.length }}.</p>
        <div class="action-row">
          <TouchButton v-if="mistakes.length" @click="start(mistakes, true)">Повторить ошибки</TouchButton>
          <TouchButton variant="secondary" @click="start()">Пройти заново</TouchButton>
          <TouchButton variant="secondary" @click="screen = 'home'">К блокам</TouchButton>
        </div>
      </SurfacePanel>
      <SurfacePanel v-if="mistakes.length">
        <h2>Разбор ошибок</h2>
        <article v-for="entry in session.items.filter(x => x.selected !== x.q.answer)" :key="entry.q.id" class="declension-error">
          <h3>{{ entry.q.prompt }} {{ entry.q.text }}</h3>
          <p>Ваш ответ: {{ entry.selected ?? 'пропуск' }}. Правильно: {{ entry.q.answer }}.</p><p>{{ entry.q.why }}</p>
        </article>
      </SurfacePanel>
    </template>
  </div>
</template>

<style scoped>
.noun-declension { display: grid; gap: 1rem; }
.declension-blocks { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap: .75rem; }
.declension-settings, .action-row { display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; margin: 1rem 0; }
.declension-settings label { display: flex; align-items: center; gap: .5rem; font-size: 1.1rem; }
.declension-settings select { min-height: 48px; font: inherit; }
.declension-question { font-size: clamp(1.4rem, 2vw, 2rem); font-weight: 600; }
.declension-feedback, .declension-error { margin-top: 1rem; padding: 1rem; border: 2px solid var(--color-border, #b6c4cb); border-radius: .75rem; }
.declension-error + .declension-error { margin-top: 1rem; }
details { margin: 1rem 0; } summary { cursor: pointer; font-size: 1.1rem; }
</style>
