<script setup>
import { computed, onUnmounted, ref } from 'vue'
import data from './data.js'
import advancedData from './advanced-data.js'

const screen = ref('start')
const mode = ref('learn')
const variant = ref('original')
const activeData = computed(() => variant.value === 'advanced' ? advancedData : data)
const index = ref(0)
const answers = ref([])
const checked = ref([])
const selfMarks = ref([])
const hintOpen = ref(false)
const seconds = ref(1200)
const expired = ref(false)
const copyMessage = ref('')
let timer = null
const question = computed(() => activeData.value.questions[index.value])
const passage = computed(() => activeData.value.passages[question.value.p])
const score = computed(() => activeData.value.questions.filter((item, number) => item.type === 'title' ? Boolean(String(answers.value[number] ?? '').trim()) && selfMarks.value[number] === true : answers.value[number] === item.correct).length)
const titleMarksPending = computed(() => activeData.value.questions.some((item, number) => item.type === 'title' && selfMarks.value[number] === null))
const missing = computed(() => activeData.value.questions.filter((item, number) => item.type === 'title' ? !String(answers.value[number] ?? '').trim() : answers.value[number] === null).length)
const timeLabel = computed(() => `${String(Math.floor(seconds.value / 60)).padStart(2, '0')}:${String(seconds.value % 60).padStart(2, '0')}`)
const summary = computed(() => score.value >= 9 ? 'Высокий результат. Для развития навыка увеличивайте сложность текстов.' : score.value >= 7 ? 'Хороший результат. Отработайте вопросы, на которых допущены ошибки.' : score.value >= 5 ? 'Средний результат. Нужно усилить интерпретацию и поиск доказательств в тексте.' : 'Нужна системная работа с пониманием текста и обоснованием ответа.')
const originalGroups = [
  { name: 'Текст 1 · Короткий', ids: [0, 1] },
  { name: 'Текст 2 · Средний', ids: [2, 3, 4] },
  { name: 'Текст 3 · Развёрнутый', ids: [5, 6, 7, 8, 9] },
  { name: 'Задания повышенного уровня', ids: [7, 8] },
]
const groups = computed(() => variant.value === 'advanced' ? [
  { name: 'Текст 1 · Маршруты', ids: [0, 1, 2] },
  { name: 'Текст 2 · Ремонт вещей', ids: [3, 4, 5] },
  { name: 'Текст 3 · Городской парк', ids: [6, 7, 8, 9] },
  { name: 'Собственные заголовки', ids: [0, 3, 6] },
] : originalGroups)
function stopTimer() { if (timer) clearInterval(timer); timer = null }
function start() {
  stopTimer()
  index.value = 0
  answers.value = Array(activeData.value.questions.length).fill(null)
  checked.value = Array(activeData.value.questions.length).fill(false)
  selfMarks.value = Array(activeData.value.questions.length).fill(null)
  seconds.value = 1200
  expired.value = false
  hintOpen.value = false
  screen.value = 'work'
  if (mode.value === 'exam') timer = setInterval(() => {
    seconds.value--
    if (seconds.value <= 0) { seconds.value = 0; finish(true) }
  }, 1000)
}
function go(number) { index.value = number; hintOpen.value = false }
function choose(number) {
  if (mode.value === 'learn' && checked.value[index.value]) return
  answers.value[index.value] = number
}
function markTitle(value) { selfMarks.value[index.value] = value }
function check() {
  if (question.value.type === 'title' ? !String(answers.value[index.value] ?? '').trim() : answers.value[index.value] === null) return
  checked.value[index.value] = true
  hintOpen.value = false
}
function finish(timedOut = false) {
  if (!timedOut && missing.value && !window.confirm(`Нет ответа на ${missing.value} вопрос(ов). Завершить тест?`)) return
  expired.value = timedOut
  stopTimer()
  screen.value = 'result'
}
function next() {
  if (index.value < activeData.value.questions.length - 1) go(index.value + 1)
  else finish()
}
function restart() { stopTimer(); screen.value = 'start'; copyMessage.value = '' }
async function copyResult() {
  const lines = [`Грамотность чтения · ЕНТ · 11 класс`, `Вариант: ${variant.value === 'advanced' ? 'усложнённый' : 'исходный'}`, `Режим: ${mode.value === 'learn' ? 'обучение' : 'тест'}`, `Результат: ${score.value}/10${titleMarksPending.value ? ' (оценка заголовков не завершена)' : ''}`, ...activeData.value.questions.map((item, number) => item.type === 'title' ? `${number + 1}. ${answers.value[number] || '—'} — ${item.skill} ${selfMarks.value[number] === null ? 'не оценён' : selfMarks.value[number] ? '✓' : '✗'}` : `${number + 1}. ${answers.value[number] === null ? '—' : 'ABCDE'[answers.value[number]]} / ${'ABCDE'[item.correct]} — ${item.skill} ${answers.value[number] === item.correct ? '✓' : '✗'}`)]
  try { await navigator.clipboard.writeText(lines.join('\n')); copyMessage.value = 'Результат скопирован.' }
  catch { copyMessage.value = 'Не удалось скопировать результат.' }
}
onUnmounted(stopTimer)
</script>

<template>
  <div class="reading-game">
    <section v-if="screen === 'start'" class="surface-panel intro">
      <p class="eyebrow">Интерактивная диагностика · 11 класс</p>
      <h1>Грамотность чтения · ЕНТ</h1>
      <h2>Прочитай. Подумай. Докажи ответ текстом.</h2>
      <p>Три текста и десять вопросов в каждом варианте. Выберите вариант и режим. Тексты доступны во время выполнения заданий.</p>
      <div class="mode-grid" role="group" aria-label="Вариант заданий">
        <label class="mode-card"><input v-model="variant" type="radio" value="original"> <strong>Вариант 1</strong><span>Исходные тексты и вопросы.</span></label>
        <label class="mode-card"><input v-model="variant" type="radio" value="advanced"> <strong>Вариант 2 · сложнее</strong><span>Новые тексты, выводы и собственные заголовки.</span></label>
      </div>
      <div class="mode-grid" role="group" aria-label="Режим тренировки">
        <label class="mode-card"><input v-model="mode" type="radio" value="learn"> <strong>Обучение</strong><span>Подсказка до ответа, проверка каждого вопроса и объяснение.</span></label>
        <label class="mode-card"><input v-model="mode" type="radio" value="exam"> <strong>Пробный ЕНТ</strong><span>20 минут, без подсказок. В конце — результат, ключи и разбор ошибок.</span></label>
      </div>
      <button class="touch-button" type="button" @click="start">Начать тренировку →</button>
      <p class="muted">Материал тренировочный, не является официальным заданием НЦТ.</p>
    </section>

    <section v-else-if="screen === 'work'" aria-label="Вопросы">
      <div class="status-row"><strong>{{ variant === 'advanced' ? 'Вариант 2' : 'Вариант 1' }} · {{ mode === 'learn' ? 'Режим обучения' : 'Пробный ЕНТ' }}</strong><strong>{{ mode === 'exam' ? `Осталось: ${timeLabel}` : 'Без таймера' }}</strong></div>
      <p class="progress-text">Вопрос {{ index + 1 }} из {{ activeData.questions.length }} · Ответов: {{ activeData.questions.length - missing }} из {{ activeData.questions.length }}</p>
      <nav class="question-nav" aria-label="Номера вопросов">
        <button v-for="(item, number) in activeData.questions" :key="number" type="button" :class="{ current: number === index, answered: item.type === 'title' ? Boolean(String(answers[number] ?? '').trim()) : answers[number] !== null }" :aria-current="number === index ? 'step' : undefined" :aria-label="`Вопрос ${number + 1}`" @click="go(number)">{{ number + 1 }}</button>
      </nav>
      <div class="reading-layout">
        <article class="surface-panel passage-card"><p class="eyebrow">Текст {{ question.p + 1 }} из 3</p><h2 v-if="variant === 'original'">{{ passage.title }}</h2><div class="passage">{{ passage.text }}</div></article>
        <article class="surface-panel question-card"><p class="eyebrow">Вопрос {{ index + 1 }} из 10 · {{ question.skill }}</p><h2>{{ question.q }}</h2>
          <div v-if="question.type === 'title'" class="title-answer"><label :for="`title-${index}`">Ваш заголовок</label><input :id="`title-${index}`" v-model="answers[index]" type="text" maxlength="120" :disabled="mode === 'learn' && checked[index]" placeholder="Напишите заголовок текста"><p>Заголовок оценивается вами по смыслу после сравнения с примером.</p></div>
          <div v-else class="choices" role="group" :aria-label="question.q">
            <button v-for="(answer, number) in question.a" :key="number" type="button" :disabled="mode === 'learn' && checked[index]" :aria-pressed="answers[index] === number" :class="{ selected: answers[index] === number, correct: mode === 'learn' && checked[index] && number === question.correct, wrong: mode === 'learn' && checked[index] && answers[index] === number && number !== question.correct }" @click="choose(number)"><b>{{ 'ABCDE'[number] }}</b><span>{{ answer }}</span></button>
          </div>
          <p v-if="hintOpen && mode === 'learn' && !checked[index]" class="feedback">Подсказка: {{ question.hint }}</p>
          <div v-if="mode === 'learn' && checked[index]" class="feedback" role="status"><template v-if="question.type === 'title'"><strong>Пример заголовка: {{ question.example }}</strong><p>{{ question.criteria }}</p><p>{{ question.why }}</p><div class="actions"><button type="button" class="touch-button secondary" @click="markTitle(true)">Мой заголовок подходит</button><button type="button" class="touch-button secondary" @click="markTitle(false)">Нужно исправить</button></div><p v-if="selfMarks[index] !== null">{{ selfMarks[index] ? 'Заголовок засчитан.' : 'Заголовок пока не засчитан.' }}</p></template><template v-else><strong>{{ answers[index] === question.correct ? '✓ Верно!' : `✗ Ошибка. Верный ответ: ${'ABCDE'[question.correct]} — ${question.a[question.correct]}` }}</strong><p>{{ question.why }}</p></template></div>
          <div class="actions"><button type="button" class="touch-button secondary" :disabled="index === 0" @click="go(index - 1)">← Назад</button><button v-if="mode === 'learn' && !checked[index]" type="button" class="touch-button secondary" @click="hintOpen = !hintOpen">Подсказка</button><button v-if="mode === 'learn' && !checked[index]" type="button" class="touch-button" :disabled="question.type === 'title' ? !String(answers[index] ?? '').trim() : answers[index] === null" @click="check">Проверить</button><button v-if="mode === 'exam' || (checked[index] && (question.type !== 'title' || selfMarks[index] !== null))" type="button" class="touch-button" @click="next">{{ index === 9 ? 'К результату →' : 'Дальше →' }}</button></div>
          <button v-if="mode === 'exam'" type="button" class="text-action" @click="finish()">Завершить тест</button>
        </article>
      </div>
    </section>

    <section v-else class="surface-panel results">
      <p class="eyebrow">Результат · {{ variant === 'advanced' ? 'Вариант 2' : 'Вариант 1' }}</p><h1>Грамотность чтения · ЕНТ</h1>
      <p v-if="expired">Время истекло.</p><p v-if="variant === 'advanced'">Сравните свои заголовки с примерами и отметьте, передают ли они главную мысль. Оценка обновится после вашего выбора.</p>
      <p class="score">{{ score }} / 10</p><p v-if="titleMarksPending">Оцените заголовки ниже, чтобы получить итоговый результат.</p><p v-else>{{ summary }}</p>
      <div class="analysis-grid"><div v-for="group in groups" :key="group.name"><strong>{{ group.name }}</strong><p>{{ group.ids.filter(number => activeData.questions[number].type === 'title' ? selfMarks[number] === true : answers[number] === activeData.questions[number].correct).length }} из {{ group.ids.length }} верно</p></div></div>
      <h2>Разбор ответов</h2>
      <div v-for="(item, number) in activeData.questions" :key="number" class="review">
        <template v-if="item.type === 'title'"><strong>№{{ number + 1 }} · Заголовок текста</strong><p>Ваш вариант: {{ answers[number] || 'нет ответа' }}</p><p>Пример: {{ item.example }}. {{ item.criteria }}</p><div class="actions"><button type="button" class="touch-button secondary" :disabled="!String(answers[number] ?? '').trim()" @click="selfMarks[number] = true">Подходит</button><button type="button" class="touch-button secondary" @click="selfMarks[number] = false">Нужно исправить</button></div><p v-if="selfMarks[number] !== null">{{ selfMarks[number] ? 'Заголовок засчитан.' : 'Заголовок не засчитан.' }}</p></template>
        <template v-else><strong>{{ answers[number] === item.correct ? '✓' : '✗' }} №{{ number + 1 }} · {{ item.skill }} · Ваш ответ: {{ answers[number] === null ? 'нет' : 'ABCDE'[answers[number]] }} · Верно: {{ 'ABCDE'[item.correct] }}</strong><p>{{ item.why }}</p></template>
      </div>
      <div class="actions"><button type="button" class="touch-button" @click="restart">Новая попытка</button><button type="button" class="touch-button secondary" @click="copyResult">Скопировать результат</button></div><p role="status">{{ copyMessage }}</p>
    </section>
  </div>
</template>

<style scoped>
.reading-game{max-width:1440px;margin:auto}.intro,.results{max-width:900px;margin:24px auto}.eyebrow{font-size:.9rem;font-weight:700;color:var(--accent,#315fe8)}.mode-grid,.analysis-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin:24px 0}.mode-card,.analysis-grid>div{border:2px solid var(--line,#dce4ef);border-radius:14px;padding:18px}.mode-card{cursor:pointer}.mode-card:has(input:checked){border-color:var(--accent,#315fe8)}.mode-card span{display:block;margin-top:10px}.status-row,.actions{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}.progress-text{margin:16px 0}.question-nav{display:flex;flex-wrap:wrap;gap:10px;margin:16px 0}.question-nav button{min-width:52px;min-height:52px;border:2px solid var(--line,#dce4ef);border-radius:10px;background:white;color:inherit;font-size:1.1rem}.question-nav .current{border-color:var(--accent,#315fe8);font-weight:800}.question-nav .answered::after{content:' ✓'}.reading-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:20px;align-items:start}.passage{white-space:pre-line;line-height:1.7;font-size:1.1rem}.question-card h2{font-size:clamp(1.35rem,2vw,1.8rem)}.choices{display:grid;gap:12px}.choices button{display:flex;align-items:start;gap:14px;width:100%;min-height:64px;padding:14px;text-align:left;background:white;color:inherit;border:2px solid var(--line,#dce4ef);border-radius:12px;font:inherit;line-height:1.4;cursor:pointer}.choices b{flex:none}.choices .selected{border-color:var(--accent,#315fe8)}.choices .correct{border-color:#15803d}.choices .wrong{border-color:#b91c1c}.feedback{margin:18px 0;padding:16px;border-radius:12px;background:#eff4ff;line-height:1.5}.feedback p{margin-bottom:0}.actions{justify-content:flex-start;margin-top:20px}.secondary{background:white;color:inherit;border:2px solid var(--line,#dce4ef)}.text-action{min-height:48px;margin-top:12px;background:none;border:0;text-decoration:underline;color:inherit;font:inherit;cursor:pointer}.score{font-size:3rem;font-weight:800}.review{padding:14px 0;border-bottom:1px solid var(--line,#dce4ef)}.review p{margin-bottom:0}.muted{margin-top:20px}@media(max-width:850px){.reading-layout,.mode-grid,.analysis-grid{grid-template-columns:1fr}}
.title-answer{display:grid;gap:10px}.title-answer label{font-weight:700}.title-answer input{width:100%;min-height:56px;padding:12px 16px;border:2px solid var(--line,#dce4ef);border-radius:10px;font:inherit}.title-answer p{margin:0}
</style>
