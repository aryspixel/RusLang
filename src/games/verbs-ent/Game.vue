<script setup>
import { computed, ref } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import TouchButton from '../../components/TouchButton.vue'
import ChoiceGroup from '../../components/ChoiceGroup.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import ProgressMeter from '../../components/ProgressMeter.vue'
import { sections, reference } from './data.js'

const mode = ref('learn')
const section = ref(0)
const runs = ref({})
const run = computed(() => runs.value[`${mode.value}-${section.value}`])
const item = computed(() => sections[section.value].items[run.value?.index])
const answer = computed(() => run.value?.answers[run.value.index])
const score = computed(() => run.value?.answers.filter((value, index) => value.selected === sections[section.value].items[index][2]).length ?? 0)
function currentRun() {
  const key = `${mode.value}-${section.value}`
  if (!runs.value[key]) runs.value[key] = { index: 0, answers: sections[section.value].items.map(() => ({ selected: null, locked: false })), finished: false, hint: false }
}
currentRun()
function choose(value) { if (!answer.value.locked) answer.value.selected = value }
function check() { if (answer.value.selected !== null && !answer.value.locked) answer.value.locked = true }
function next() { if (run.value.index + 1 < sections[section.value].items.length) { run.value.index++; run.value.hint = false } else run.value.finished = true }
function replay() { delete runs.value[`${mode.value}-${section.value}`]; currentRun() }
function selectSection(index) { section.value = index; currentRun() }
function selectMode(value) { mode.value = value; currentRun() }
</script>

<template>
  <div class="trainer">
    <header><p class="eyebrow">Подготовка к ЕНТ · морфология</p><h1>Глаголы</h1><p>Спряжение, вид, время, наклонение, правописание и формы глагола.</p><p>9–11 классы · рекомендация предварительная</p></header>
    <SurfacePanel class="controls">
      <p>Выберите раздел и режим. Отвечайте на вопросы, проверяйте ответ и переходите дальше. В тесте разбор откроется после завершения раздела.</p>
      <div class="row" aria-label="Режим"><TouchButton :variant="mode==='learn'?'primary':'secondary'" :aria-pressed="mode==='learn'" @click="selectMode('learn')">Обучение с подсказками</TouchButton><TouchButton :variant="mode==='test'?'primary':'secondary'" :aria-pressed="mode==='test'" @click="selectMode('test')">Тест без подсказок</TouchButton></div>
      <div class="row" aria-label="Разделы"><TouchButton v-for="(part, index) in sections" :key="part.name" :variant="section===index?'primary':'secondary'" :aria-pressed="section===index" @click="selectSection(index)">{{ index+1 }}. {{ part.name }}</TouchButton></div>
      <p>{{ sections[section].desc }} · {{ sections[section].items.length }} вопросов</p>
      <details v-if="mode==='learn'"><summary>Краткая памятка</summary><article v-for="rule in reference" :key="rule.title"><h3>{{ rule.title }}</h3><p>{{ rule.text }}</p></article></details>
    </SurfacePanel>
    <SurfacePanel v-if="run.finished" class="body">
      <h2>Результат: {{ score }} из {{ sections[section].items.length }}</h2><p>Разбор ответов</p>
      <details v-for="(question,index) in sections[section].items" :key="index" class="review"><summary>{{ index+1 }}. {{ run.answers[index].selected===question[2]?'✓ Верно':'× Ошибка' }} — {{ question[0] }}</summary><p><strong>Ваш ответ:</strong> {{ question[1][run.answers[index].selected] }}</p><p><strong>Правильный ответ:</strong> {{ question[1][question[2]] }}</p><p>{{ question[3] }}</p></details>
      <TouchButton @click="replay">Пройти заново</TouchButton>
    </SurfacePanel>
    <SurfacePanel v-else class="body">
      <ProgressMeter :current="run.index+1" :total="sections[section].items.length" /><h2>{{ item[0] }}</h2>
      <ChoiceGroup :options="item[1].map((label,value)=>({label,value}))" :selected="answer.selected" :disabled="answer.locked" label="Варианты ответа" @select="choose" />
      <div v-if="mode==='learn' && !answer.locked"><TouchButton variant="secondary" @click="run.hint=!run.hint">{{ run.hint?'Скрыть подсказку':'Подсказка' }}</TouchButton><p v-if="run.hint" role="status">Вспомните правило из памятки и сравните все варианты ответа.</p></div>
      <FeedbackMessage v-if="answer.locked && mode==='learn'" :kind="answer.selected===item[2]?'success':'error'" :title="answer.selected===item[2]?'Верно':'Есть ошибка'"><p><strong>Правильный ответ:</strong> {{ item[1][item[2]] }}</p><p>{{ item[3] }}</p></FeedbackMessage>
      <p v-if="answer.locked && mode==='test'" role="status">Ответ принят. Результат и объяснение откроются после раздела.</p>
      <TouchButton v-if="!answer.locked" :disabled="answer.selected===null" @click="check">{{ mode==='test'?'Принять ответ':'Проверить' }}</TouchButton><TouchButton v-else @click="next">{{ run.index===sections[section].items.length-1?'Результат':'Дальше' }}</TouchButton>
    </SurfacePanel>
  </div>
</template>

<style scoped>
.trainer,.controls,.body{display:grid;gap:18px}.trainer header h1{margin:.2em 0}.trainer header p{margin:.3em 0}.eyebrow{font-weight:700;text-transform:uppercase}.row{display:flex;flex-wrap:wrap;gap:10px}.review,details{border:1px solid var(--color-border);border-radius:12px;padding:12px}summary{cursor:pointer;min-height:48px;font-weight:700}article{border-top:1px solid var(--color-border)}
</style>
