<script setup>
import { computed, reactive, ref } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import TouchButton from '../../components/TouchButton.vue'
import ChoiceGroup from '../../components/ChoiceGroup.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import ProgressMeter from '../../components/ProgressMeter.vue'
import { story, questions, grammarTasks, frames, oralCriteria } from './data.js'

const started = ref(false)
const section = ref('listen')
const sections = [
  { id: 'listen', label: '1. Понимаю текст' },
  { id: 'devices', label: '2. Разбираю текст' },
  { id: 'frames', label: '3. Собираю события' },
  { id: 'speak', label: '4. Отвечаю и пересказываю' },
]
const state = reactive({ index: 0, answers: {}, grammarIndex: 0, grammarAnswers: [], selectedFrame: null, order: [], framesChecked: false, oralDone: false, oralScore: null })
const sectionQuestions = computed(() => section.value === 'listen' ? questions.slice(0, 7) : questions.slice(7))
const question = computed(() => sectionQuestions.value[state.index])
// Use task identity so answer state remains stable when switching sections.
const taskKey = computed(() => `q:${section.value === 'listen' ? state.index : state.index + 7}`)
const currentAnswer = computed(() => state.answers[taskKey.value])
const grammarTask = computed(() => grammarTasks[state.grammarIndex])
const grammarAnswer = computed(() => state.grammarAnswers[state.grammarIndex])
const answeredCount = computed(() => Object.keys(state.answers).length + Object.keys(state.grammarAnswers).length)
const totalScore = computed(() => questions.reduce((n, task, i) => n + (state.answers[`q:${i}`] === task.answer ? (task.points ?? 1) : 0), 0) + grammarTasks.reduce((n, task, i) => n + (state.grammarAnswers[i] === task.answer ? task.points : 0), 0) + (state.framesChecked && state.order.every((value, i) => value === i) ? 2 : 0) + (state.oralScore ?? 0))

function answerQuestion(value) {
  if (currentAnswer.value !== undefined) return
  const i = section.value === 'listen' ? state.index : state.index + 7
  state.answers[`q:${i}`] = value
}
function advanceQuestion() {
  if (state.index < sectionQuestions.value.length - 1) state.index++
  else {
    if (section.value === 'devices' && Object.keys(state.grammarAnswers).length < grammarTasks.length) {
      document.getElementById('snapshot-grammar')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    state.index = 0
    if (section.value === 'listen') section.value = 'devices'
    else if (section.value === 'devices') section.value = 'frames'
  }
}
function answerGrammar(value) {
  if (grammarAnswer.value !== undefined) return
  state.grammarAnswers[state.grammarIndex] = value
}
function advanceGrammar() {
  if (state.grammarIndex < grammarTasks.length - 1) state.grammarIndex++
  else state.grammarIndex = 0
}
function addFrame(index) {
  if (state.framesChecked || state.order.includes(index)) return
  state.order.push(index)
  state.selectedFrame = null
}
function removeFrame(index) {
  if (state.framesChecked) return
  state.order.splice(index, 1)
}
function resetTrainer() {
  state.index = 0; state.answers = {}; state.grammarIndex = 0; state.grammarAnswers = []
  state.selectedFrame = null; state.order = []; state.framesChecked = false; state.oralDone = false; state.oralScore = null
  section.value = 'listen'
}
</script>

<template>
  <div class="game-layout snapshot-story">
    <h1>Снимок, который не сделали</h1>
    <p>Тренажёр по рассказу · художественный стиль · 9 класс</p>
    <SurfacePanel v-if="!started">
      <p>Прочитай рассказ или попроси учителя включить запись. Затем выполни задания: понимание текста, композиция, художественные средства, грамматика и пересказ от лица Мадины.</p>
      <TouchButton @click="started = true">Начать</TouchButton>
    </SurfacePanel>
    <template v-else>
      <nav class="action-row snapshot-tabs" aria-label="Разделы тренажёра">
        <TouchButton v-for="item in sections" :key="item.id" :variant="section === item.id ? 'primary' : 'secondary'" :aria-pressed="section === item.id" @click="section = item.id">{{ item.label }}</TouchButton>
      </nav>

      <SurfacePanel v-if="section === 'listen'">
        <h2>Сначала прочитай рассказ</h2>
        <p>В исходном комплекте также приложена аудиозапись. Её соответствие этому тексту пока не подтверждено.</p>
        <details class="game-help"><summary>Открыть рассказ</summary><p class="story-text">{{ story }}</p></details>
        <ProgressMeter :current="state.index + 1" :total="7" label="Задание" />
        <h2>{{ question.prompt }}</h2>
        <ChoiceGroup :options="question.options.map((label, value) => ({ label, value }))" :selected="currentAnswer ?? null" :disabled="currentAnswer !== undefined" label="Варианты ответа" @select="answerQuestion" />
        <FeedbackMessage v-if="currentAnswer !== undefined" :kind="currentAnswer === question.answer ? 'success' : 'error'" :title="currentAnswer === question.answer ? 'Верно' : 'Пока неверно'">
          <p>Правильный ответ: {{ question.options[question.answer] }}.</p><p>{{ question.why }}</p><p class="evidence">В тексте: «{{ question.evidence }}»</p>
        </FeedbackMessage>
        <div class="action-row"><TouchButton v-if="currentAnswer !== undefined" @click="advanceQuestion">{{ state.index === 6 ? 'К разбору текста' : 'Дальше' }}</TouchButton></div>
      </SurfacePanel>

      <SurfacePanel v-else-if="section === 'devices'">
        <h2>Тип речи, композиция и выразительные средства</h2>
        <details class="game-help"><summary>Рассказ для поиска примеров</summary><p class="story-text">{{ story }}</p></details>
        <ProgressMeter :current="state.index + 1" :total="10" label="Задание" />
        <p class="task-group">{{ question.group }}</p><h2>{{ question.prompt }}</h2>
        <ChoiceGroup :options="question.options.map((label, value) => ({ label, value }))" :selected="currentAnswer ?? null" :disabled="currentAnswer !== undefined" label="Варианты ответа" @select="answerQuestion" />
        <FeedbackMessage v-if="currentAnswer !== undefined" :kind="currentAnswer === question.answer ? 'success' : 'error'" :title="currentAnswer === question.answer ? 'Верно' : 'Пока неверно'">
          <p>Правильный ответ: {{ question.options[question.answer] }}.</p><p>{{ question.why }}</p><p class="evidence">В тексте: «{{ question.evidence }}»</p>
        </FeedbackMessage>
        <div class="action-row"><TouchButton v-if="currentAnswer !== undefined" @click="advanceQuestion">{{ state.index === 9 ? 'К сборке событий' : 'Дальше' }}</TouchButton></div>
        <div id="snapshot-grammar" class="grammar-block">
          <h2>Грамматические основы и виды предложений</h2>
          <ProgressMeter :current="state.grammarIndex + 1" :total="3" label="Предложение" />
          <blockquote>{{ grammarTask.sentence }}</blockquote>
          <ChoiceGroup :options="grammarTask.options.map((label, value) => ({ label, value }))" :selected="grammarAnswer ?? null" :disabled="grammarAnswer !== undefined" label="Вид предложения" @select="answerGrammar" />
          <FeedbackMessage v-if="grammarAnswer !== undefined" :kind="grammarAnswer === grammarTask.answer ? 'success' : 'error'" :title="grammarAnswer === grammarTask.answer ? 'Верно' : 'Пока неверно'">
            <p>Основы: {{ grammarTask.subject }} — {{ grammarTask.predicates }}.</p><p>{{ grammarTask.why }}</p>
          </FeedbackMessage>
          <div class="action-row"><TouchButton v-if="grammarAnswer !== undefined" @click="advanceGrammar">{{ state.grammarIndex === 2 ? 'К сборке событий' : 'Следующее предложение' }}</TouchButton></div>
        </div>
      </SurfacePanel>

      <SurfacePanel v-else-if="section === 'frames'">
        <h2>Расставь события по порядку</h2>
        <p>Выбирай карточку, затем нажми «Добавить в порядок». Карточка попадёт в следующую свободную позицию. Чтобы убрать её, нажми на неё в списке порядка.</p>
        <div class="frame-list"><button v-for="(frame, index) in frames" :key="frame" type="button" :class="{ 'frame-selected': state.selectedFrame === index }" :aria-pressed="state.selectedFrame === index" :disabled="state.framesChecked || state.order.includes(index)" @click="state.selectedFrame = index">{{ String.fromCharCode(1040 + index) }}. {{ frame }}</button></div>
        <div class="action-row"><TouchButton :disabled="state.selectedFrame === null || state.framesChecked" @click="addFrame(state.selectedFrame)">Добавить в порядок</TouchButton><TouchButton variant="secondary" :disabled="!state.order.length || state.framesChecked" @click="state.order.pop()">Убрать последний</TouchButton></div>
        <h3>Твой порядок</h3><ol class="ordered-frames"><li v-for="(frameIndex, index) in state.order" :key="`${frameIndex}-${index}`"><button type="button" :disabled="state.framesChecked" @click="removeFrame(index)">{{ String.fromCharCode(1040 + frameIndex) }}. {{ frames[frameIndex] }} — нажми, чтобы убрать</button></li></ol>
        <FeedbackMessage v-if="state.framesChecked" :kind="state.order.every((value, i) => value === i) ? 'success' : 'error'" :title="state.order.every((value, i) => value === i) ? 'Порядок верный' : 'Сверь порядок с рассказом'">
          <p>Правильный порядок: А → Б → В → Г → Д → Е.</p><p>Переход от фотоаппарата к помощи происходит, когда Мадина обращает внимание рассказчика на саженцы. Он понимает, что садовник защищает их от дождя, и спускается помочь.</p>
        </FeedbackMessage>
        <div class="action-row"><TouchButton v-if="!state.framesChecked" :disabled="state.order.length !== frames.length" @click="state.framesChecked = true">Проверить порядок</TouchButton><TouchButton v-else @click="section = 'speak'">К устному ответу</TouchButton><TouchButton v-if="!state.framesChecked" variant="secondary" @click="state.order = []">Сбросить порядок</TouchButton></div>
      </SurfacePanel>

      <SurfacePanel v-else>
        <h2>Устная часть</h2>
        <p><strong>1.</strong> Было ли верным решение Мадины помочь садовнику? Ответь по схеме: тезис → деталь текста → вывод.</p>
        <p><strong>2.</strong> Перескажи ключевой эпизод в 5–6 предложениях от лица Мадины.</p>
        <p>Критерии самопроверки:</p>
        <ul><li v-for="criterion in oralCriteria" :key="criterion">{{ criterion }}</li></ul>
        <p>Поставь себе балл за устную часть по критериям:</p>
        <ChoiceGroup :options="[0, 1, 2, 3, 4].map(value => ({ label: `${value} балл${value === 1 ? '' : value > 1 && value < 5 ? 'а' : 'ов'}`, value }))" :selected="state.oralScore" :disabled="state.oralDone" label="Баллы за устную часть" @select="state.oralScore = $event" />
        <details class="game-help"><summary>Показать возможную опору для ответа</summary><p>Я считаю, что Мадина поступила правильно: она заметила молодые деревья и поняла, что ливень может повредить корни. Я заметила, что садовнику одному трудно удержать плёнку. Поэтому я направилась к лестнице и позвала рассказчика помочь. Когда мы спустились, мы вместе расправили покрытие и закрепили его камнями. Я держала каркас, пока они укрепляли последний угол. После дождя саженцы остались под навесом.</p></details>
        <FeedbackMessage v-if="state.oralDone" title="Устная часть отмечена"><p>Сравни ответ с критериями и обсуди его с учителем. Автоматическая оценка устного ответа не выставляется.</p></FeedbackMessage>
        <p class="score">Итог: {{ totalScore }} / 25 баллов. Устный ответ отмечается отдельно по критериям.</p>
        <div class="action-row"><TouchButton v-if="!state.oralDone" :disabled="state.oralScore === null" @click="state.oralDone = true">Завершить и показать итог</TouchButton><TouchButton v-else @click="resetTrainer">Начать заново</TouchButton></div>
      </SurfacePanel>
      <p class="muted">Проверено заданий: {{ answeredCount }} из 20 · Итоговая шкала соответствует исходнику: 25 баллов, включая устную часть.</p>
    </template>
  </div>
</template>

<style scoped>
.snapshot-tabs { flex-wrap: wrap; }
.story-text { white-space: pre-line; line-height: 1.7; margin-top: var(--space-2); }
.task-group { color: var(--color-muted); font-weight: 800; }
.evidence { font-style: italic; }
.grammar-block { display: grid; gap: var(--space-2); margin-top: var(--space-5); padding-top: var(--space-4); border-top: 2px solid var(--color-border); }
blockquote { margin: 0; padding: var(--space-3); background: var(--color-selected); border-left: 6px solid var(--color-primary); font-size: clamp(22px, 1.6vw, 30px); }
.frame-list, .ordered-frames { display: grid; gap: var(--space-2); padding: 0; }
.frame-list button, .ordered-frames button { width: 100%; min-height: 64px; padding: 12px 18px; text-align: left; border: 2px solid var(--color-border); border-radius: var(--radius-control); background: var(--color-surface); color: inherit; }
.frame-list button:disabled { opacity: .55; }
.frame-list .frame-selected { border-color: var(--color-primary); background: var(--color-selected); }
.score { font-weight: 800; font-size: 1.2em; }
</style>
