<script setup>
import { computed, ref } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import TouchButton from '../../components/TouchButton.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import room from './room.jpg'
import { objects, counts, wheres, sentences } from './data.js'

const tabs = [
  { id: 'find', label: '1. Найди предмет', title: '🧸 Найди предметы', guide: 'Нажми на предмет прямо на картинке. Найденные предметы будут отмечены. / Суреттен затты тап.' },
  { id: 'count', label: '2. Посчитай', title: '🔢 Посчитай предметы', guide: 'Посмотри на ту же комнату и выбери число. / Заттарды сана.' },
  { id: 'where', label: '3. Где находится?', title: '📍 Где находится?', guide: 'Выбери правильный ответ и произнеси полное предложение. / Дұрыс жауапты таңда.' },
  { id: 'sentence', label: '4. Собери предложение', title: '✏️ Собери предложение', guide: 'Нажимай на слова в правильном порядке. Прочитай, что получилось. / Сөйлем құрастыр.' },
]
const tab = ref('find')
const found = ref([])
const findChecked = ref(false)
const indices = ref({ count: 0, where: 0, sentence: 0 })
const answers = ref({ count: null, where: null })
const checked = ref({ count: false, where: false, sentence: false })
const scores = ref({ count: 0, where: 0, sentence: 0 })
const sequence = ref([])
const active = computed(() => tabs.find(item => item.id === tab.value))
const questions = computed(() => tab.value === 'count' ? counts : wheres)
const question = computed(() => questions.value[indices.value[tab.value]])
const sentence = computed(() => sentences[indices.value.sentence])
const sentenceCorrect = computed(() => sequence.value.length === sentence.value.length && sequence.value.every((word, i) => word === i))
const bank = computed(() => sentence.value.map((word, i) => ({ word, i })).sort((a, b) => ((a.i * 7 + 3) % 11) - ((b.i * 7 + 3) % 11)))

function toggleFound(id) {
  if (findChecked.value) return
  found.value = found.value.includes(id) ? found.value.filter(item => item !== id) : [...found.value, id]
}
function resetFind() { found.value = []; findChecked.value = false }
function checkChoice() {
  const mode = tab.value
  if (checked.value[mode] || answers.value[mode] === null) return
  checked.value[mode] = true
  if (answers.value[mode] === question.value.ans) scores.value[mode]++
}
function nextChoice() {
  const mode = tab.value
  if (indices.value[mode] === questions.value.length - 1) indices.value[mode] = questions.value.length
  else indices.value[mode]++
  answers.value[mode] = null
  checked.value[mode] = false
}
function resetChoice(mode) { indices.value[mode] = 0; answers.value[mode] = null; checked.value[mode] = false; scores.value[mode] = 0 }
function checkSentence() {
  if (checked.value.sentence || !sequence.value.length) return
  checked.value.sentence = true
  if (sentenceCorrect.value) scores.value.sentence++
}
function nextSentence() {
  if (indices.value.sentence === sentences.length - 1) indices.value.sentence = sentences.length
  else indices.value.sentence++
  sequence.value = []; checked.value.sentence = false
}
function resetSentences() { indices.value.sentence = 0; sequence.value = []; checked.value.sentence = false; scores.value.sentence = 0 }
</script>

<template>
  <div class="game-layout toy-room">
    <h1>🔎 В комнате игрушек</h1>
    <p>Найди • Посчитай • Скажи • Составь предложение</p>
    <nav class="toy-tabs" aria-label="Блоки игры">
      <button v-for="item in tabs" :key="item.id" type="button" :aria-current="tab === item.id ? 'page' : undefined" :class="{ current: tab === item.id }" @click="tab = item.id">{{ item.label }}</button>
    </nav>
    <SurfacePanel>
      <h2>{{ active.title }}</h2>
      <p>{{ active.guide }}</p>
      <div class="toy-layout">
        <div class="toy-scene">
          <img :src="room" alt="Комната с игрушками: кровать, стол, полка, стул и игрушки" />
          <template v-if="tab === 'find'">
            <button v-for="object in objects" :key="object.id" type="button" class="toy-hotspot" :class="{ found: found.includes(object.id) }" :style="{ left: `${object.x}%`, top: `${object.y}%`, width: `${object.w}%`, height: `${object.h}%` }" :aria-label="`Найти ${object.word}`" :aria-pressed="found.includes(object.id)" :disabled="findChecked" @click="toggleFound(object.id)"><span v-if="found.includes(object.id)">✓</span></button>
          </template>
        </div>
        <div class="toy-task">
          <template v-if="tab === 'find'">
            <h3>Найди и отметь ✓</h3>
            <div class="toy-list"><button v-for="object in objects" :key="object.id" type="button" :aria-pressed="found.includes(object.id)" :disabled="findChecked" @click="toggleFound(object.id)">{{ object.emoji }} {{ object.word }} <span v-if="found.includes(object.id)">✓</span></button></div>
            <div class="action-row"><TouchButton v-if="!findChecked" @click="findChecked = true">Проверить</TouchButton><TouchButton v-else @click="resetFind">Начать заново</TouchButton></div>
            <FeedbackMessage v-if="findChecked" :kind="found.length === objects.length ? 'success' : 'error'" :title="found.length === objects.length ? 'Все предметы найдены! Молодец! ⭐' : `Найдено ${found.length} из ${objects.length}.`"><p v-if="found.length !== objects.length">Найди ещё: {{ objects.filter(item => !found.includes(item.id)).map(item => item.word).join(', ') }}.</p></FeedbackMessage>
            <p class="toy-hint">Скажи вслух: «Я нашёл мяч». «Я нашла куклу».</p>
          </template>
          <template v-else-if="tab === 'count' || tab === 'where'">
            <template v-if="indices[tab] < questions.length">
              <p>Задание {{ indices[tab] + 1 }} из {{ questions.length }}</p>
              <h3>{{ question.q }}</h3>
              <div class="toy-options"><button v-for="option in question.options" :key="option" type="button" :aria-pressed="answers[tab] === option" :disabled="checked[tab]" @click="answers[tab] = option">{{ option }}</button></div>
              <div class="action-row"><TouchButton v-if="!checked[tab]" :disabled="answers[tab] === null" @click="checkChoice">Проверить</TouchButton><TouchButton v-else @click="nextChoice">{{ indices[tab] === questions.length - 1 ? 'Показать результат' : 'Дальше' }}</TouchButton></div>
              <FeedbackMessage v-if="checked[tab]" :kind="answers[tab] === question.ans ? 'success' : 'error'" :title="answers[tab] === question.ans ? 'Верно!' : 'Запомним правильный ответ.'"><p>Правильный ответ: {{ question.ans }}.</p></FeedbackMessage>
            </template>
            <template v-else><h3>Блок завершён</h3><p>Верных ответов: {{ scores[tab] }} из {{ questions.length }}.</p><TouchButton @click="resetChoice(tab)">Начать заново</TouchButton></template>
            <p v-if="tab === 'where'" class="toy-hint">Подсказка RU / KZ: на — үстінде; под — астында; в — ішінде; около — жанында.</p>
          </template>
          <template v-else>
            <template v-if="indices.sentence < sentences.length">
              <p>Предложение {{ indices.sentence + 1 }} из {{ sentences.length }}</p>
              <div class="toy-options"><button v-for="item in bank" :key="item.i" type="button" :disabled="checked.sentence || sequence.includes(item.i)" @click="sequence.push(item.i)">{{ item.word }}</button></div>
              <div class="toy-assembled" aria-label="Собранное предложение"><button v-for="(item, position) in sequence" :key="item" type="button" :disabled="checked.sentence" :aria-label="`Убрать слово ${sentence[item]}`" @click="sequence.splice(position, 1)">{{ sentence[item] }}</button></div>
              <div class="action-row"><TouchButton v-if="!checked.sentence" :disabled="!sequence.length" @click="checkSentence">Проверить</TouchButton><TouchButton v-else @click="nextSentence">{{ indices.sentence === sentences.length - 1 ? 'Показать результат' : 'Дальше' }}</TouchButton><TouchButton v-if="!checked.sentence" @click="sequence = []">Сбросить</TouchButton></div>
              <FeedbackMessage v-if="checked.sentence" :kind="sentenceCorrect ? 'success' : 'error'" :title="sentenceCorrect ? 'Правильно! Прочитай предложение вслух. ⭐' : 'Запомним порядок слов.'"><p>Правильное предложение: {{ sentence.join(' ') }}</p></FeedbackMessage>
            </template>
            <template v-else><h3>Блок завершён</h3><p>Верных предложений: {{ scores.sentence }} из {{ sentences.length }}.</p><TouchButton @click="resetSentences">Начать заново</TouchButton></template>
            <p class="toy-hint">Кто или что? + Что делает? + Где? Мяч лежит под столом.</p>
          </template>
        </div>
      </div>
    </SurfacePanel>
    <p>Все четыре блока можно выбирать самостоятельно. Следующее задание не зависит от правильного ответа.</p>
  </div>
</template>

<style scoped>
.toy-tabs,.toy-options,.action-row{display:flex;gap:12px;flex-wrap:wrap;margin:16px 0}.toy-tabs button,.toy-options button,.toy-list button,.toy-assembled button{min-height:56px;padding:10px 16px;border:2px solid var(--color-border,#b8cde1);border-radius:14px;background:var(--color-surface,#fff);font:inherit;cursor:pointer}.toy-tabs .current,.toy-options [aria-pressed="true"],.toy-list [aria-pressed="true"]{border-color:#287ccc;background:#d9ecff}.toy-layout{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(290px,1fr);gap:18px;align-items:start}.toy-scene{position:relative;align-self:start;border:3px solid #d6eaff;border-radius:18px;overflow:hidden}.toy-scene img{display:block;width:100%}.toy-hotspot{position:absolute;transform:translate(-50%,-50%);border:2px solid transparent;background:transparent;border-radius:12px;min-width:48px;min-height:48px;cursor:pointer}.toy-hotspot:focus-visible{outline:3px solid #205ca2}.toy-hotspot.found{border-color:#168150;background:#50d6a155}.toy-hotspot span{font-size:26px;font-weight:bold;color:#075c3d}.toy-task{padding:16px;border-radius:18px;background:#f6faff}.toy-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.toy-list button{text-align:left}.toy-assembled{min-height:72px;border:2px dashed #80b2df;border-radius:14px;padding:10px;display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}.toy-hint{padding:12px;background:#fff3d8;border-radius:14px}.toy-options button:disabled,.toy-list button:disabled{cursor:default}@media(max-width:850px){.toy-layout{grid-template-columns:1fr}.toy-list{grid-template-columns:1fr 1fr}}
</style>
