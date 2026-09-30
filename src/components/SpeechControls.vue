<script setup>
import { onBeforeUnmount, ref } from 'vue'
import TouchButton from './TouchButton.vue'
const props = defineProps({ text: { type: String, required: true }, label: { type: String, default: 'Послушать' }, lang: { type: String, default: 'ru-RU' }, rate: { type: Number, default: .85 } })
const available = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
const speaking = ref(false), status = ref('')
let current = null
function stop() {
  if (current) { current.onend = current.onerror = null; window.speechSynthesis.cancel(); current = null }
  speaking.value = false
}
function play() {
  if (!available) return
  stop()
  try {
    const utterance = new SpeechSynthesisUtterance(props.text)
    utterance.lang = props.lang; utterance.rate = props.rate
    const voices = window.speechSynthesis.getVoices().filter(voice => voice.lang.toLowerCase().startsWith(props.lang.slice(0, 2).toLowerCase()))
    const hints = /pavel|dmitry|maxim|yuri|alexander|павел|дмитрий|максим|юрий|александр/i
    const voice = voices.find(voice => hints.test(voice.name)) || voices[0]
    if (voice) utterance.voice = voice
    current = utterance; speaking.value = true; status.value = 'Слушаем…'
    utterance.onend = () => { if (current === utterance) { current = null; speaking.value = false; status.value = 'Чтение завершено.' } }
    utterance.onerror = () => { if (current === utterance) { current = null; speaking.value = false; status.value = 'Не удалось озвучить. Прочитай текст на экране.' } }
    window.speechSynthesis.cancel(); window.speechSynthesis.speak(utterance)
  } catch { current = null; speaking.value = false; status.value = 'Не удалось озвучить. Прочитай текст на экране.' }
}
onBeforeUnmount(stop)
</script>
<template>
  <div>
    <div class="action-row"><TouchButton variant="secondary" :disabled="!available" @click="play">🔊 {{ label }}</TouchButton><TouchButton v-if="speaking" variant="secondary" @click="stop(); status = 'Остановлено.'">Стоп</TouchButton></div>
    <p v-if="status || !available" class="muted" role="status">{{ available ? status : 'Озвучивание недоступно. Прочитай текст на экране.' }}</p>
  </div>
</template>