<script setup>
import { computed, ref } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import ProgressMeter from '../../components/ProgressMeter.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import TouchButton from '../../components/TouchButton.vue'
import { days, vocabulary, ui } from './data.js'

const stage = ref('intro')
const bank = ref([])
const slots = ref(Array(7).fill(null))
const selected = ref(null)
const incomplete = ref(false)
const checks = ref(0)
const correct = computed(() => slots.value.filter((id, index) => id === days[index].id).length)
const filled = computed(() => slots.value.filter(id => id !== null).length)
const locked = computed(() => stage.value !== 'editing')
const selectedDay = computed(() => days.find(day => day.id === selected.value))
const feedback = computed(() => correct.value === 7 ? ui.success : ui.result(correct.value))
const dayById = id => days.find(day => day.id === id)
function shuffle() {
  const ids = days.map(day => day.id)
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
  }
  bank.value = ids
  slots.value = Array(7).fill(null)
  selected.value = null
  incomplete.value = false
  checks.value = 0
  stage.value = 'editing'
}
function select(id) {
  if (locked.value) return
  selected.value = selected.value === id ? null : id
}
function place(index, id = selected.value) {
  if (locked.value || id === null) return
  const oldIndex = slots.value.indexOf(id)
  if (oldIndex === index) { selected.value = null; return }
  const displaced = slots.value[index]
  if (oldIndex >= 0) slots.value[oldIndex] = null
  bank.value = bank.value.filter(value => value !== id)
  if (displaced !== null) bank.value.push(displaced)
  slots.value[index] = id
  selected.value = null
  incomplete.value = false
}
function tapSlot(index) {
  if (selected.value !== null) place(index)
  else if (slots.value[index] !== null) select(slots.value[index])
}
function returnToBank() {
  if (locked.value || selected.value === null) return
  const index = slots.value.indexOf(selected.value)
  if (index >= 0) { slots.value[index] = null; bank.value.push(selected.value) }
  selected.value = null
}
function drag(event, id) {
  if (locked.value) { event.preventDefault(); return }
  event.dataTransfer.setData('text/plain', String(id))
  event.dataTransfer.effectAllowed = 'move'
}
function drop(event, index) {
  const value = event.dataTransfer.getData('text/plain')
  if (value !== '' && days.some(day => day.id === Number(value))) place(index, Number(value))
}
function check() {
  if (locked.value) return
  if (filled.value < 7) { incomplete.value = true; return }
  checks.value++
  selected.value = null
  incomplete.value = false
  stage.value = 'checked'
}
function next() {
  stage.value = correct.value === 7 ? 'finished' : 'editing'
}
</script>

<template>
  <div class="game-layout">
    <h1>🗓️ {{ ui.title.ru }}</h1>
    <p>{{ ui.instruction.ru }}<br><span class="game-translation" lang="kk">{{ ui.instruction.kz }}</span></p>
    <SurfacePanel v-if="stage === 'intro'">
      <h2>Как играть</h2>
      <p>{{ ui.tapInstruction.ru }}</p>
      <p class="game-translation" lang="kk">{{ ui.tapInstruction.kz }}</p>
      <TouchButton @click="shuffle">Начать / Бастау</TouchButton>
    </SurfacePanel>
    <template v-else-if="stage !== 'finished'">
      <SurfacePanel>
        <ProgressMeter :current="filled" :total="7" label="Заполнено мест" />
        <h2>{{ ui.bankTitle.ru }} <span class="game-translation" lang="kk">/ {{ ui.bankTitle.kz }}</span></h2>
        <div class="week-grid" role="group" :aria-label="ui.bankTitle.ru">
          <button v-for="id in bank" :key="id" type="button" class="choice-group__option week-day" :class="{ 'choice-group__option--selected': selected === id }" :aria-pressed="selected === id" :disabled="locked" :draggable="!locked" @dragstart="drag($event, id)" @click="select(id)">{{ dayById(id).ru }}<span v-if="selected === id" class="week-note">✓ Выбрано</span></button>
        </div>
        <p v-if="!bank.length" class="muted">Все карточки размещены. / Барлық карточкалар орналастырылды.</p>
        <p role="status" aria-live="polite">{{ selectedDay ? `Выбран день: ${selectedDay.ru}. Нажми на место.` : 'Выбери день, затем место. / Күнді, содан кейін орынды таңда.' }}</p>
        <div v-if="selected !== null" class="action-row"><TouchButton variant="secondary" @click="selected = null">Отменить выбор / Таңдауды жою</TouchButton><TouchButton v-if="slots.includes(selected)" variant="secondary" @click="returnToBank">Вернуть в набор / Жиынтыққа қайтару</TouchButton></div>
      </SurfacePanel>
      <SurfacePanel>
        <h2>{{ ui.orderTitle.ru }} <span class="game-translation" lang="kk">/ {{ ui.orderTitle.kz }}</span></h2>
        <div class="week-grid" role="group" :aria-label="ui.orderTitle.ru">
          <button v-for="(id, index) in slots" :key="index" type="button" class="choice-group__option week-slot" :class="{ 'choice-group__option--selected': id !== null && selected === id, 'week-slot--correct': stage === 'checked' && id === days[index].id, 'week-slot--incorrect': stage === 'checked' && id !== days[index].id }" :disabled="locked" :aria-pressed="id !== null && selected === id" :draggable="id !== null && !locked" :aria-label="`Место ${index + 1}: ${id === null ? 'пусто' : dayById(id).ru}`" @click="tapSlot(index)" @dragstart="drag($event, id)" @dragover.prevent @drop.prevent="drop($event, index)">
            <span class="week-note">Место {{ index + 1 }} / {{ index + 1 }}-орын</span><span>{{ id === null ? 'Поставить день' : dayById(id).ru }}</span><span v-if="id === null" class="week-note" lang="kk">Күнді орналастыр</span><span v-if="selected === id && id !== null" class="week-note">✓ Выбрано</span><span v-if="stage === 'checked'" class="week-note">{{ id === days[index].id ? '✓ Верно' : '✕ Нужно переставить' }}</span>
          </button>
        </div>
        <FeedbackMessage v-if="incomplete" kind="info" :title="ui.incomplete.ru"><span lang="kk">{{ ui.incomplete.kz }}</span></FeedbackMessage>
        <FeedbackMessage v-if="stage === 'checked'" :kind="correct === 7 ? 'success' : 'error'" :title="feedback.ru">
          <p lang="kk">{{ feedback.kz }}</p><p>Правильный порядок / Дұрыс рет:</p><p>{{ days.map(day => day.ru.toLowerCase()).join(' → ') }}.</p><p class="game-translation" lang="kk">{{ days.map(day => day.kz).join(' → ') }}.</p><p>{{ ui.explanation.ru }}</p><p lang="kk">{{ ui.explanation.kz }}</p>
        </FeedbackMessage>
        <div class="action-row"><TouchButton v-if="stage === 'editing'" @click="check">✓ {{ ui.check.ru }} / {{ ui.check.kz }}</TouchButton><TouchButton v-else @click="next">{{ correct === 7 ? 'Показать итог / Нәтижені көрсету' : 'Дальше: исправить / Әрі қарай: түзету' }}</TouchButton><TouchButton variant="secondary" @click="shuffle">↻ {{ ui.shuffle.ru }} / {{ ui.shuffle.kz }}</TouchButton></div>
      </SurfacePanel>
    </template>
    <SurfacePanel v-else>
      <h2>{{ ui.success.ru }}</h2><p lang="kk">{{ ui.success.kz }}</p><p>Все 7 дней стоят на своих местах. Проверок: {{ checks }}.</p><p lang="kk">Барлық 7 күн өз орнында. Тексеру саны: {{ checks }}.</p><TouchButton @click="shuffle">Сыграть ещё раз / Қайта ойнау</TouchButton>
    </SurfacePanel>
    <SurfacePanel>
      <h2>{{ ui.vocabularyTitle.ru }} / <span lang="kk">{{ ui.vocabularyTitle.kz }}</span></h2>
      <dl class="week-vocabulary"><template v-for="day in vocabulary" :key="day.ru"><dt>{{ day.ru }}</dt><dd lang="kk">{{ day.kz }}</dd></template></dl>
    </SurfacePanel>
  </div>
</template>

<style scoped>
.week-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--space-2); margin: var(--space-3) 0; }
.week-day, .week-slot { min-width: 0; text-align: center; font-size: clamp(20px, 1.55vw, 28px); overflow-wrap: anywhere; }
.week-slot { display: flex; flex-direction: column; justify-content: center; gap: var(--space-1); min-height: 130px; }
.week-note { display: block; font-size: clamp(18px, 1.2vw, 22px); }
.week-slot--correct { border-color: var(--color-success); background: var(--color-success-bg); }
.week-slot--incorrect { border-color: var(--color-error); background: var(--color-error-bg); }
.week-slot:disabled { opacity: 1; }
.week-vocabulary { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); max-width: 850px; margin: 0; gap: var(--space-1) var(--space-3); }
.week-vocabulary dt { font-weight: 750; }
.week-vocabulary dd { margin: 0; }
@media (max-width: 900px) { .week-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 500px) { .week-grid { grid-template-columns: 1fr; } .week-vocabulary { gap: var(--space-1) var(--space-2); font-size: 18px; } }
</style>

