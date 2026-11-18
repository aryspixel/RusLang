<script setup>
import { computed, ref } from 'vue'
import { groups, examples, valid, questions, story, dictionary } from './data.js'

const tab = ref('one')
const selected = ref([...examples[0]])
const sentenceChecked = ref(false)
const sentenceFinished = ref(false)
const sentenceCorrect = computed(() => valid.has(selected.value.join('|')))
const answers = ref(Array(questions.length).fill(null))
const cardsChecked = ref(false)
const cardsFinished = ref(false)
const cardScore = computed(() => questions.filter((q, i) => answers.value[i] === q.answer).length)
const order = ref([2, 0, 3, 1])
const storyChecked = ref(false)
const storyFinished = ref(false)
const storyCorrect = computed(() => order.value.every((item, i) => item === i))

function nextSentence() {
  selected.value = [...examples[Math.floor(Math.random() * examples.length)]]
  sentenceChecked.value = false
  sentenceFinished.value = false
}
function resetCards() {
  answers.value = Array(questions.length).fill(null)
  cardsChecked.value = false
  cardsFinished.value = false
}
function move(index, step) {
  if (storyChecked.value || index + step < 0 || index + step >= order.value.length) return
  const copy = [...order.value]
  ;[copy[index], copy[index + step]] = [copy[index + step], copy[index]]
  order.value = copy
}
function resetStory() {
  const mixes = [[2, 0, 3, 1], [3, 1, 0, 2], [1, 3, 2, 0], [3, 0, 2, 1]]
  order.value = [...mixes[Math.floor(Math.random() * mixes.length)]]
  storyChecked.value = false
  storyFinished.value = false
}
</script>

<template>
  <div class="park-game game-layout">
    <header class="park-panel"><h1>🎡 Али и Сая в парке аттракционов</h1><p>Игра: простые предложения и слова-помощники с переводом на казахский язык.</p></header>
    <nav class="park-tabs" aria-label="Блоки игры">
      <button v-for="item in [['one','1. Собери предложение'],['two','2. Кто что делает?'],['three','3. Пересказ'],['four','4. Словарик RU/KZ']]" :key="item[0]" type="button" :class="{ active: tab === item[0] }" :aria-current="tab === item[0] ? 'page' : undefined" @click="tab = item[0]">{{ item[1] }}</button>
    </nav>
    <section v-show="tab === 'one'" class="park-panel">
      <h2>🧩 Собери предложение</h2><p>Выбери по одному слову: <b>Кто? Что делает? Где? / Кім? Не істейді? Қайда?</b></p>
      <template v-if="sentenceFinished"><p class="park-result">Пример завершён. Составь ещё одно предложение.</p><button class="park-action primary" @click="nextSentence">Другой пример ↻</button></template>
      <template v-else>
        <div class="park-three"><div v-for="(group, i) in groups" :key="group.title" class="park-group"><h3>{{ group.title }}</h3><button v-for="word in group.words" :key="word" class="park-word" :class="{ sel: selected[i] === word }" :aria-pressed="selected[i] === word" :disabled="sentenceChecked" @click="selected[i] = word">{{ word }}</button></div></div>
        <p class="park-sentence">{{ selected.join(' ') }}.</p>
        <div v-if="sentenceChecked" class="park-feedback" :class="sentenceCorrect ? 'ok' : 'bad'" role="status"><strong>{{ sentenceCorrect ? 'Верно! Прочитай предложение вслух. 🌟' : 'Попробуй другие слова. Кто катается? Кто покупает билеты?' }}</strong><p v-if="!sentenceCorrect">Например: Сая катается на карусели.</p></div>
        <div class="park-actions"><button v-if="!sentenceChecked" class="park-action primary" @click="sentenceChecked = true">Проверить ✓</button><button v-else class="park-action primary" @click="sentenceFinished = true">Дальше</button></div>
      </template>
    </section>
    <section v-show="tab === 'two'" class="park-panel">
      <h2>🎠 Кто что делает?</h2><p>Выбери подходящее слово, затем прочитай всё предложение.</p>
      <template v-if="cardsFinished"><p class="park-result">Правильно: {{ cardScore }} из {{ questions.length }}.</p><button class="park-action primary" @click="resetCards">Заново ↻</button></template>
      <template v-else><div class="park-cards"><div v-for="(q, i) in questions" :key="i" class="park-card"><div class="park-picture" aria-hidden="true">{{ q.emoji }}</div><h3>{{ q.text }}</h3><button v-for="choice in q.choices" :key="choice" class="park-choice" :class="{ sel: answers[i] === choice, correct: cardsChecked && choice === q.answer, wrong: cardsChecked && answers[i] === choice && choice !== q.answer }" :aria-pressed="answers[i] === choice" :disabled="cardsChecked" @click="answers[i] = choice">{{ choice }}<span v-if="cardsChecked && choice === q.answer"> ✓</span><span v-else-if="cardsChecked && answers[i] === choice"> ✗</span></button><p v-if="cardsChecked" class="park-correction">Верно: {{ q.text.replace('...', q.answer) }}</p></div></div>
        <div v-if="cardsChecked" class="park-feedback" :class="cardScore === questions.length ? 'ok' : 'bad'" role="status">{{ cardScore === questions.length ? 'Молодец! Всё правильно! ⭐' : `Правильно: ${cardScore} из ${questions.length}. Прочитай верные предложения.` }}</div>
        <div class="park-actions"><button v-if="!cardsChecked" class="park-action primary" :disabled="answers.some(answer => !answer)" @click="cardsChecked = true">Проверить ✓</button><button v-else class="park-action primary" @click="cardsFinished = true">Дальше</button></div>
      </template>
    </section>
    <section v-show="tab === 'three'" class="park-panel"><h2>📖 История по порядку</h2><p>Поставь события по порядку стрелками ↑ ↓. Прочитай рассказ.</p>
      <template v-if="storyFinished"><p class="park-result">История завершена. Расскажи её вслух.</p><button class="park-action primary" @click="resetStory">Перемешать ↻</button></template>
      <div v-else class="park-layout"><div><div v-for="(id, i) in order" :key="id" class="park-event"><b aria-hidden="true">{{ story[id].emoji }}</b><span>{{ story[id].text }}</span><button :disabled="storyChecked || i === 0" :aria-label="`Поднять: ${story[id].text}`" @click="move(i, -1)">↑</button><button :disabled="storyChecked || i === order.length - 1" :aria-label="`Опустить: ${story[id].text}`" @click="move(i, 1)">↓</button></div>
        <div v-if="storyChecked" class="park-feedback" :class="storyCorrect ? 'ok' : 'bad'" role="status"><strong>{{ storyCorrect ? 'Правильно! Теперь расскажи историю. 🎉' : 'Подумай: сначала семья идёт в парк, а в конце ест мороженое.' }}</strong><p>Правильный порядок: {{ story.map(event => event.text).join(' ') }}</p></div>
        <div class="park-actions"><button v-if="!storyChecked" class="park-action primary" @click="storyChecked = true">Проверить ✓</button><button v-else class="park-action primary" @click="storyFinished = true">Дальше</button></div></div>
        <aside class="park-hint"><b>Слова-помощники</b><br>Сначала — Алдымен<br>Потом — Содан кейін<br>После этого — Осыдан кейін<br>Наконец — Соңында<br>🎟️ 🎠 🚗 🍦</aside></div>
    </section>
    <section v-show="tab === 'four'" class="park-panel"><h2>📚 Словарик</h2><p>Русский — Қазақша</p><dl class="park-dict"><div v-for="pair in dictionary" :key="pair[0]"><dt>{{ pair[0] }}</dt><dd>{{ pair[1] }}</dd></div></dl><div class="park-hint"><b>Как строить предложение?</b><br>Кто? — Кім? → Али, Сая, мама, папа.<br>Что делает? — Не істейді? → идёт, ждёт, покупает, катается, ест.<br>Где? — Қайда? → в парке, на карусели, на машинке.</div></section>
    <footer>Выбирай любой блок. Проверка только по кнопке, переход свободный.</footer>
  </div>
</template>

<style scoped>
.park-game{max-width:1040px;margin:auto;padding:18px;color:#244469;background:linear-gradient(140deg,#e6f3ff,#fff8ed,#fcecf8);border-radius:24px;font-family:Arial,sans-serif}.park-panel{background:white;border-radius:24px;padding:22px;margin:14px 0;box-shadow:0 8px 25px #5277a422}.park-game h1{color:#1763ac;font-size:clamp(28px,4vw,42px)}.park-game p{font-size:18px;line-height:1.5}.park-tabs,.park-actions{display:flex;gap:10px;flex-wrap:wrap}.park-tabs button,.park-action{min-height:56px;font-size:18px;border-radius:14px;padding:12px 16px;background:white;border:2px solid #b5d5f3;color:#225b95;font-weight:bold}.park-tabs button.active,.park-action.primary{background:#247ad4;color:white;border-color:#247ad4}.park-three,.park-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px}.park-group{border:2px solid #d3e6fa;border-radius:18px;padding:13px;background:#f5faff}.park-group:nth-child(2){background:#f3fff7}.park-group:nth-child(3){background:#fff9ed}.park-group h3{font-size:20px}.park-word{min-height:56px;border:2px solid #cad9e8;background:white;border-radius:12px;padding:10px;margin:4px;font-weight:bold;font-size:18px}.park-word.sel{background:#ffedaf;border-color:#d9a42c}.park-sentence{margin-top:16px!important;padding:20px;border:2px dashed #77b5ed;border-radius:16px;background:#eaf6ff;font-size:27px!important;font-weight:bold}.park-actions{margin:16px 0}.park-feedback{padding:14px;border-radius:14px;font-size:20px;font-weight:bold}.park-feedback.ok{color:#116844;background:#dbfae9}.park-feedback.bad{color:#9c3429;background:#ffe5e5}.park-feedback p{margin:6px 0 0}.park-result{font-size:24px!important;font-weight:bold}.park-card{padding:14px;border:2px solid #d9e6f2;border-radius:18px;text-align:center;background:#fafdff}.park-picture{font-size:65px}.park-card h3{font-size:18px}.park-choice{display:block;width:100%;min-height:54px;padding:10px;border:2px solid #d8e4ef;border-radius:10px;background:white;margin:8px 0;font-size:17px}.park-choice.sel{background:#dfefff;border-color:#278be5}.park-choice.correct{background:#dbfae9;border-color:#168456}.park-choice.wrong{background:#ffe5e5;border-color:#c05748}.park-correction{font-size:16px!important;font-weight:bold}.park-layout{display:grid;grid-template-columns:1.4fr 1fr;gap:18px}.park-event{display:flex;align-items:center;gap:10px;border:2px solid #d8e5f4;background:#f7fbff;border-radius:16px;padding:12px;margin-bottom:9px}.park-event b{font-size:30px}.park-event span{flex:1;font-size:19px;font-weight:bold}.park-event button{min-width:48px;min-height:48px;border:1px solid #b7d1eb;border-radius:9px;background:white;font-size:24px}.park-hint{background:#fff4da;border-radius:18px;padding:17px;line-height:2;font-size:18px}.park-dict{display:grid;grid-template-columns:1fr 1fr;margin:0 0 18px}.park-dict div{display:contents}.park-dict dt,.park-dict dd{padding:9px;border-bottom:1px dashed #bed3e8;font-size:19px;margin:0}.park-game footer{text-align:center;color:#637a95;margin:20px}@media(max-width:760px){.park-three,.park-cards,.park-layout{grid-template-columns:1fr}.park-game{padding:8px}.park-panel{padding:14px}.park-event{flex-wrap:wrap}.park-event span{min-width:50%}}.park-game button:disabled{opacity:.65}.park-game button:focus-visible{outline:4px solid #d9a42c;outline-offset:3px}
</style>
