<script setup>
import { computed, ref } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import TouchButton from '../../components/TouchButton.vue'
import ChoiceGroup from '../../components/ChoiceGroup.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import { products, amounts, recipe, verbs, sentences, prepositions, storySentences } from './data.js'

const levels = [{label:'🛒 1. Магазин'},{label:'🥣 2. Готовим'},{label:'🔎 3. Грамматика'},{label:'🏆 4. Рассказ'}]
const level = ref(0)
const shuffled = list => [...list].sort(() => Math.random() - .5)
const wordBanks = storySentences.map(line => shuffled(line))
const basket = ref([]), basketChecked = ref(false), amountChoices = ref({}), amountChecks = ref({})
const recipeOrder = ref(shuffled(recipe)), recipeChecked = ref(false), verbChoices = ref({}), verbChecks = ref({})
const sentenceIndex = ref(0), role = ref(null), roleAnswers = ref({}), prepChoices = ref({}), prepChecks = ref({})
const built = ref(storySentences.map(() => [])), storyChecks = ref({}), narration = ref(''), finished = ref(false)
const rightProducts = computed(() => products.filter(item => item.correct))
const basketCorrect = computed(() => basket.value.length === rightProducts.value.length && rightProducts.value.every(item => basket.value.includes(item.id)))
const amountsDone = computed(() => amounts.every((_, i) => amountChecks.value[i] && amountChoices.value[i] === amounts[i].correct))
const recipeCorrect = computed(() => recipeOrder.value.every((step, i) => step === recipe[i]))
const verbsDone = computed(() => verbs.every((q, i) => verbChecks.value[i] && verbChoices.value[i] === q.correct))
const currentSentence = computed(() => sentences[sentenceIndex.value])
const rolesDone = computed(() => ['who','action','where'].every(key => roleAnswers.value[sentenceIndex.value]?.[key] === currentSentence.value.roles[key]))
const roleError = computed(() => {
  const answer = roleAnswers.value[sentenceIndex.value] || {}
  return Object.entries(answer).some(([key, value]) => value !== currentSentence.value.roles[key])
})
const prepsDone = computed(() => prepositions.every((q, i) => prepChecks.value[i] && prepChoices.value[i] === q.correct))
const storyDone = computed(() => storySentences.every((line, i) => storyChecks.value[i] && built.value[i].join(' ') === line.join(' ')))

function toggleProduct(id) {
  if (basketChecked.value) basketChecked.value = false
  basket.value = basket.value.includes(id) ? basket.value.filter(value => value !== id) : [...basket.value, id]
}
function checkBasket() { basketChecked.value = true }
function checkAmounts() { amountChecks.value = Object.fromEntries(amounts.map((_, i) => [i, true])) }
function unlockAmounts() { amountChecks.value = {}; }
function moveStep(index, delta) {
  const to = index + delta
  if (to < 0 || to >= recipeOrder.value.length || recipeChecked.value) return
  const next = [...recipeOrder.value]; [next[index], next[to]] = [next[to], next[index]]; recipeOrder.value = next
}
function checkRecipe() { recipeChecked.value = true }
function unlockRecipe() { recipeChecked.value = false }
function checkVerbs() { verbChecks.value = Object.fromEntries(verbs.map((_, i) => [i, true])) }
function unlockVerbs() { verbChecks.value = {} }
function chooseRole(key) { role.value = key }
function markWord(word) {
  if (!role.value) return
  const current = { ...(roleAnswers.value[sentenceIndex.value] || {}) }
  if (current[role.value]) return
  current[role.value] = word
  roleAnswers.value = { ...roleAnswers.value, [sentenceIndex.value]: current }
  role.value = null
  if (['who','action','where'].every(key => current[key] === currentSentence.value.roles[key])) {
    if (sentenceIndex.value < sentences.length - 1) sentenceIndex.value++
  } else {
    // Retain the selection for correction; mismatched roles can be cleared with the reset action.
  }
}
function resetSentence() {
  roleAnswers.value = { ...roleAnswers.value, [sentenceIndex.value]: {} }
  role.value = null
}
function checkPrepositions() { prepChecks.value = Object.fromEntries(prepositions.map((_, i) => [i, true])) }
function unlockPrepositions() { prepChecks.value = {} }
function toggleToken(lineIndex, token) {
  if (storyChecks.value[lineIndex]) return
  const line = [...built.value[lineIndex]]
  const index = line.indexOf(token)
  if (index >= 0) line.splice(index, 1); else line.push(token)
  built.value = built.value.map((entry, i) => i === lineIndex ? line : entry)
}
function checkStory() { storyChecks.value = Object.fromEntries(storySentences.map((_, i) => [i, true])) }
function unlockStory() { storyChecks.value = {} }
function resetAll() {
  level.value = 0; basket.value = []; basketChecked.value = false; amountChoices.value = {}; amountChecks.value = {}
  recipeOrder.value = shuffled(recipe); recipeChecked.value = false; verbChoices.value = {}; verbChecks.value = {}
  sentenceIndex.value = 0; role.value = null; roleAnswers.value = {}; prepChoices.value = {}; prepChecks.value = {}
  built.value = storySentences.map(() => []); storyChecks.value = {}; narration.value = ''; finished.value = false
}
function speakPrompt() {
  if (!('speechSynthesis' in window)) return
  const utterance = new SpeechSynthesisUtterance('Сначала. Потом. После этого. Наконец.')
  utterance.lang = 'ru-RU'; utterance.rate = .9; window.speechSynthesis.cancel(); window.speechSynthesis.speak(utterance)
}
</script>

<template>
  <div class="game-layout">
    <h1>👵🍎 Испеки яблочный пирог! 🥧</h1>
    <p class="intro">Купи продукты → восстанови рецепт → разберись с грамматикой → расскажи историю.</p>
    <p>Выбирай задания сверху в любом порядке. Можно возвращаться к уровням: ответы сохраняются.</p>
    <nav class="action-row level-tabs" aria-label="Выбери задание">
      <TouchButton v-for="(item, i) in levels" :key="item.label" :variant="level === i ? 'primary' : 'secondary'" :aria-pressed="level === i" @click="level = i">{{ item.label }}</TouchButton>
    </nav>

    <SurfacePanel v-if="level === 0">
      <h2>Уровень 1. Собери корзину</h2><p>Выбери 7 продуктов для пирога. Лишние продукты не бери.</p>
      <div class="food-grid">
        <button v-for="item in products" :key="item.id" type="button" class="food-card" :class="{selected:basket.includes(item.id)}" :aria-pressed="basket.includes(item.id)" :disabled="basketChecked && basketCorrect" @click="toggleProduct(item.id)"><span class="emoji">{{ item.emoji }}</span>{{ item.label }}</button>
      </div>
      <FeedbackMessage v-if="basketChecked" :kind="basketCorrect ? 'success' : 'error'" :title="basketCorrect ? 'Отлично! Все нужные продукты в корзине.' : 'Проверь корзину: выбраны не все нужные продукты или есть лишние.'">
        <p>Нужные продукты: {{ rightProducts.map(item => item.label).join(', ') }}.</p>
      </FeedbackMessage>
      <div class="action-row"><TouchButton v-if="!basketChecked" @click="checkBasket">✓ Проверить корзину</TouchButton><TouchButton v-else-if="basketCorrect" @click="level = 1">А сколько нужно? →</TouchButton><TouchButton v-else @click="basketChecked = false">Исправить выбор</TouchButton></div>
      <div v-if="basketCorrect" class="subtask"><h3>А сколько нужно?</h3><p>Выбери количество для каждого продукта, затем проверь ответы.</p>
        <div v-for="(item, i) in amounts" :key="item.product" class="question-row"><strong>{{ item.product }}:</strong><ChoiceGroup :options="item.options.map(label => ({value:label,label}))" :selected="amountChoices[i] ?? null" :disabled="!!amountChecks[i]" :label="`Количество: ${item.product}`" @select="amountChoices[i] = $event"/><span v-if="amountChecks[i]" class="answer-note">{{ amountChoices[i] === item.correct ? 'Верно' : `Правильный ответ: ${item.correct}` }}</span></div>
        <FeedbackMessage v-if="Object.keys(amountChecks).length" :kind="amountsDone ? 'success' : 'error'" :title="amountsDone ? 'Количество продуктов выбрано верно.' : 'Проверь количества и попробуй ещё раз.'"/>
        <div class="action-row"><TouchButton v-if="!Object.keys(amountChecks).length" @click="checkAmounts">✓ Проверить количества</TouchButton><TouchButton v-else-if="amountsDone" @click="level = 1">Перейти к рецепту →</TouchButton><TouchButton v-else @click="unlockAmounts">Исправить ответы</TouchButton></div>
      </div>
    </SurfacePanel>

    <SurfacePanel v-else-if="level === 1">
      <h2>Уровень 2. Перепутанный рецепт</h2><p>Поставь шаги в правильном порядке кнопками ↑ ↓, затем проверь.</p>
      <ol class="recipe-list"><li v-for="(step, i) in recipeOrder" :key="step"><span>{{ step }}</span><span class="move-buttons"><button type="button" :disabled="recipeChecked || i===0" aria-label="Переместить выше" @click="moveStep(i,-1)">↑</button><button type="button" :disabled="recipeChecked || i===recipeOrder.length-1" aria-label="Переместить ниже" @click="moveStep(i,1)">↓</button></span></li></ol>
      <FeedbackMessage v-if="recipeChecked" :kind="recipeCorrect ? 'success' : 'error'" :title="recipeCorrect ? 'Верно! Рецепт восстановлен.' : 'Порядок пока неверный. Попробуй ещё.'"><ol v-if="!recipeCorrect"><li v-for="step in recipe" :key="step">{{ step }}</li></ol></FeedbackMessage>
      <div class="action-row"><TouchButton v-if="!recipeChecked" @click="checkRecipe">✓ Проверить порядок</TouchButton><TouchButton v-else-if="recipeCorrect" @click="level = 2">Выбрать глаголы →</TouchButton><TouchButton v-else @click="unlockRecipe">Исправить порядок</TouchButton></div>
      <div v-if="recipeCorrect" class="subtask"><h3>Выбери правильный глагол</h3><div v-for="(q,i) in verbs" :key="q.prompt" class="question-row"><strong>{{ q.prompt }}</strong><ChoiceGroup :options="q.options.map(label=>({value:label,label}))" :selected="verbChoices[i] ?? null" :disabled="!!verbChecks[i]" :label="q.prompt" @select="verbChoices[i]=$event"/><span v-if="verbChecks[i]" class="answer-note">{{ verbChoices[i] === q.correct ? 'Верно' : `Правильный ответ: ${q.correct}` }}</span></div>
        <FeedbackMessage v-if="Object.keys(verbChecks).length" :kind="verbsDone ? 'success' : 'error'" :title="verbsDone ? 'Все глаголы выбраны верно.' : 'Есть ошибки. Проверь ответы и попробуй ещё.'"/>
        <div class="action-row"><TouchButton v-if="!Object.keys(verbChecks).length" @click="checkVerbs">✓ Проверить глаголы</TouchButton><TouchButton v-else-if="verbsDone" @click="level=2">Перейти к грамматике →</TouchButton><TouchButton v-else @click="unlockVerbs">Исправить ответы</TouchButton></div>
      </div>
    </SurfacePanel>

    <SurfacePanel v-else-if="level === 2">
      <h2>Уровень 3. Кто? Что делает? Где?</h2><p><b>Подлежащее</b> — одна черта. <b>Сказуемое</b> — две. <b>Обстоятельство места</b> — пунктир с точкой.</p>
      <p>Выбери роль, затем нажми нужное слово в предложении.</p><div class="sentence-words"><button v-for="word in currentSentence.parts" :key="word" type="button" class="word-button" :class="{marked:Object.values(roleAnswers[sentenceIndex]||{}).includes(word),subject:Object.entries(roleAnswers[sentenceIndex]||{}).some(([k,v])=>v===word&&k==='who'),predicate:Object.entries(roleAnswers[sentenceIndex]||{}).some(([k,v])=>v===word&&k==='action'),circumstance:Object.entries(roleAnswers[sentenceIndex]||{}).some(([k,v])=>v===word&&k==='where')}" :disabled="Object.values(roleAnswers[sentenceIndex]||{}).includes(word)" @click="markWord(word)">{{ word }}</button></div>
      <div class="action-row"><TouchButton v-for="item in [{key:'who',label:'Кто?'},{key:'action',label:'Что делает?'},{key:'where',label:'Где?'}]" :key="item.key" :variant="role === item.key ? 'primary' : 'secondary'" :aria-pressed="role === item.key" @click="chooseRole(item.key)">{{ item.label }}</TouchButton></div>
      <div class="role-results"><p>Кто? <b>{{ roleAnswers[sentenceIndex]?.who || '—' }}</b></p><p>Что делает? <b>{{ roleAnswers[sentenceIndex]?.action || '—' }}</b></p><p>Где? <b>{{ roleAnswers[sentenceIndex]?.where || '—' }}</b></p></div>
      <FeedbackMessage v-if="roleError" kind="error" title="Проверь, какую роль выполняет каждое слово. Сбрось предложение и попробуй ещё раз."/>
      <FeedbackMessage v-if="rolesDone" kind="success" title="Верно! Предложение разобрано."/>
      <div class="action-row"><TouchButton v-if="!rolesDone" variant="secondary" @click="resetSentence">↻ Сбросить предложение</TouchButton><TouchButton v-else-if="sentenceIndex < sentences.length-1" @click="sentenceIndex++">Следующее предложение →</TouchButton></div>
      <div v-if="sentenceIndex===sentences.length-1 && rolesDone" class="subtask"><h3>Предлоги</h3><div v-for="(q,i) in prepositions" :key="q.prompt" class="question-row"><strong>{{ q.prompt }}</strong><ChoiceGroup :options="['в','на','под','около'].map(label=>({value:label,label}))" :selected="prepChoices[i] ?? null" :disabled="!!prepChecks[i]" :label="q.prompt" @select="prepChoices[i]=$event"/><span v-if="prepChecks[i]" class="answer-note">{{ prepChoices[i]===q.correct ? 'Верно' : `Правильный ответ: ${q.correct}` }}</span></div>
        <FeedbackMessage v-if="Object.keys(prepChecks).length" :kind="prepsDone ? 'success' : 'error'" :title="prepsDone ? 'Отлично!' : 'Проверь предлоги и попробуй ещё.'"/><div class="action-row"><TouchButton v-if="!Object.keys(prepChecks).length" @click="checkPrepositions">✓ Проверить предлоги</TouchButton><TouchButton v-else-if="prepsDone" @click="level=3">Перейти к рассказу →</TouchButton><TouchButton v-else @click="unlockPrepositions">Исправить ответы</TouchButton></div>
      </div>
    </SurfacePanel>

    <SurfacePanel v-else>
      <h2>Уровень 4. Стань поваром-рассказчиком</h2><p>Собери предложения. Потом расскажи историю сам.</p>
      <div v-for="(line,i) in storySentences" :key="i" class="story-card"><strong>Собери предложение:</strong><div class="token-bank"><button v-for="(token,n) in wordBanks[i]" :key="`${i}-${n}-${token}`" type="button" class="token" :disabled="storyChecks[i]" :aria-pressed="built[i].includes(token)" @click="toggleToken(i,token)">{{ token }}</button></div><div class="built-line" aria-live="polite">{{ built[i].join(' ') || 'Слова появятся здесь' }}</div><FeedbackMessage v-if="storyChecks[i]" :kind="built[i].join(' ')===line.join(' ') ? 'success':'error'" :title="built[i].join(' ')===line.join(' ') ? 'Верно!' : `Правильный порядок: ${line.join(' ')}`"/><div class="action-row"><TouchButton variant="secondary" :disabled="!!storyChecks[i]" @click="built[i]=[]">Сбросить</TouchButton></div></div>
      <div class="action-row"><TouchButton v-if="!Object.keys(storyChecks).length" @click="checkStory">✓ Проверить предложения</TouchButton><TouchButton v-else-if="storyDone" variant="secondary" @click="unlockStory">Изменить предложения</TouchButton><TouchButton v-else @click="unlockStory">Исправить предложения</TouchButton></div>
      <section v-if="storyDone" class="subtask"><h3>Расскажи сам</h3><p><b>Сначала… → Потом… → После этого… → Наконец…</b></p><p>Расскажи историю вслух или напиши её здесь.</p><label for="narration">Текст рассказа (по желанию)</label><textarea id="narration" v-model="narration" placeholder="Сначала мы…"></textarea><div class="action-row"><TouchButton variant="secondary" @click="speakPrompt">🔊 Послушать подсказку</TouchButton><TouchButton @click="finished=true">🥧 Пирог готов!</TouchButton></div></section>
      <div v-if="finished" class="final-result"><h2>🎉 Пирог готов!</h2><p>Ты прошёл все 4 уровня! ⭐⭐⭐</p><TouchButton @click="resetAll">↻ Начать заново</TouchButton></div>
    </SurfacePanel>
  </div>
</template>

<style scoped>
.intro { font-size: 1.2rem; }
.level-tabs { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); }
.food-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:12px; }
.food-card { min-height:100px; border:2px solid var(--color-border); border-radius:var(--radius-control); background:var(--color-surface); color:var(--color-text); font:inherit; font-weight:700; cursor:pointer; padding:12px; }
.food-card.selected,.word-button.marked { background:var(--color-selected); border-color:var(--color-primary); }
.food-card:disabled { opacity:.8; }
.emoji { display:block; font-size:2.4rem; margin-bottom:4px; }
.subtask,.story-card { margin-top:24px; padding:20px; border:1px solid var(--color-border); border-radius:var(--radius-card); }
.question-row { display:grid; grid-template-columns:minmax(160px,1fr) 2fr; align-items:center; gap:12px; margin:16px 0; }
.answer-note { grid-column:2; font-weight:700; }
.recipe-list { padding-left:36px; }
.recipe-list li { display:flex; justify-content:space-between; align-items:center; gap:16px; padding:12px; margin:8px 0; background:var(--color-selected); border-radius:var(--radius-control); font-size:1.05rem; }
.move-buttons { display:flex; gap:8px; }
.move-buttons button { min-width:52px; min-height:52px; border:1px solid var(--color-border); border-radius:12px; background:white; font-size:1.3rem; }
.sentence-words,.token-bank { display:flex; flex-wrap:wrap; gap:10px; margin:18px 0; }
.word-button,.token { min-height:56px; padding:10px 16px; border:2px solid var(--color-border); border-radius:14px; background:white; color:var(--color-text); font:inherit; font-weight:700; cursor:pointer; }
.word-button.subject { text-decoration:underline; text-underline-offset:5px; }
.word-button.predicate { text-decoration:underline double; text-underline-offset:5px; }
.word-button.circumstance { text-decoration:underline dashed; text-underline-offset:6px; }
.role-results { display:flex; gap:24px; flex-wrap:wrap; }
.built-line { min-height:56px; padding:12px; border:2px dashed var(--color-border); border-radius:12px; font-size:1.2rem; }
textarea { display:block; box-sizing:border-box; width:100%; min-height:110px; margin:12px 0; padding:12px; border:2px solid var(--color-border); border-radius:12px; font:inherit; }
.final-result { text-align:center; margin-top:24px; padding:24px; background:var(--color-selected); border-radius:var(--radius-card); }
@media(max-width:700px) { .level-tabs { grid-template-columns:repeat(2,minmax(0,1fr)); } .question-row { grid-template-columns:1fr; } .answer-note { grid-column:1; } .role-results { display:block; } }
</style>
