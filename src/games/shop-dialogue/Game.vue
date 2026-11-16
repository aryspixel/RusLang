<script setup>
import { computed, ref } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import TouchButton from '../../components/TouchButton.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import SelectionBasket from '../../components/SelectionBasket.vue'
import { dialogue, phrasePool, products, needed } from './data.js'

const active = ref('dialogue')
const placements = ref(Array(dialogue.length).fill(null))
const selectedPhrase = ref(null)
const dialogueChecked = ref(false)
const dialogueFinished = ref(false)
const dialogueResult = ref(0)
const basket = ref([])
const basketChecked = ref(false)
const basketFinished = ref(false)
const basketCorrect = computed(() => basket.value.length === needed.length && needed.every(id => basket.value.includes(id)))
const missing = computed(() => needed.filter(id => !basket.value.includes(id)))
const extra = computed(() => basket.value.filter(id => !needed.includes(id)))
const dialogueComplete = computed(() => placements.value.every(Boolean))

function selectPhrase(line) {
  if (dialogueChecked.value) return
  selectedPhrase.value = selectedPhrase.value === line ? null : line
}
function place(index) {
  if (dialogueChecked.value) return
  if (placements.value[index]) { placements.value[index] = null; return }
  if (selectedPhrase.value) { placements.value[index] = selectedPhrase.value; selectedPhrase.value = null }
}
function checkDialogue() {
  if (!dialogueComplete.value || dialogueChecked.value) return
  dialogueResult.value = dialogue.filter((item, index) => placements.value[index] === item.line).length
  dialogueChecked.value = true
}
function resetDialogue() {
  placements.value = Array(dialogue.length).fill(null)
  selectedPhrase.value = null
  dialogueChecked.value = false
  dialogueFinished.value = false
  dialogueResult.value = 0
}
function addProduct(id) { if (!basketChecked.value && !basket.value.includes(id)) basket.value.push(id) }
function removeProduct(id) { if (!basketChecked.value) basket.value = basket.value.filter(item => item !== id) }
function resetBasket() { basket.value = []; basketChecked.value = false; basketFinished.value = false }
</script>

<template>
  <div class="game-layout shop-game">
    <header>
      <h1>Тренажёр «В магазине»</h1>
      <p>Блок 1 — поставь реплики по порядку. Блок 2 — собери нужные товары в корзину.</p>
    </header>
    <nav class="shop-tabs" aria-label="Блоки тренажёра">
      <TouchButton :variant="active === 'dialogue' ? 'primary' : 'secondary'" :aria-current="active === 'dialogue' ? 'page' : undefined" @click="active = 'dialogue'">1 блок: Реплики</TouchButton>
      <TouchButton :variant="active === 'basket' ? 'primary' : 'secondary'" :aria-current="active === 'basket' ? 'page' : undefined" @click="active = 'basket'">2 блок: Корзина</TouchButton>
    </nav>

    <SurfacePanel v-if="active === 'dialogue'" class="shop-section">
      <h2>1 блок. Кто что говорит?</h2>
      <p>Али и Сая — покупатели. Продавец помогает выбрать товары.</p>
      <p>Нажми на реплику, потом на строку диалога. Чтобы убрать реплику, нажми на заполненную строку. Когда всё готово, нажми «Проверить».</p>
      <template v-if="dialogueFinished">
        <h3>Диалог завершён</h3>
        <p>Правильно: {{ dialogueResult }} из {{ dialogue.length }}.</p>
        <TouchButton @click="resetDialogue">Пройти ещё раз</TouchButton>
      </template>
      <template v-else>
        <div class="dialogue-layout">
          <div>
            <h3>Диалог</h3>
            <button v-for="(item, index) in dialogue" :key="index" type="button" class="shop-slot" :disabled="dialogueChecked" :aria-label="`${index + 1}. ${item.speaker}: ${placements[index] || 'пустая строка'}`" @click="place(index)">
              <strong>{{ index + 1 }}. {{ item.speaker }}</strong>
              <span>{{ placements[index] || 'Нажми сюда и поставь реплику' }}</span>
            </button>
          </div>
          <div>
            <h3>Реплики</h3>
            <div class="shop-phrases">
              <TouchButton v-for="line in phrasePool" :key="line" variant="secondary" :disabled="dialogueChecked || placements.includes(line)" :aria-pressed="selectedPhrase === line" @click="selectPhrase(line)">{{ line }}</TouchButton>
            </div>
          </div>
        </div>
        <FeedbackMessage v-if="dialogueChecked" :kind="dialogueResult === dialogue.length ? 'success' : 'error'" :title="dialogueResult === dialogue.length ? 'Молодец! Все реплики стоят правильно.' : `Правильно: ${dialogueResult} из ${dialogue.length}.`">
          <p v-for="(item, index) in dialogue" :key="index">{{ index + 1 }}. {{ item.speaker }}: {{ item.line }}<span v-if="placements[index] !== item.line"> — здесь нужна эта реплика.</span></p>
        </FeedbackMessage>
        <div class="action-row">
          <TouchButton v-if="!dialogueChecked" :disabled="!dialogueComplete" @click="checkDialogue">Проверить</TouchButton>
          <TouchButton v-else @click="dialogueFinished = true">Показать результат</TouchButton>
          <TouchButton v-if="!dialogueChecked" variant="secondary" @click="resetDialogue">Сбросить</TouchButton>
        </div>
      </template>
    </SurfacePanel>

    <SurfacePanel v-else class="shop-section">
      <h2>2 блок. Собери товары в корзину</h2>
      <p>Мама дала список покупок. Нажимай на товары — они будут попадать в корзину. Если товар лишний, нажми на него в корзине, чтобы убрать. Потом нажми «Проверить».</p>
      <div class="shop-list"><h3>📝 Список от мамы</h3><p>{{ needed.map(id => `${products.find(p => p.id === id).emoji} ${id}`).join(' · ') }}</p><p>Нужно собрать только то, что есть в списке.</p></div>
      <template v-if="basketFinished">
        <h3>Покупки завершены</h3>
        <p>{{ basketCorrect ? 'Все нужные товары в корзине.' : `Не хватает: ${missing.join(', ') || 'ничего'}. Лишнее: ${extra.join(', ') || 'ничего'}.` }}</p>
        <TouchButton @click="resetBasket">Пройти ещё раз</TouchButton>
      </template>
      <template v-else>
        <SelectionBasket :products="products" :selected="basket" :disabled="basketChecked" group-label="Товары магазина" basket-title="🧺 Корзина" @add="addProduct" @remove="removeProduct" />
        <FeedbackMessage v-if="basketChecked" :kind="basketCorrect ? 'success' : 'error'" :title="basketCorrect ? 'Отлично! В корзине только нужные товары.' : 'Проверь список покупок.'">
          <p v-if="!basketCorrect">Не хватает: {{ missing.join(', ') || 'ничего' }}. Лишнее: {{ extra.join(', ') || 'ничего' }}.</p>
          <p>Правильный ответ: {{ needed.join(', ') }}. В корзине должны быть только товары из списка мамы.</p>
        </FeedbackMessage>
        <div class="action-row">
          <TouchButton v-if="!basketChecked" @click="basketChecked = true">Проверить</TouchButton>
          <TouchButton v-else @click="basketFinished = true">Показать результат</TouchButton>
          <TouchButton v-if="!basketChecked" variant="secondary" @click="resetBasket">Сбросить</TouchButton>
        </div>
      </template>
    </SurfacePanel>
    <p>Можно открывать блоки в любом порядке.</p>
  </div>
</template>

<style scoped>
.shop-tabs,.action-row,.shop-phrases { display:flex; flex-wrap:wrap; gap:var(--space-2); margin-block:var(--space-3); }
.shop-section { margin-top:var(--space-3); }
.dialogue-layout { display:grid; grid-template-columns:minmax(0,1.2fr) minmax(0,1fr); gap:var(--space-3); }
.shop-slot { display:flex; align-items:center; gap:var(--space-2); width:100%; min-height:72px; margin-bottom:10px; padding:12px; border:2px dashed var(--color-border); border-radius:var(--radius-control); background:var(--color-surface); color:var(--color-text); font:inherit; text-align:left; cursor:pointer; }
.shop-slot strong { min-width:130px; } .shop-slot span { overflow-wrap:anywhere; }
.shop-slot:focus-visible { outline:3px solid var(--color-focus); outline-offset:2px; }
.shop-phrases .touch-button[aria-pressed="true"] { outline:3px solid var(--color-focus); }
.shop-list { padding:var(--space-2); border:2px solid var(--color-border); border-radius:var(--radius-control); }
@media(max-width:800px) { .dialogue-layout { grid-template-columns:1fr; } .shop-slot { flex-direction:column; align-items:flex-start; } }
</style>
