<script setup>
import { computed, reactive, ref } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import TouchButton from '../../components/TouchButton.vue'
import ChoiceGroup from '../../components/ChoiceGroup.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import ProgressMeter from '../../components/ProgressMeter.vue'
import { TERMS, BLOCKS, BANK, contrast } from './data.js'

const active = ref(0)
const mode = ref('learn')
const hintsOn = ref(true)
const dictionary = ref(false)
const search = ref('')
const sessions = reactive({})
const records = reactive({})
const key = computed(() => `${mode.value}:${active.value}`)
const session = computed(() => sessions[key.value])
const task = computed(() => session.value.items[session.value.index])
const score = computed(() => session.value.answers.filter(a => a.ok).length)
const difficult = computed(() => BANK.filter(q => records[q.id]?.difficult))
const entries = computed(() => Object.entries(TERMS).filter(([name, t]) =>
  `${name} ${t.def} ${t.ex}`.toLocaleLowerCase('ru').includes(search.value.trim().toLocaleLowerCase('ru'))))
const title = computed(() => active.value === 'all' ? 'Весь тест' : active.value === 'review' ? 'Повторение трудных' : BLOCKS[active.value].name)
function shuffled(items) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
function start(items) {
  const list = items ?? (active.value === 'all' ? BANK : active.value === 'review' ? difficult.value : BANK.filter(q => q.block === active.value))
  sessions[key.value] = { items: [...list], index: 0, selected: null, locked: false, hints: 0, revealed: false, finished: false, answers: [], choices: list.map(q => shuffled(q.choices).map(value => ({ value, label: value }))) }
}
function activate(value) {
  active.value = value
  dictionary.value = false
  if (!session.value) start()
}
function setMode(value) {
  if (value === 'learn' && active.value === 'all' || value === 'test' && active.value === 'review') active.value = 0
  mode.value = value
  dictionary.value = false
  if (!session.value) start()
}
function choose(value) { if (!session.value.locked) session.value.selected = value }
function check(revealed = false) {
  const s = session.value
  if (s.locked || s.finished || (!revealed && s.selected === null)) return
  const q = task.value
  const ok = !revealed && s.selected === q.term
  s.revealed = revealed
  s.locked = true
  s.answers.push({ q, selected: s.selected, ok, helped: s.hints > 0 || revealed })
  if (mode.value === 'learn') records[q.id] = { difficult: !ok || s.hints > 0 || revealed, first: ok && s.hints === 0 }
}
function next() {
  const s = session.value
  if (!s.locked || s.finished) return
  if (s.index === s.items.length - 1) {
    s.finished = true
    if (mode.value === 'test') for (const a of s.answers) records[a.q.id] = { difficult: !a.ok, first: a.ok }
  } else { s.index++; s.selected = null; s.locked = false; s.hints = 0; s.revealed = false }
}
function review(items) {
  mode.value = 'learn'
  active.value = 'review'
  dictionary.value = false
  start(items)
}
function steps(q) {
  return [['1. Передадим смысл без образа', q.plain], ['2. Найдём признак приёма', q.signal], ['3. Назовём правило', TERMS[q.term].def], ['4. Объясним роль в этом примере', q.role]]
}
start()
</script>

<template>
  <div class="game-layout">
    <h1>Средства выразительности</h1>
    <p>Учимся замечать и объяснять: 36 заданий от простых примеров к небольшим текстам. Скорость не оценивается.</p>
    <nav class="game-tabs" aria-label="Режим работы">
      <TouchButton :variant="mode === 'learn' ? 'primary' : 'secondary'" :aria-pressed="mode === 'learn'" @click="setMode('learn')">Обучение с разбором</TouchButton>
      <TouchButton :variant="mode === 'test' ? 'primary' : 'secondary'" :aria-pressed="mode === 'test'" @click="setMode('test')">Тест без подсказок</TouchButton>
    </nav>
    <p>{{ mode === 'learn' ? 'Выбери приём и нажми «Проверить». Прочитай разбор, затем переходи дальше. Можно открыть три подсказки или готовый ответ.' : 'Один ответ на задание. Правильность и объяснения появятся после завершения теста.' }} Блоки и режимы сохраняют состояние до выхода из игры.</p>
    <details class="game-help">
      <summary>Учебные блоки · {{ title }}</summary>
      <nav class="game-tabs" aria-label="Учебные блоки">
        <TouchButton v-for="(b, i) in BLOCKS" :key="b.name" :variant="active === i ? 'primary' : 'secondary'" :aria-pressed="active === i" @click="activate(i)">{{ b.name }}</TouchButton>
        <TouchButton v-if="mode === 'test'" :variant="active === 'all' ? 'primary' : 'secondary'" :aria-pressed="active === 'all'" @click="activate('all')">Весь тест · 36 заданий</TouchButton>
      </nav>
    </details>
    <div v-if="mode === 'learn'" class="action-row">
      <TouchButton variant="secondary" :aria-pressed="hintsOn" @click="hintsOn = !hintsOn">Подсказки: {{ hintsOn ? 'включены' : 'отключены' }}</TouchButton>
      <TouchButton variant="secondary" :disabled="!difficult.length" @click="review(difficult)">Повторить трудные · {{ difficult.length }}</TouchButton>
      <TouchButton variant="secondary" :aria-pressed="dictionary" @click="dictionary = !dictionary">{{ dictionary ? 'Вернуться к заданию' : 'Словарь с примерами' }}</TouchButton>
    </div>
    <p v-if="mode === 'learn'">Разобрано: {{ Object.keys(records).length }} из {{ BANK.length }}. С подсказкой или ошибкой: {{ difficult.length }}.</p>

    <SurfacePanel v-if="dictionary" class="game-layout">
      <h2>Словарь с примерами</h2>
      <p>Не учи все определения сразу. Найди нужное средство и сравни пример со своим заданием.</p>
      <label class="game-field">Название или ключевое слово<input v-model="search" class="dictionary-search" type="search" placeholder="Например: повтор, метафора, начало"></label>
      <article v-for="[name, t] in entries" :key="name" class="game-help">
        <h3>{{ name }}</h3><p>{{ t.def }}</p><p>{{ t.ex }}</p><p>Как узнать: {{ t.clue }}</p>
      </article>
      <p v-if="!entries.length">Ничего не найдено. Попробуй другое слово.</p>
      <TouchButton variant="secondary" @click="dictionary = false">Вернуться к заданию</TouchButton>
    </SurfacePanel>

    <SurfacePanel v-else-if="session.finished" class="game-layout">
      <h2>{{ mode === 'test' ? 'Тест завершён' : 'Блок разобран' }} · {{ title }}</h2>
      <p v-if="mode === 'test'">Верно: {{ score }} из {{ session.items.length }} ({{ Math.round(100 * score / session.items.length) }}%).</p>
      <template v-else>
        <p>Без подсказок с первой попытки: {{ session.answers.filter(a => a.ok && !a.helped).length }} из {{ session.items.length }}. Для повторения: {{ session.answers.filter(a => !a.ok || a.helped).length }}.</p>
        <p>Использование подсказок — часть обучения. Попробуй ещё раз разобрать трудные примеры и объяснить признак своими словами.</p>
      </template>
      <div class="action-row">
        <TouchButton :disabled="!session.answers.some(a => !a.ok || (mode === 'learn' && a.helped))" @click="review(session.answers.filter(a => !a.ok || (mode === 'learn' && a.helped)).map(a => a.q))">{{ mode === 'test' ? 'Разобрать ошибки в обучении' : 'Повторить трудные из этого блока' }}</TouchButton>
        <TouchButton variant="secondary" @click="start(session.items)">Пройти заново</TouchButton>
        <TouchButton v-if="typeof active === 'number' && active < BLOCKS.length - 1" variant="secondary" @click="activate(active + 1)">Следующий блок</TouchButton>
      </div>
      <details class="game-help">
        <summary>Ответы и подробные объяснения</summary>
        <details v-for="(a, i) in session.answers" :key="a.q.id" class="game-help">
          <summary>{{ i + 1 }}. {{ a.ok ? '✓ Верно' : a.selected === null ? 'Разбор с ответом' : '✕ Ошибка' }}: {{ a.q.focus }}</summary>
          <p class="example">{{ a.q.text }}</p><p>Твой ответ: {{ a.selected ?? 'Ответ открыт' }}. Верный ответ: {{ a.q.term }}.</p>
          <div v-for="[heading, text] in steps(a.q)" :key="heading"><h3>{{ heading }}</h3><p>{{ text }}</p></div>
        </details>
      </details>
    </SurfacePanel>

    <SurfacePanel v-else-if="session.items.length" class="game-layout">
      <h2>{{ title }}</h2>
      <ProgressMeter :current="session.index + 1" :total="session.items.length" />
      <details v-if="mode === 'learn' && hintsOn" :key="key + ':' + session.index" class="game-help" :open="session.index === 0">
        <summary>Памятка этого блока</summary><p>{{ BLOCKS[task.block].guide }}</p>
      </details>
      <h2>Какой приём объясняет указанную фразу?</h2>
      <p class="example">{{ task.text }}</p>
      <p class="game-help">Разбираем именно эту фразу:<br><strong>{{ task.focus }}</strong></p>
      <ChoiceGroup :options="session.choices[session.index]" :selected="session.selected" :disabled="session.locked" label="Средство выразительности" @select="choose" />
      <div v-if="mode === 'learn' && hintsOn && session.hints > 0" aria-live="polite">
        <p v-for="(hint, i) in [task.hint, TERMS[task.term].clue, 'Это ' + task.term.toLowerCase() + '. ' + TERMS[task.term].def].slice(0, session.hints)" :key="i">Подсказка {{ i + 1 }}. {{ hint }}</p>
      </div>
      <FeedbackMessage v-if="session.locked" :kind="mode === 'test' || session.revealed ? 'info' : session.selected === task.term ? 'success' : 'error'" :title="mode === 'test' ? 'Ответ принят. Проверка будет в конце теста.' : session.revealed ? 'Разбираем вместе' : session.selected === task.term ? 'Верно' : 'Неверно'">
        <template v-if="mode === 'learn'">
          <p>Правильный ответ: {{ task.term }}.</p>
          <p v-if="session.selected && session.selected !== task.term">Твой вариант — {{ session.selected }}: {{ TERMS[session.selected].def }} {{ contrast(session.selected, task.term) || 'В указанной фразе определяющий признак другой: ' + task.signal }}</p>
        </template>
      </FeedbackMessage>
      <section v-if="session.locked && mode === 'learn'" class="game-layout" aria-label="Подробный разбор">
        <div v-for="[heading, text] in steps(task)" :key="heading"><h3>{{ heading }}</h3><p>{{ text }}</p></div>
        <details class="game-help">
          <summary>Почему другие варианты не подходят</summary>
          <div v-for="term in task.choices.filter(t => t !== task.term)" :key="term"><h3>{{ term }}</h3><p>{{ TERMS[term].def }}</p><p>{{ contrast(term, task.term) || 'В указанной фразе определяющий признак другой: ' + task.signal }}</p></div>
        </details>
      </section>
      <div class="action-row">
        <TouchButton v-if="!session.locked" :disabled="session.selected === null" @click="check()">{{ mode === 'test' ? 'Принять ответ' : 'Проверить' }}</TouchButton>
        <TouchButton v-else @click="next">{{ session.index === session.items.length - 1 ? 'Итог' : 'Дальше' }}</TouchButton>
        <template v-if="mode === 'learn' && !session.locked">
          <TouchButton v-if="hintsOn" variant="secondary" :disabled="session.hints >= 3" @click="session.hints++">{{ session.hints < 3 ? `Подсказка ${session.hints + 1} из 3` : 'Все подсказки открыты' }}</TouchButton>
          <TouchButton variant="secondary" @click="check(true)">Показать ответ и разбор</TouchButton>
        </template>
      </div>
    </SurfacePanel>
    <SurfacePanel v-else><p>Пока нет трудных заданий. Выбери любой учебный блок.</p></SurfacePanel>
    <TouchButton variant="secondary" @click="start(session.items)">Начать заново · {{ title }}</TouchButton>
    <p class="muted">Авторские учебные задания. Один фрагмент может содержать несколько приёмов: вопрос уточняет, что именно нужно найти.</p>
  </div>
</template>

<style scoped>
.example { font-size: clamp(24px, 2vw, 34px); font-weight: 650; white-space: pre-line; overflow-wrap: anywhere; }
.dictionary-search { width: 100%; min-width: 0; min-height: var(--touch-min); padding: 12px; border: 2px solid var(--color-border); border-radius: var(--radius-control); background: var(--color-surface); color: var(--color-text); }
</style>
