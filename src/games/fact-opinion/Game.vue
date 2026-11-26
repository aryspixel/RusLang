<script setup>
import { computed, ref } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import TouchButton from '../../components/TouchButton.vue'
import ChoiceGroup from '../../components/ChoiceGroup.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import ProgressMeter from '../../components/ProgressMeter.vue'
import { paragraphs, evidence, tasks, typeOptions } from './data.js'
import courtyard from './courtyard.svg'

const index = ref(0)
const stage = ref('type')
const selected = ref(null)
const checked = ref(false)
const finished = ref(false)
const score = ref(0)
const task = computed(() => tasks[index.value])
const answer = computed(() => stage.value === 'type' ? task.value.type : task.value.proof)
const correct = computed(() => selected.value === answer.value)
const options = computed(() => stage.value === 'type' ? typeOptions : evidence.map((label, value) => ({ value, label })))

function check() {
  if (checked.value || selected.value === null) return
  checked.value = true
  if (correct.value) score.value++
}
function next() {
  if (!checked.value) return
  if (stage.value === 'type') stage.value = 'proof'
  else if (index.value === tasks.length - 1) finished.value = true
  else { index.value++; stage.value = 'type' }
  selected.value = null
  checked.value = false
}
function replay() {
  index.value = 0
  stage.value = 'type'
  selected.value = null
  checked.value = false
  finished.value = false
  score.value = 0
}
</script>

<template>
  <div class="game-layout fact-opinion">
    <h1>Факт или мнение? Проверяем по тексту</h1>
    <p>Прочитай текст. В каждом задании сначала определи вид утверждения, затем найди строку, которая помогает проверить ответ.</p>
    <SurfacePanel class="reading-panel">
      <img :src="courtyard" alt="У школьной библиотеки стоят три зелёные скамейки; рядом ученики читают книгу. Иллюстрация к тексту." />
      <div>
        <h2>Новая встреча у библиотеки</h2>
        <p v-for="paragraph in paragraphs" :key="paragraph">{{ paragraph }}</p>
      </div>
    </SurfacePanel>
    <SurfacePanel v-if="finished">
      <h2>Результат</h2>
      <p>Верных ответов: {{ score }} из {{ tasks.length * 2 }}.</p>
      <p>Факт подтверждается текстом и поддаётся проверке. Мнение передаёт оценку. Если детали в тексте нет или она изменена, утверждение не подтверждено.</p>
      <TouchButton @click="replay">Пройти ещё раз</TouchButton>
    </SurfacePanel>
    <SurfacePanel v-else>
      <ProgressMeter :current="index * 2 + (stage === 'proof' ? 2 : 1)" :total="tasks.length * 2" label="Шаг" />
      <p class="task-counter">Утверждение {{ index + 1 }} из {{ tasks.length }} · {{ stage === 'type' ? 'вид утверждения' : 'подтверждение' }}</p>
      <h2>{{ task.statement }}</h2>
      <p>{{ stage === 'type' ? 'Что это за утверждение?' : 'Какая строка текста помогает проверить утверждение?' }}</p>
      <ChoiceGroup :options="options" :selected="selected" :disabled="checked" :label="stage === 'type' ? 'Вид утверждения' : 'Строка текста'" @select="selected = $event" />
      <FeedbackMessage v-if="checked" :kind="correct ? 'success' : 'error'" :title="correct ? 'Верно' : 'Посмотри на текст ещё раз'">
        <p>Правильный ответ: {{ stage === 'type' ? typeOptions.find(option => option.value === task.type).label : evidence[task.proof] }}</p>
        <p>{{ task.why }}</p>
      </FeedbackMessage>
      <div class="action-row">
        <TouchButton v-if="!checked" :disabled="selected === null" @click="check">Проверить</TouchButton>
        <TouchButton v-else @click="next">{{ stage === 'type' ? 'Найти строку' : index === tasks.length - 1 ? 'Показать результат' : 'Дальше' }}</TouchButton>
      </div>
    </SurfacePanel>
  </div>
</template>

<style scoped>
.reading-panel { display:grid; grid-template-columns: minmax(220px, 34%) minmax(0, 1fr); gap:var(--space-3); align-items:start; }
.reading-panel img { width:100%; height:auto; border-radius:var(--radius-control); border:2px solid var(--color-border); }
.reading-panel p { max-width:68ch; }
.task-counter { margin-top:var(--space-2); font-weight:750; color:var(--color-primary-dark); }
@media(max-width:850px) { .reading-panel { grid-template-columns:1fr; }.reading-panel img { max-width:460px; } }
</style>
