<script setup>
import { computed, ref } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import TouchButton from '../../components/TouchButton.vue'
import ChoiceGroup from '../../components/ChoiceGroup.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import ProgressMeter from '../../components/ProgressMeter.vue'
import { blocks } from './data.js'

const mode = ref('learn')
const selectedBlocks = ref(blocks.map((_, i) => i))
const session = ref(null)
const item = computed(() => session.value?.items[session.value.index])
const answer = computed(() => item.value && session.value.answers[item.value.key])
const checked = computed(() => item.value && session.value.checked[item.value.key])
const score = computed(() => session.value?.items.filter(x => session.value.answers[x.key] === x.question.answer).length ?? 0)
const answered = computed(() => session.value?.items.filter(x => session.value.answers[x.key] !== undefined).length ?? 0)
const verified = computed(() => session.value?.items.filter(x => session.value.checked[x.key]).length ?? 0)
const allChecked = computed(() => session.value?.items.every(x => session.value.checked[x.key]))
const options = computed(() => item.value?.question.options.map((label, value) => ({ label: `${'АБВГ'[value]}. ${label}`, value })) ?? [])
const hints = [
  'Проверьте, можно ли объяснить признак предмета через действие: «тот, который…».',
  'Определите, выполняет ли предмет действие сам или испытывает действие со стороны.',
  'Найдите причастие, задайте от него вопросы к зависимым словам и отдельно найдите определяемое слово.',
  'Найдите определяемое существительное. Сравните его положение с оборотом.',
  'Проверьте местоимение, добавочное значение причины и согласование с определяемым словом.',
]

function toggleBlock(index) {
  selectedBlocks.value = selectedBlocks.value.includes(index)
    ? selectedBlocks.value.filter(x => x !== index)
    : [...selectedBlocks.value, index].sort()
}
function start() {
  const items = selectedBlocks.value.flatMap(block => blocks[block].questions.map((question, number) => ({
    key: `${block}-${number}`, block, question,
  })))
  if (!items.length) return
  session.value = { mode: mode.value, items, index: 0, answers: {}, checked: {}, shownHints: {}, finished: false }
}
function choose(value) {
  if (session.value.mode === 'learn' && checked.value) return
  session.value.answers[item.value.key] = value
}
function check() {
  if (answer.value === undefined) return
  session.value.checked[item.value.key] = true
}
function next() {
  if (session.value.mode === 'learn' && !checked.value) return
  if (session.value.index === session.value.items.length - 1) finish()
  else session.value.index++
}
function jump(block) {
  if (session.value.mode === 'learn' && !checked.value && !session.value.finished) return
  session.value.index = session.value.items.findIndex(x => x.block === block)
  session.value.finished = false
}
function finish() {
  if (session.value.mode === 'learn' && !allChecked.value) return
  if (session.value.mode === 'test' && answered.value < session.value.items.length && !window.confirm(`Вы не ответили на ${session.value.items.length - answered.value} вопрос(ов). Сдать тест с пропусками?`)) return
  session.value.finished = true
}
function toSetup() {
  if (session.value && !session.value.finished && answered.value && !window.confirm('Вернуться к выбору режима? Текущий прогресс будет потерян.')) return
  session.value = null
}
function printResults() { window.print() }
const percent = computed(() => session.value ? Math.round(score.value / session.value.items.length * 100) : 0)
const mark = computed(() => percent.value >= 90 ? 5 : percent.value >= 70 ? 4 : percent.value >= 50 ? 3 : 2)
</script>

<template>
  <div class="game-layout phrase-game">
    <h1>Причастие и причастный оборот</h1>
    <p>От распознавания причастия до пунктуации и исправления ошибок. Пять блоков, 30 заданий и объяснения на русском языке с казахскими подсказками.</p>

    <SurfacePanel v-if="!session" class="game-layout">
      <h2>Настройка тренажёра</h2>
      <p>Выберите режим и блоки. За каждый верный ответ — один балл.</p>
      <div class="phrase-options" role="group" aria-label="Режим работы">
        <TouchButton :variant="mode === 'learn' ? 'primary' : 'secondary'" :aria-pressed="mode === 'learn'" @click="mode = 'learn'">Режим обучения</TouchButton>
        <TouchButton :variant="mode === 'test' ? 'primary' : 'secondary'" :aria-pressed="mode === 'test'" @click="mode = 'test'">Режим теста</TouchButton>
      </div>
      <p>{{ mode === 'learn' ? 'Правило перед блоком, подсказка по запросу и проверка каждого ответа.' : 'Правила, подсказки и правильные ответы откроются после сдачи.' }}</p>
      <h3>Выберите блоки</h3>
      <div class="phrase-blocks" role="group" aria-label="Блоки заданий">
        <TouchButton v-for="(block, index) in blocks" :key="block.title" :variant="selectedBlocks.includes(index) ? 'primary' : 'secondary'" :aria-pressed="selectedBlocks.includes(index)" @click="toggleBlock(index)">
          {{ index + 1 }}. {{ block.title }} · {{ block.questions.length }}
        </TouchButton>
      </div>
      <div class="action-row"><TouchButton variant="secondary" @click="selectedBlocks = blocks.map((_, i) => i)">Все пять блоков</TouchButton><TouchButton :disabled="!selectedBlocks.length" @click="start">Начать</TouchButton></div>
    </SurfacePanel>

    <template v-else>
      <div class="action-row"><TouchButton variant="secondary" @click="toSetup">К выбору режима</TouchButton><span>{{ session.mode === 'learn' ? 'Режим обучения' : 'Режим теста' }}</span></div>
      <SurfacePanel v-if="session.finished" class="game-layout">
        <h2>Ваш результат</h2>
        <p>{{ score }} из {{ session.items.length }} · {{ percent }}% · оценка {{ mark }}</p>
        <p>Условная шкала: 90–100% — «5», 70–89% — «4», 50–69% — «3», ниже 50% — «2». Учитель может использовать собственные критерии.</p>
        <h3>Результат по блокам</h3>
        <p v-for="block in selectedBlocks" :key="block">{{ block + 1 }}. {{ blocks[block].title }}: {{ session.items.filter(x => x.block === block && session.answers[x.key] === x.question.answer).length }} из {{ blocks[block].questions.length }}</p>
        <div class="action-row"><TouchButton @click="start">Пройти ещё раз</TouchButton><TouchButton variant="secondary" @click="printResults">Печать результатов</TouchButton></div>
        <h3>Разбор всех заданий</h3>
        <article v-for="(entry, index) in session.items" :key="entry.key" class="phrase-review">
          <h4>{{ index + 1 }}. {{ entry.question.prompt }}</h4>
          <p>{{ session.answers[entry.key] === entry.question.answer ? '✓ Верно' : '✕ Неверно' }} · Ваш ответ: {{ session.answers[entry.key] === undefined ? 'нет ответа' : entry.question.options[session.answers[entry.key]] }}</p>
          <p>Правильный ответ: {{ entry.question.options[entry.question.answer] }}</p>
          <p>{{ entry.question.explanation }}</p>
        </article>
      </SurfacePanel>
      <SurfacePanel v-else class="game-layout">
        <ProgressMeter :current="session.mode === 'learn' ? verified : answered" :total="session.items.length" :label="session.mode === 'learn' ? 'Проверено' : 'Отвечено'" />
        <nav class="phrase-blocks" aria-label="Блоки тренажёра">
          <TouchButton v-for="block in selectedBlocks" :key="block" variant="secondary" :disabled="session.mode === 'learn' && !checked" :aria-current="item.block === block ? 'step' : undefined" @click="jump(block)">{{ block + 1 }}. {{ blocks[block].title }}</TouchButton>
        </nav>
        <div v-if="session.mode === 'learn' && (session.index === 0 || session.items[session.index - 1].block !== item.block)" class="phrase-rule">
          <h3>Правило · {{ blocks[item.block].title }}</h3><p>{{ blocks[item.block].rule }}</p><p lang="kk"><strong>Қазақша:</strong> {{ blocks[item.block].kz }}</p>
        </div>
        <p>Блок {{ item.block + 1 }} · Вопрос {{ session.index + 1 }} из {{ session.items.length }}</p>
        <h2>{{ item.question.prompt }}</h2>
        <p>Выберите один правильный ответ.</p>
        <ChoiceGroup :options="options" :selected="answer" :disabled="session.mode === 'learn' && !!checked" :label="item.question.prompt" @select="choose" />
        <div v-if="session.mode === 'learn'">
          <TouchButton variant="secondary" @click="session.shownHints[item.key] = !session.shownHints[item.key]">{{ session.shownHints[item.key] ? 'Скрыть подсказку' : 'Показать подсказку' }}</TouchButton>
          <p v-if="session.shownHints[item.key]" class="phrase-rule">{{ hints[item.block] }}</p>
          <FeedbackMessage v-if="checked" :kind="answer === item.question.answer ? 'success' : 'error'" :title="answer === item.question.answer ? 'Верно!' : 'Есть ошибка'">
            <p>Правильный ответ: {{ item.question.options[item.question.answer] }}</p><p>{{ item.question.explanation }}</p>
          </FeedbackMessage>
        </div>
        <p v-else>В тестовом режиме правильные ответы и подсказки скрыты до сдачи.</p>
        <div class="action-row">
          <TouchButton variant="secondary" :disabled="session.index === 0" @click="session.index--">Назад</TouchButton>
          <TouchButton v-if="session.mode === 'learn' && !checked" :disabled="answer === undefined" @click="check">Проверить</TouchButton>
          <TouchButton v-if="session.index < session.items.length - 1" :disabled="session.mode === 'learn' && !checked" @click="next">Дальше</TouchButton>
          <TouchButton v-else :disabled="session.mode === 'learn' && !checked" @click="finish">{{ session.mode === 'test' ? 'Сдать тест' : 'Посмотреть результат' }}</TouchButton>
        </div>
        <p v-if="session.mode === 'learn' && session.index === session.items.length - 1 && !allChecked">Для результата проверьте ответы на все вопросы.</p>
      </SurfacePanel>
    </template>
  </div>
</template>

<style scoped>
.phrase-game { max-width: 1440px; }
.phrase-options, .phrase-blocks { display: flex; flex-wrap: wrap; gap: 12px; }
.phrase-blocks { margin: 12px 0; }
.phrase-rule, .phrase-review { padding: 16px; border: 1px solid var(--color-border, #cdd8df); border-radius: 12px; }
.phrase-review { margin-top: 12px; }
.phrase-review h4 { margin: 0; }
@media print { .action-row, .phrase-blocks { display: none; } }
</style>
