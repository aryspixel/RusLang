<script setup>
import { computed, reactive, ref } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import TouchButton from '../../components/TouchButton.vue'
import ChoiceGroup from '../../components/ChoiceGroup.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import ProgressMeter from '../../components/ProgressMeter.vue'
import { sections } from './data.js'

const sectionId = ref(sections[0].id)
const states = reactive(Object.fromEntries(sections.map(section => [section.id, { index: 0, selected: null, checked: false, finished: false, score: 0 }])))
const section = computed(() => sections.find(item => item.id === sectionId.value))
const state = computed(() => states[sectionId.value])
const task = computed(() => section.value.tasks[state.value.index])
const choices = computed(() => task.value[1].map((label, value) => ({ label, value })))
const correct = computed(() => state.value.selected === task.value[2])
const totalScore = computed(() => sections.reduce((sum, item) => sum + states[item.id].score, 0))
const totalTasks = sections.reduce((sum, item) => sum + item.tasks.length, 0)
const presentationUrl = `${import.meta.env.BASE_URL}presentations/narechie-ent.pptx`
function check() {
  if (state.value.checked || state.value.selected === null) return
  state.value.checked = true
  if (correct.value) state.value.score++
}
function next() {
  if (!state.value.checked) return
  if (state.value.index === section.value.tasks.length - 1) { state.value.finished = true; return }
  state.value.index++
  state.value.selected = null
  state.value.checked = false
}
function replay() {
  Object.assign(state.value, { index: 0, selected: null, checked: false, finished: false, score: 0 })
}
</script>

<template>
  <div class="game-layout">
    <h1>Наречие · подготовка к ЕНТ</h1>
    <p>Изучите правило в презентации, затем пройдите тематические блоки. Выберите ответ, проверьте его и прочитайте объяснение.</p>
    <a class="presentation-link" :href="presentationUrl" download>Скачать презентацию «Наречие»</a>
    <div class="section-list" role="group" aria-label="Темы тренажёра">
      <TouchButton v-for="item in sections" :key="item.id" :variant="sectionId === item.id ? 'primary' : 'secondary'" :aria-pressed="sectionId === item.id" @click="sectionId = item.id">{{ item.title }}<span v-if="states[item.id].finished"> · {{ states[item.id].score }}/{{ item.tasks.length }}</span></TouchButton>
    </div>
    <SurfacePanel v-if="!state.finished">
      <h2>{{ section.title }}</h2>
      <p>{{ section.intro }}</p>
      <ProgressMeter :current="state.index + 1" :total="section.tasks.length" label="Задание" />
      <h3>{{ task[0] }}</h3>
      <ChoiceGroup :options="choices" :selected="state.selected" :disabled="state.checked" :label="task[0]" @select="state.selected = $event" />
      <FeedbackMessage v-if="state.checked" :kind="correct ? 'success' : 'error'" :title="correct ? 'Верно!' : 'Неверно'">
        <p>Правильный ответ: {{ task[1][task[2]] }}</p>
        <p>{{ task[3] }}</p>
      </FeedbackMessage>
      <div class="action-row"><TouchButton v-if="!state.checked" :disabled="state.selected === null" @click="check">Проверить</TouchButton><TouchButton v-else @click="next">{{ state.index === section.tasks.length - 1 ? 'К результату' : 'Дальше' }}</TouchButton></div>
    </SurfacePanel>
    <SurfacePanel v-else>
      <h2>Блок завершён</h2>
      <p>Верно: {{ state.score }} из {{ section.tasks.length }}. Всего в тренажёре: {{ totalScore }} из {{ totalTasks }}.</p>
      <div class="action-row"><TouchButton @click="replay">Повторить блок</TouchButton><TouchButton v-if="sections.findIndex(item => item.id === sectionId) < sections.length - 1" variant="secondary" @click="sectionId = sections[sections.findIndex(item => item.id === sectionId) + 1].id">Следующая тема</TouchButton></div>
    </SurfacePanel>
  </div>
</template>

<style scoped>
.section-list{display:flex;flex-wrap:wrap;gap:12px;margin:24px 0}.section-list .touch-button{min-height:56px}.presentation-link{display:inline-flex;align-items:center;min-height:56px;padding:12px 18px;border:2px solid var(--color-border);border-radius:var(--radius-control);background:var(--color-surface);color:inherit;font-weight:700}.presentation-link:focus-visible{outline:3px solid var(--color-focus);outline-offset:2px}.action-row{display:flex;flex-wrap:wrap;gap:12px;margin-top:24px}h3{font-size:1.35em;margin:24px 0 16px}
</style>
