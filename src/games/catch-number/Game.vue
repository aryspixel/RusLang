<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import TouchButton from '../../components/TouchButton.vue'
import ChoiceGroup from '../../components/ChoiceGroup.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import ProgressMeter from '../../components/ProgressMeter.vue'
import { config, colors, text, answerExplanation } from './data.js'
const stage = ref(null), numberElement = ref(null)
const phase = ref('intro'), round = ref(0), score = ref(0), target = ref(0), selected = ref(null), remaining = ref(3)
const flicker = ref(false), reduceMotion = ref(false), appearance = ref({})
const motionQuery = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null
reduceMotion.value = motionQuery?.matches ?? false
const motionChanged = event => { reduceMotion.value = event.matches }
motionQuery?.addEventListener('change', motionChanged)
let interval, timeout
const options = Array.from({ length: config.max }, (_, i) => ({ value: i + 1, label: String(i + 1) }))
const correct = computed(() => selected.value === target.value)
function clearTimers() { clearInterval(interval); clearTimeout(timeout) }
async function next() {
  clearTimers()
  if (round.value === config.rounds) { phase.value = 'result'; return }
  round.value++; selected.value = null; remaining.value = config.seconds
  target.value = 1 + Math.floor(Math.random() * config.max)
  appearance.value = { color: colors[Math.floor(Math.random() * colors.length)], left: '10px', top: '10px', fontSize: `${90 + Math.random() * 100}px` }
  phase.value = 'show'
  await nextTick()
  if (phase.value !== 'show' || !stage.value || !numberElement.value) return
  const maxX = Math.max(0, stage.value.clientWidth - numberElement.value.offsetWidth - 20)
  const maxY = Math.max(0, stage.value.clientHeight - numberElement.value.offsetHeight - 20)
  appearance.value = { ...appearance.value, left: `${10 + Math.random() * maxX}px`, top: `${10 + Math.random() * maxY}px` }
  const started = performance.now()
  interval = setInterval(() => { remaining.value = Math.max(0, config.seconds - (performance.now() - started) / 1000) }, 100)
  timeout = setTimeout(() => { clearTimers(); remaining.value = 0; phase.value = 'answer' }, config.seconds * 1000)
}
function start() { round.value = 0; score.value = 0; next() }
function answer(value) { if (phase.value !== 'answer') return; selected.value = value; if (correct.value) score.value++; phase.value = 'feedback' }
onBeforeUnmount(() => { clearTimers(); motionQuery?.removeEventListener('change', motionChanged) })
</script>
<template>
  <div class="game-layout">
    <h1>✨ Поймай число — 1–20</h1>
    <SurfacePanel v-if="phase === 'intro'">
      <h2>{{ text.ready }}</h2><p>{{ flicker ? text.flashing : text.intro }}</p><p class="game-translation" lang="kk">{{ flicker ? text.flashingKz : text.introKz }}</p>
      <p>{{ text.instruction }}</p><p class="game-translation" lang="kk">{{ text.instructionKz }}</p>
      <div class="action-row"><TouchButton variant="secondary" :aria-pressed="flicker" :disabled="reduceMotion" @click="flicker = !flicker">{{ flicker ? '✓ ' : '' }}{{ text.flicker }}</TouchButton></div>
      <p v-if="reduceMotion" class="muted">Уменьшение анимации включено: число показывается спокойно.</p>
      <TouchButton @click="start">{{ text.start }}</TouchButton>
    </SurfacePanel>
    <SurfacePanel v-else-if="phase === 'result'">
      <h2>🏆 {{ score }} из {{ config.rounds }}</h2><p>{{ score >= 8 ? text.excellent : text.again }}</p><TouchButton @click="start">{{ text.repeat }}</TouchButton>
    </SurfacePanel>
    <SurfacePanel v-else>
      <ProgressMeter :current="round" :total="config.rounds" label="Раунд / Айналым" />
      <div class="game-stats"><span>⭐ Баллы / Ұпай: {{ score }}</span><span>⏱ {{ remaining.toFixed(1) }} с</span></div>
      <div v-if="phase === 'show'" ref="stage" class="memory-stage" :aria-label="text.intro">
        <span ref="numberElement" class="memory-number" :class="{ 'memory-number--flicker': flicker && !reduceMotion }" :style="appearance">{{ target }}</span>
      </div>
      <template v-else>
        <h2>{{ text.question }}</h2>
        <ChoiceGroup class="number-options" :options="options" :selected="selected" :disabled="phase === 'feedback'" :label="text.question" @select="answer" />
        <FeedbackMessage v-if="phase === 'feedback'" :kind="correct ? 'success' : 'error'" :title="correct ? text.correct : 'Неверно / Қате'">{{ answerExplanation(target) }}</FeedbackMessage>
        <div v-if="phase === 'feedback'" class="action-row"><TouchButton @click="next">{{ round === config.rounds ? 'Показать итог / Нәтиже' : text.next }}</TouchButton></div>
      </template>
    </SurfacePanel>
  </div>
</template>
<style scoped>
.memory-stage { position: relative; min-height: 330px; margin-top: var(--space-3); overflow: hidden; border: 3px solid var(--color-border); border-radius: var(--radius-card); }
.memory-number { position: absolute; font-weight: 900; line-height: 1; user-select: none; }
.memory-number--flicker { animation: pulse .9s infinite alternate; }
.number-options { grid-template-columns: repeat(10, minmax(0, 1fr)); gap: 12px; }
.number-options :deep(button) { min-width: 0; padding: 10px 4px; text-align: center; }
@keyframes pulse { from { opacity: .4; } to { opacity: 1; } }
@media(max-width: 900px) { .number-options { grid-template-columns: repeat(5, minmax(0, 1fr)); } }
@media(max-width: 420px) { .memory-number { font-size: 90px !important; } }
</style>
