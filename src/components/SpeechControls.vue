<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import TouchButton from './TouchButton.vue'
const props = defineProps({ text: { type: String, required: true }, src: { type: String, default: '' }, label: { type: String, default: 'Послушать' }, lang: { type: String, default: 'ru-RU' }, rate: { type: Number, default: .85 } })
const speechAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
const available = computed(() => Boolean(props.src) || speechAvailable)
const recording = ref(null), speaking = ref(false), status = ref('')
let current = null, playback = 0
function stop() {
  playback++
  if (recording.value) { recording.value.pause(); recording.value.currentTime = 0 }
  if (current) { current.onend = current.onerror = null; window.speechSynthesis.cancel(); current = null }
  speaking.value = false
}
function failed() {
  if (!speaking.value) return
  stop()
  status.value = 'Не удалось озвучить. Прочитай текст на экране.'
}
function ended() { speaking.value = false; status.value = 'Чтение завершено.' }
async function play() {
  if (!available.value) return
  stop()
  speaking.value = true; status.value = 'Слушаем…'
  const attempt = playback
  if (props.src) {
    try { await recording.value.play() } catch { if (attempt === playback) failed() }
    return
  }
  try {
    const utterance = new SpeechSynthesisUtterance(props.text)
    utterance.lang = props.lang; utterance.rate = props.rate
    const voices = window.speechSynthesis.getVoices().filter(voice => voice.lang.toLowerCase().startsWith(props.lang.slice(0, 2).toLowerCase()))
    const hints = /pavel|dmitry|maxim|yuri|alexander|павел|дмитрий|максим|юрий|александр/i
    const voice = voices.find(voice => hints.test(voice.name)) || voices[0]
    if (voice) utterance.voice = voice
    current = utterance
    utterance.onend = () => { if (current === utterance) { current = null; ended() } }
    utterance.onerror = () => { if (current === utterance) { current = null; failed() } }
    window.speechSynthesis.cancel(); window.speechSynthesis.speak(utterance)
  } catch { current = null; failed() }
}
watch(() => props.src, () => { stop(); status.value = '' })
onBeforeUnmount(stop)
</script>
<template>
  <div>
    <audio v-if="src" ref="recording" :src="src" preload="none" @ended="ended" @error="failed" />
    <div class="action-row"><TouchButton variant="secondary" :disabled="!available" @click="play">🔊 {{ label }}</TouchButton><TouchButton v-if="speaking" variant="secondary" @click="stop(); status = 'Остановлено.'">Стоп</TouchButton></div>
    <p v-if="status || !available" class="muted" role="status">{{ available ? status : 'Озвучивание недоступно. Прочитай текст на экране.' }}</p>
  </div>
</template>
