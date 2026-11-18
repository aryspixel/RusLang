<script setup>
import { computed, ref } from 'vue'
import { makeBank, shuffle, topics } from './data.js'

const selectedTopics = ref(Object.keys(topics))
const raceTopics = ref(Object.keys(topics))
const chosenMode = ref('turn')
const chosenGoal = ref(8)
const mode = ref('turn')
const goal = ref(8)
const started = ref(false)
const finished = ref(false)
const winner = ref(null)
const active = ref(0)
const players = ref([])
const error = ref('')
const names = ['Али', 'Сая']
const bank = makeBank()
const turnLabel = computed(() => !started.value ? 'Выбери режим и нажми «Начать гонку».' : finished.value ? '🏁 Гонка завершена!' : mode.value === 'turn' ? `Сейчас ход ${names[active.value]}. ${names[1 - active.value]} ждёт.` : 'Али и Сая отвечают каждый на своей стороне.')

function draw(index) {
  const player = players.value[index]
  if (!player.queue.length) player.queue = shuffle(bank.filter(q => raceTopics.value.includes(q.cat)))
  player.question = player.queue.pop()
  player.choice = null
  player.checked = false
}
function start() {
  if (!selectedTopics.value.length) { error.value = 'Выбери хотя бы одну тему.'; return }
  error.value = ''
  raceTopics.value = [...selectedTopics.value]
  mode.value = chosenMode.value
  goal.value = Number(chosenGoal.value)
  players.value = [{score:0,queue:[],question:null,choice:null,checked:false},{score:0,queue:[],question:null,choice:null,checked:false}]
  active.value = 0
  winner.value = null
  finished.value = false
  started.value = true
  draw(0)
  draw(1)
}
function answer(index, choice) {
  const player = players.value[index]
  if (!started.value || finished.value || player.checked || mode.value === 'turn' && active.value !== index) return
  player.choice = choice
  player.checked = true
  if (choice === player.question.answer) {
    player.score++
    if (player.score >= goal.value) { winner.value = index; finished.value = true }
  }
}
function next(index) {
  if (!players.value[index].checked || finished.value) return
  draw(index)
  if (mode.value === 'turn') active.value = 1 - index
}
</script>

<template>
  <div class="race-game game-layout">
    <header class="race-hero"><h1>🏁 Кто быстрее?</h1><p>🚙 Два игрока · простые вопросы · четыре темы · гонка до финиша!</p></header>
    <section class="race-panel settings" aria-label="Настройки гонки">
      <div><strong>Выбери темы для гонки:</strong><div class="topics"><label v-for="(label, key) in topics" :key="key"><input v-model="selectedTopics" type="checkbox" :value="key"> {{ label }}</label></div><p>Можно включить одну тему или несколько. Ошибка не двигает машинку.</p></div>
      <div class="controls"><fieldset><legend>Режим игры:</legend><label><input v-model="chosenMode" type="radio" value="turn"> 🔁 По очереди</label><label><input v-model="chosenMode" type="radio" value="both"> ⚡ Одновременно</label></fieldset><label for="race-goal">Финиш:</label><select id="race-goal" v-model="chosenGoal"><option v-for="n in [5,8,10,15]" :key="n" :value="n">{{ n }} баллов</option></select><button class="primary" @click="start">{{ started ? '↻ Снова' : '▶ Начать гонку' }}</button></div>
      <p v-if="error" class="error" role="alert">{{ error }}</p>
    </section>
    <section class="race-panel" aria-label="Гоночные дорожки"><h2>🏎️ Наши машинки</h2><p>Финиш — {{ goal }} правильных ответов</p><div v-for="(name, i) in names" :key="name" class="track-wrap"><div class="track-label"><strong>{{ i ? '🌸' : '🔵' }} Игрок {{ i + 1 }} — {{ name }}</strong><strong>{{ players[i]?.score ?? 0 }} / {{ goal }}</strong></div><div class="track" :class="i ? 'pink' : 'blue'" role="img" :aria-label="`${name}: ${players[i]?.score ?? 0} из ${goal}`"><span class="car" :style="{ left: `${Math.min(100, (players[i]?.score ?? 0) / goal * 100)}%` }">{{ i ? '🚗' : '🚙' }}</span><span class="finish" aria-hidden="true"></span></div></div></section>
    <p class="turn" role="status">{{ turnLabel }}</p>
    <div class="question-grid"><section v-for="(name, i) in names" :key="name" class="race-panel player" :class="[{ waiting: started && !finished && mode === 'turn' && active !== i }, i ? 'pink' : 'blue']"><h2>{{ i ? '🌸' : '🔵' }} {{ name }}</h2><p v-if="!started">Нажми «Начать гонку»</p><template v-else><p class="topic-name">{{ topics[players[i].question.cat] }}</p><div class="question"><span class="visual" aria-hidden="true">{{ players[i].question.visual }}</span><strong>{{ players[i].question.text }}</strong></div><div class="answers"><button v-for="choice in players[i].question.options" :key="choice" :disabled="finished || players[i].checked || mode === 'turn' && active !== i" :class="{ right: players[i].checked && choice === players[i].question.answer, wrong: players[i].checked && choice === players[i].choice && choice !== players[i].question.answer }" @click="answer(i, choice)">{{ choice }}<span v-if="players[i].checked && choice === players[i].question.answer"> ✓</span><span v-else-if="players[i].checked && choice === players[i].choice"> ✗</span></button></div><div v-if="players[i].checked" class="feedback" role="status"><strong>{{ players[i].choice === players[i].question.answer ? '✅ Верно! Машинка едет!' : '❌ Попробуем другой вопрос!' }}</strong><p>Правильный ответ: {{ players[i].question.answer }}.</p></div><button v-if="players[i].checked && !finished" class="primary next" @click="next(i)">Дальше</button></template></section></div>
    <section v-if="finished" class="winner" role="status"><h2>🏆 {{ names[winner] }} первым добрался до финиша! Молодец! 🎉</h2><p>Али: {{ players[0].score }} · Сая: {{ players[1].score }}</p><button class="primary" @click="start">↻ Снова</button></section>
    <p class="help">🔁 По очереди: отвечает только игрок, чей ход показан над вопросами. ⚡ Одновременно: оба могут отвечать в своём темпе. Правильный ответ двигает машинку вперёд.</p>
  </div>
</template>

<style scoped>
.race-game{max-width:1200px;margin:auto;padding:18px;color:#193455;background:radial-gradient(circle at 0 0,#dcf1ff,transparent 45%),radial-gradient(circle at 100% 0,#fff0d6,transparent 46%),#f7faff;border-radius:24px}.race-hero{text-align:center}.race-hero h1{font-size:clamp(30px,4.9vw,52px);color:#175eac;margin:8px}.race-hero p,.help{color:#516a82}.race-panel{background:white;border:2px solid #d2e3f1;border-radius:24px;padding:18px;margin:14px 0;box-shadow:0 6px 18px #2e649014}.settings{display:grid;grid-template-columns:1fr auto;gap:16px}.topics,.controls{display:flex;gap:9px;flex-wrap:wrap;align-items:center;margin-top:10px}.topics label,.controls label{display:inline-flex;align-items:center;gap:5px;padding:10px;border:2px solid #d6e6f4;border-radius:12px;background:#f9fcff;font-weight:700}.settings p{grid-column:1/-1}.settings fieldset{display:flex;gap:6px;flex-wrap:wrap;border:0;padding:0;margin:0}.settings legend{font-weight:700}.settings input{width:20px;height:20px}.settings select{min-height:50px;border:2px solid #cbdff0;border-radius:11px;padding:8px}.race-game button{min-height:54px;border:2px solid #c9dfef;border-radius:14px;background:white;color:#193455;font-size:18px;font-weight:800;padding:10px 14px}.race-game button.primary{background:#176abc;border-color:#176abc;color:white}.race-game button:focus-visible,.race-game select:focus-visible,.race-game input:focus-visible{outline:4px solid #ffce55;outline-offset:2px}.track-label{display:flex;justify-content:space-between;gap:12px}.track{position:relative;height:72px;margin:10px 0 18px;border:3px solid #9dbbd6;border-radius:15px;background:repeating-linear-gradient(90deg,#f1f6fb 0 34px,#eaf2fa 34px 68px);overflow:hidden}.track:before{content:'';position:absolute;top:50%;width:100%;border-top:3px dashed #a0b4c4}.car{position:absolute;top:7px;z-index:1;font-size:46px;transform:translateX(-100%);transition:left .5s}.car[style*="0%"]{transform:none}.finish{position:absolute;right:0;top:0;height:100%;width:26px;background:conic-gradient(#263d52 25%,white 0 50%,#263d52 0 75%,white 0) 0 0/18px 18px}.turn{text-align:center;background:#eef6ff;border-radius:14px;padding:14px;font-size:20px;font-weight:800}.question-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.player{border:3px solid #297bd7}.player.pink{border-color:#e54e87}.player.waiting{opacity:.65}.player h2{margin:0}.topic-name{font-weight:700}.question{min-height:130px;background:#f1f7ff;border-radius:18px;padding:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;font-size:clamp(20px,2.3vw,26px)}.pink .question{background:#fff3f8}.visual{font-size:44px}.answers{display:grid;gap:10px;margin-top:14px}.answers button.right{background:#d6f8e6;border-color:#269c67}.answers button.wrong{background:#ffe1e1;border-color:#e56e6e}.feedback{margin:14px 0;padding:12px;border-radius:12px;background:#eef6ff;font-size:18px}.feedback p{margin:5px 0}.next{margin-top:8px}.winner{text-align:center;background:#fff9d9;border:3px solid #ffc244;border-radius:22px;padding:18px}.error{color:#a03535;font-weight:bold}.help{text-align:center}@media(max-width:850px){.settings,.question-grid{grid-template-columns:1fr}.race-game{padding:9px}}
</style>
