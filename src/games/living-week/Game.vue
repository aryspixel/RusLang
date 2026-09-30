<script setup>
import { computed, ref } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import ProgressMeter from '../../components/ProgressMeter.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import TouchButton from '../../components/TouchButton.vue'
import { days, shortDays, tasks } from './data.js'

const order = ref([])
const index = ref(0)
const score = ref(0)
const streak = ref(0)
const answer = ref(null)
const finished = ref(false)
const task = computed(() => order.value[index.value])
function restart() {
  order.value = [...tasks].sort(() => Math.random() - .5).slice(0, 10)
  index.value = score.value = streak.value = 0
  answer.value = null
  finished.value = false
}
function choose(i) {
  if (answer.value !== null) return
  answer.value = i
  if (i === task.value.answer) { score.value++; streak.value++ } else streak.value = 0
}
function next() {
  if (answer.value === null) return
  if (index.value === 9) finished.value = true
  else { index.value++; answer.value = null }
}
restart()
</script>

<template>
  <div class="game-layout">
    <h1>🗓️ Живая неделя</h1>
    <p>Прочитай задание и выбери правильный день.</p>
    <div class="game-stats"><span>⭐ Баллы: {{ score }}</span><span>🔥 Серия: {{ streak }}</span></div>
    <SurfacePanel v-if="!finished">
      <ProgressMeter :current="index + 1" :total="10" />
      <h2>{{ task.ru }}</h2><p class="game-translation">{{ task.kz }}</p>
      <div class="game-options game-options--days">
        <button v-for="(day, i) in days" :key="day" type="button" class="choice-group__option" :class="{ 'choice-group__option--selected': answer === i }" :disabled="answer !== null" @click="choose(i)"><strong>{{ shortDays[i] }}</strong><br>{{ day }}</button>
      </div>
      <FeedbackMessage v-if="answer !== null" :kind="answer === task.answer ? 'success' : 'error'" :title="answer === task.answer ? 'Верно! 🎉' : 'Попробуем запомнить'">Правильный ответ — {{ days[task.answer] }}.</FeedbackMessage>
      <div class="action-row"><TouchButton v-if="answer !== null" @click="next">{{ index === 9 ? 'Показать итог' : 'Следующее задание' }}</TouchButton><TouchButton variant="secondary" @click="restart">Начать заново</TouchButton></div>
    </SurfacePanel>
    <SurfacePanel v-else><h2>Готово! Твой результат: {{ score }} из 10 ⭐</h2><p>{{ score >= 8 ? 'Отлично знаешь дни недели! 🏆' : 'Сыграй ещё раз — задания перемешаются.' }}</p><TouchButton @click="restart">Сыграть ещё раз</TouchButton></SurfacePanel>
    <details class="game-help"><summary>Подсказка: порядок дней недели</summary><p>Понедельник → вторник → среда → четверг → пятница → суббота → воскресенье.</p></details>
  </div>
</template>
