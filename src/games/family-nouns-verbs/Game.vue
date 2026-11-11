<script setup>
import { computed, ref } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import TouchButton from '../../components/TouchButton.vue'
import ChoiceGroup from '../../components/ChoiceGroup.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import ProgressMeter from '../../components/ProgressMeter.vue'
import { rules, tasks } from './data.js'

const index = ref(0)
const score = ref(0)
const selected = ref(null)
const built = ref([])
const checked = ref(false)
const finished = ref(false)
const task = computed(() => tasks[index.value])
const correct = computed(() => task.value.type === 'choice'
  ? selected.value === task.value.answer
  : built.value.join(' ').toLocaleLowerCase('ru') === task.value.answer.toLocaleLowerCase('ru'))

function choose(value) {
  if (checked.value || built.value.includes(value)) return
  built.value.push(value)
}
function undoWord(position) {
  if (!checked.value) built.value.splice(position, 1)
}
function check() {
  if (checked.value || (task.value.type === 'choice' ? selected.value === null : built.value.length !== task.value.words.length)) return
  checked.value = true
  if (correct.value) score.value++
}
function next() {
  if (!checked.value) return
  if (index.value === tasks.length - 1) finished.value = true
  else { index.value++; selected.value = null; built.value = []; checked.value = false }
}
function restart() {
  index.value = 0; score.value = 0; selected.value = null; built.value = []; checked.value = false; finished.value = false
}
</script>

<template>
  <div class="game-layout family-game">
    <div class="family-header">
      <div>
        <h1>Моя семья дома</h1>
        <p class="family-subtitle">Существительное и глагол • {{ tasks.length }} заданий</p>
      </div>
      <TouchButton variant="secondary" @click="restart">Начать заново</TouchButton>
    </div>

    <div class="family-rules" aria-label="Памятка">
      <SurfacePanel v-for="rule in rules" :key="rule.title">
        <strong>{{ rule.title }}</strong>
        <p v-for="line in rule.lines" :key="line">{{ line }}</p>
      </SurfacePanel>
      <SurfacePanel><strong>Запомни</strong><p><span class="one-line">Али</span> <span class="two-lines">играет</span>.</p><p>Существительное — одна черта, глагол — две.</p></SurfacePanel>
    </div>

    <SurfacePanel v-if="finished" class="game-layout">
      <h2>Готово!</h2>
      <p class="family-result">Твой результат: <strong>{{ score }} из {{ tasks.length }}</strong></p>
      <p>{{ score >= 17 ? 'Отлично! Ты хорошо различаешь существительные и глаголы.' : score >= 12 ? 'Хорошо! Ещё немного тренировки — и будет отлично.' : 'Повтори правило и пройди тренажёр ещё раз.' }}</p>
    </SurfacePanel>

    <SurfacePanel v-else class="game-layout">
      <ProgressMeter :current="index + 1" :total="tasks.length" />
      <p class="family-kind">{{ task.type === 'build' ? 'СОБЕРИ ПРЕДЛОЖЕНИЕ' : 'ВЫБЕРИ ОТВЕТ' }}</p>
      <h2>{{ task.prompt }}</h2>
      <ChoiceGroup v-if="task.type === 'choice'" :options="task.options.map((label, value) => ({ label, value }))" :selected="selected" :disabled="checked" :label="task.prompt" @select="selected = $event" />
      <template v-else>
        <p>Нажимай на слова по порядку. Чтобы убрать слово, нажми на него в собранном предложении.</p>
        <div class="family-word-bank"><TouchButton v-for="(word, i) in task.words" :key="`${word}-${i}`" variant="secondary" :disabled="checked || built.includes(word)" @click="choose(word)">{{ word }}</TouchButton></div>
        <div class="family-built" aria-label="Собранное предложение">
          <button v-for="(word, i) in built" :key="`${word}-${i}`" type="button" :disabled="checked" @click="undoWord(i)">{{ word }}</button>
          <span v-if="built.length === 0">Выбери слова</span>
        </div>
      </template>
      <FeedbackMessage v-if="checked" :kind="correct ? 'success' : 'error'" :title="correct ? 'Верно!' : 'Пока неверно.'">
        <template v-if="task.type === 'choice'"><p>Правильный ответ: {{ task.options[task.answer] }}.</p><p>{{ task.explanation }}</p></template>
        <p v-else>Правильный порядок: {{ task.answer }}.</p>
      </FeedbackMessage>
      <div class="action-row">
        <TouchButton v-if="!checked" :disabled="task.type === 'choice' ? selected === null : built.length !== task.words.length" @click="check">Проверить</TouchButton>
        <TouchButton v-else @click="next">{{ index === tasks.length - 1 ? 'Показать результат' : 'Дальше' }}</TouchButton>
      </div>
    </SurfacePanel>
  </div>
</template>

<style scoped>
.family-subtitle { font-size: clamp(20px, 2vw, 28px); font-weight: 700; }
.family-header { display: flex; justify-content: space-between; align-items: center; gap: var(--space-3); }
.family-rules { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-3); margin-block: var(--space-3); }
.family-rules p { margin-block: 8px 0; }
.one-line { text-decoration: underline 3px; text-underline-offset: 4px; }
.two-lines { text-decoration: underline double 4px; text-underline-offset: 4px; }
.family-kind { font-size: 18px; font-weight: 800; color: var(--color-muted); }
.family-word-bank { display: flex; flex-wrap: wrap; gap: var(--space-2); margin-block: var(--space-3); }
.family-built { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2); min-height: 76px; padding: var(--space-3); border: 2px dashed var(--color-border); border-radius: var(--radius-control); }
.family-built button { min-height: var(--touch-min); padding-inline: 16px; border: 2px solid var(--color-border); border-radius: var(--radius-control); background: var(--color-surface); color: var(--color-text); font-size: 20px; }
.family-result { font-size: 28px; }
@media (max-width: 800px) { .family-rules { grid-template-columns: 1fr; } .family-header { align-items: flex-start; flex-direction: column; } }
</style>
