<script setup>
import { computed, ref } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import TouchButton from '../../components/TouchButton.vue'
import ChoiceGroup from '../../components/ChoiceGroup.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import ProgressMeter from '../../components/ProgressMeter.vue'
import { tasks } from './data.js'

const index = ref(0)
const selected = ref(null)
const checked = ref(false)
const finished = ref(false)
const score = ref(0)
const task = computed(() => tasks[index.value])
const options = computed(() => task.value.options.map((label, value) => ({ label, value })))
const correct = computed(() => selected.value === task.value.answer)

function check() {
  if (selected.value === null || checked.value) return
  checked.value = true
  if (correct.value) score.value++
}
function next() {
  if (!checked.value) return
  if (index.value === tasks.length - 1) { finished.value = true; return }
  index.value++
  selected.value = null
  checked.value = false
}
function replay() {
  index.value = 0
  selected.value = null
  checked.value = false
  finished.value = false
  score.value = 0
}
</script>

<template>
  <div class="game-layout">
    <h1>Предлоги</h1>
    <SurfacePanel v-if="!finished">
      <p>Прочитай описание, выбери подходящий предлог и нажми «Проверить».</p>
      <ProgressMeter :current="index + 1" :total="tasks.length" label="Задание" />
      <p class="scene"><strong>Ситуация:</strong> {{ task.scene }}</p>
      <h2>{{ task.prompt }}</h2>
      <ChoiceGroup :options="options" :selected="selected" :disabled="checked" :label="task.prompt" @select="selected = $event" />
      <FeedbackMessage v-if="checked" :kind="correct ? 'success' : 'error'" :title="correct ? 'Верно!' : 'Пока неверно'">
        <p>Правильный ответ: {{ task.options[task.answer] }}.</p>
        <p>{{ task.explanation }}</p>
      </FeedbackMessage>
      <div class="action-row">
        <TouchButton v-if="!checked" :disabled="selected === null" @click="check">Проверить</TouchButton>
        <TouchButton v-else @click="next">{{ index === tasks.length - 1 ? 'Показать итог' : 'Дальше' }}</TouchButton>
      </div>
    </SurfacePanel>
    <SurfacePanel v-else>
      <h2>Тренировка завершена</h2>
      <p>Верных ответов: {{ score }} из {{ tasks.length }}.</p>
      <TouchButton @click="replay">Пройти ещё раз</TouchButton>
    </SurfacePanel>
  </div>
</template>

<style scoped>
.scene { padding: 18px; border-radius: var(--radius-control); background: var(--color-selected); font-size: 1.15em; }
</style>
