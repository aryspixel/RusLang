<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import TouchButton from '../../components/TouchButton.vue'
import ChoiceGroup from '../../components/ChoiceGroup.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import ProgressMeter from '../../components/ProgressMeter.vue'
import SpeechControls from '../../components/SpeechControls.vue'
import SceneSearchBoard from '../../components/SceneSearchBoard.vue'
import house from './assets/house-v2.png'
import { tasks } from './data.js'

const answers = ref({})
const activeId = ref(null)
const selected = ref(null)
const finished = ref(false)
const confirmRestart = ref(false)
const dialog = ref(null)
const board = ref(null)
let trigger = null
const task = computed(() => tasks.find(item => item.id === activeId.value))
const checked = computed(() => Boolean(answers.value[activeId.value]))
const completed = computed(() => Object.keys(answers.value))
const score = computed(() => Object.values(answers.value).filter(item => item.correct).length)
const options = computed(() => task.value?.options.map(label => ({ value: label, label })) || [])

async function openTask(id) {
  if (answers.value[id] || dialog.value?.open) return
  trigger = document.activeElement
  activeId.value = id
  selected.value = null
  await nextTick()
  dialog.value.showModal()
}
function choose(value) { if (!checked.value) selected.value = value }
function check() {
  if (!task.value || checked.value || selected.value === null) return
  answers.value[activeId.value] = { selected: selected.value, correct: selected.value === task.value.answer }
}
async function closeTask() {
  dialog.value.close()
  activeId.value = null
  if (completed.value.length === tasks.length) finished.value = true
  await nextTick()
  if (finished.value) document.getElementById('ali-house-result')?.focus()
  else if (trigger?.isConnected && !trigger.disabled) trigger.focus()
  else board.value?.focus({ preventScroll: true })
}
async function restart() {
  answers.value = {}
  selected.value = null
  activeId.value = null
  finished.value = false
  confirmRestart.value = false
  await nextTick()
  board.value?.focus({ preventScroll: true })
}
onBeforeUnmount(() => dialog.value?.close())
</script>

<template>
  <div class="game-layout">
    <h1>Перепутанный дом Али</h1>
    <p>В доме есть предметы на своих местах и перепутанные вещи. Рассмотри комнаты, нажми на любой предмет и ответь на вопрос.</p>
    <div class="game-stats"><span>Верно: {{ score }}</span><span>Разобрано: {{ completed.length }} из {{ tasks.length }}</span></div>
    <ProgressMeter :current="completed.length" :total="tasks.length" label="Разобрано предметов" />
    <div class="action-row">
      <TouchButton variant="secondary" @click="completed.length ? confirmRestart = true : restart()">↻ Начать заново</TouchButton>
      <TouchButton v-if="completed.length === tasks.length && !finished" @click="finished = true">Показать результат</TouchButton>
    </div>
    <SurfacePanel v-if="confirmRestart" class="game-layout">
      <h2>Начать заново?</h2><p>Ответы текущей игры будут сброшены.</p>
      <div class="action-row"><TouchButton @click="restart">Начать заново</TouchButton><TouchButton variant="secondary" @click="confirmRestart = false">Продолжить игру</TouchButton></div>
    </SurfacePanel>
    <SurfacePanel v-if="finished" class="game-layout">
      <h2 id="ali-house-result" tabindex="-1">Все предметы разобраны!</h2>
      <p>Верных ответов: {{ score }} из {{ tasks.length }}.</p>
      <p>Ты разобрался, какие вещи стоят на своих местах, а какие лучше переставить.</p>
      <details class="game-help"><summary>Ответы и объяснения</summary>
        <article v-for="item in tasks" :key="item.id" class="house-review">
          <h3>{{ item.label }}</h3><p>{{ item.question }}</p>
          <p>Твой ответ: {{ answers[item.id].selected }}</p>
          <p>Правильный ответ: {{ item.answer }}</p><p>{{ item.explanation }}</p>
        </article>
      </details>
      <div class="action-row"><TouchButton @click="restart">Сыграть ещё раз</TouchButton><TouchButton variant="secondary" @click="finished = false">Посмотреть дом</TouchButton></div>
    </SurfacePanel>
    <div v-else ref="board" tabindex="-1" aria-label="Дом Али">
      <SceneSearchBoard :image="house" description="Дом Али в разрезе: спальня, детская, ванные, гостиная, кухня, прихожая и гараж. Рассмотри вещи и реши, что стоит не на своём месте."
        :items="tasks" :completed="completed" @select="openTask" />
    </div>
    <dialog ref="dialog" class="house-dialog" aria-labelledby="house-question" @cancel.prevent="closeTask">
      <div v-if="task" class="game-layout">
        <div class="action-row"><TouchButton variant="secondary" @click="closeTask">К рисунку</TouchButton></div>
        <h2 id="house-question">{{ task.question }}</h2>
        <SpeechControls :key="activeId + '-' + checked" :text="task.question + (checked ? ' ' + task.answer + ' ' + task.explanation : '')" label="Послушать" />
        <ChoiceGroup :options="options" :selected="selected" :disabled="checked" :label="task.question" @select="choose" />
        <FeedbackMessage v-if="checked" :kind="answers[activeId].correct ? 'success' : 'error'" :title="answers[activeId].correct ? 'Верно!' : 'Пока неверно.'">
          <p>Правильный ответ: {{ task.answer }}</p><p>{{ task.explanation }}</p>
        </FeedbackMessage>
        <div class="action-row"><TouchButton v-if="!checked" :disabled="selected === null" @click="check">Проверить</TouchButton><TouchButton v-else @click="closeTask">{{ completed.length === tasks.length ? 'Показать результат' : 'Продолжить' }}</TouchButton></div>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.house-dialog { width: min(760px, calc(100% - 24px)); max-height: calc(100dvh - 24px); overflow: auto; padding: var(--space-4); border: 2px solid var(--color-border); border-radius: var(--radius-card); background: var(--color-surface); color: var(--color-text); }
.house-dialog::backdrop { background: #13283bb3; }
.house-dialog :deep(.choice-group) { grid-template-columns: 1fr; }
.house-review { padding-block: var(--space-3); border-bottom: 2px solid var(--color-border); }
</style>
