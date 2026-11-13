<script setup>
import { computed, onUnmounted, ref } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import TouchButton from '../../components/TouchButton.vue'
import { places, routes, missions } from './data.js'

const missionIndex = ref(0)
const mode = ref('learn')
const current = ref('park')
const route = ref(null)
const pending = ref(null)
const chosen = ref([])
const bank = ref([])
const log = ref([])
const path = ref(['park'])
const tries = ref(0)
const first = ref(0)
const hadError = ref(false)
const checked = ref(false)
const done = ref(false)
const message = ref('Выбери автобус, затем соседнюю остановку.')
const messageKind = ref('')
const busPosition = ref({ x: places.park[3], y: places.park[4] })
const driving = ref(false)
const driveProgress = ref(0)
const travelStatus = ref('')
let animationFrame = null
const mission = computed(() => missions[missionIndex.value])
const name = id => places[id][0]
const activeRoutes = computed(() => Object.keys(routes).filter(number => routes[number].stops.includes(current.value)))
const nextStops = computed(() => route.value ? routes[route.value].stops.filter(id => adjacent(current.value, id, route.value)) : [])
const expected = computed(() => pending.value ? ['Мы едем', 'от', places[current.value][1], 'к', places[pending.value][2], `на автобусе № ${route.value}.`] : [])
const mapRoutes = computed(() => Object.entries(routes).map(([number, item]) => ({ number, color: item.color, points: routePoints(number, item.stops) })))
const stopEntries = Object.entries(places)
function routePoints(number, stops) {
  const points = []
  stops.forEach((id, index) => {
    const [x, y] = places[id].slice(3)
    if (index) {
      const [previousX, previousY] = places[stops[index - 1]].slice(3)
      if (previousX !== x && previousY !== y) points.push(number === '14' && stops[index - 1] === 'square' ? [previousX, y] : [x, previousY])
    }
    points.push([x, y])
  })
  return points.map(point => point.join(',')).join(' ')
}
function tripPoints(number, from, to) {
  const stops = routes[number].stops
  const forward = stops.indexOf(from) < stops.indexOf(to)
  const ids = forward ? [from, to] : [to, from]
  const points = routePoints(number, ids).split(' ').map(pair => pair.split(',').map(Number))
  return forward ? points : points.reverse()
}
function stopAnimation() {
  if (animationFrame !== null) cancelAnimationFrame(animationFrame)
  animationFrame = null
  driving.value = false
}
function driveToNextStop() {
  const destination = pending.value
  const points = tripPoints(route.value, current.value, destination)
  const lengths = points.slice(1).map((point, index) => Math.hypot(point[0] - points[index][0], point[1] - points[index][1]))
  const total = lengths.reduce((sum, length) => sum + length, 0)
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced || !total) {
    driveProgress.value = 1
    busPosition.value = { x: places[destination][3], y: places[destination][4] }
    travelStatus.value = `Автобус № ${route.value} прибыл: ${name(destination)}. Нажми «Дальше».`
    return
  }
  driving.value = true
  travelStatus.value = `Автобус № ${route.value} едет к остановке «${name(destination)}».`
  const started = performance.now()
  const duration = 1200
  function frame(now) {
    driveProgress.value = Math.min((now - started) / duration, 1)
    let remaining = driveProgress.value * total
    let index = 0
    while (index < lengths.length - 1 && remaining > lengths[index]) remaining -= lengths[index++]
    const ratio = lengths[index] ? Math.min(remaining / lengths[index], 1) : 1
    busPosition.value = { x: points[index][0] + (points[index + 1][0] - points[index][0]) * ratio, y: points[index][1] + (points[index + 1][1] - points[index][1]) * ratio }
    if (now - started < duration) animationFrame = requestAnimationFrame(frame)
    else {
      animationFrame = null; driving.value = false
      busPosition.value = { x: places[destination][3], y: places[destination][4] }
      travelStatus.value = `Автобус № ${route.value} прибыл: ${name(destination)}. Нажми «Дальше».`
    }
  }
  animationFrame = requestAnimationFrame(frame)
}
function adjacent(a, b, number) { const list = routes[number]?.stops || []; return Math.abs(list.indexOf(a) - list.indexOf(b)) === 1 && list.includes(a) && list.includes(b) }
function say(text, kind = '') { message.value = text; messageKind.value = kind }
function reset(index = missionIndex.value) {
  stopAnimation()
  missionIndex.value = index; current.value = index < 0 ? 'park' : missions[index][2]
  busPosition.value = { x: places[current.value][3], y: places[current.value][4] }; driveProgress.value = 0; travelStatus.value = ''
  route.value = null; pending.value = null; chosen.value = []; bank.value = []; log.value = []; path.value = [current.value]
  tries.value = 0; first.value = 0; hadError.value = false; checked.value = false; done.value = false
  say('Выбери автобус, затем соседнюю остановку.')
}
function selectRoute(number) { if (pending.value || checked.value || done.value || !activeRoutes.value.includes(number)) return; route.value = number; busPosition.value = { x: places[current.value][3], y: places[current.value][4] }; travelStatus.value = `Автобус № ${number} ждёт на остановке «${name(current.value)}».`; say(`Автобус № ${number}. Выбери соседнюю остановку.`) }
function selectStop(id) {
  if (pending.value || checked.value || done.value) return
  if (!route.value) return say('Сначала выбери автобус.')
  if (!adjacent(current.value, id, route.value)) return say(mode.value === 'learn' ? `По маршруту № ${route.value} нужно ехать по одной остановке.` : 'Проверь маршрут и порядок остановок.', 'error')
  pending.value = id; chosen.value = []; hadError.value = false; driveProgress.value = 0
  bank.value = [...new Set([...expected.value, places[current.value][2], places[id][1], places[id][0].toLowerCase(), 'в'])].sort(() => Math.random() - .5)
  say('Собери предложение. Лишние карточки оставь.')
}
function add(index) { if (checked.value) return; chosen.value.push(bank.value.splice(index, 1)[0]) }
function remove(index) { if (checked.value) return; bank.value.push(chosen.value.splice(index, 1)[0]) }
function clear() { if (checked.value) return; bank.value.push(...chosen.value); chosen.value = [] }
function check() {
  if (!pending.value || checked.value || !chosen.value.length) return
  tries.value++
  checked.value = true
  if (JSON.stringify(chosen.value) === JSON.stringify(expected.value)) {
    if (!hadError.value) first.value++
    say(`Верно! ${expected.value.join(' ')} Откуда? «от» + родительный падеж. Куда? «к» + дательный падеж.`, 'success')
    driveToNextStop()
  } else {
    hadError.value = true
    say(`Пока неверно. Правильный ответ: ${expected.value.join(' ')} Проверь порядок слов и окончания.`, 'error')
  }
}
function continueTrip() {
  if (!checked.value || driving.value) return
  if (messageKind.value === 'error') { checked.value = false; say('Попробуй собрать предложение ещё раз.'); return }
  log.value.push(expected.value.join(' ')); current.value = pending.value; path.value.push(current.value); pending.value = null; chosen.value = []; bank.value = []; checked.value = false; driveProgress.value = 0
  travelStatus.value = `Автобус № ${route.value} на остановке «${name(current.value)}».`
  if (missionIndex.value >= 0 && current.value === mission.value[3]) {
    const numbers = log.value.map(line => line.match(/№ (\d+)/)?.[1])
    const needsTransfer = [1, 3, 4, 5, 6].includes(missionIndex.value)
    const valid = needsTransfer ? new Set(numbers).size > 1 : new Set(numbers).size === 1
    if (valid) { done.value = true; say(`Маршрут пройден! Составлено предложений: ${log.value.length}.`, 'success') }
    else say(needsTransfer ? 'Ты достиг цели, но задание требует пересадки. Начни маршрут заново.' : 'Ты достиг цели, но задание требует поездки без пересадки. Начни маршрут заново.', 'error')
  } else say(`Ты приехал на остановку «${name(current.value)}». Продолжай или смени автобус.`)
}
onUnmounted(stopAnimation)
reset(0)
</script>

<template>
  <div class="game-layout route-game">
    <h1>Дана и Арман: по городу</h1>
    <p>Выбирай остановки. Собирай предложения. Объясняй дорогу. · 7–8 класс</p>
    <div class="action-row" role="group" aria-label="Режим">
      <TouchButton v-for="item in [['learn', 'Учусь'], ['test', 'Проверяю себя']]" :key="item[0]" :variant="mode === item[0] ? 'primary' : 'secondary'" :aria-pressed="mode === item[0]" @click="mode = item[0]">{{ item[1] }}</TouchButton>
    </div>
    <SurfacePanel>
      <label for="route-mission">{{ missionIndex < 0 ? 'Свободная поездка' : `Задание ${missionIndex + 1} из ${missions.length}` }}</label>
      <select id="route-mission" :value="missionIndex" @change="reset(Number($event.target.value))">
        <option v-for="(item, index) in missions" :key="index" :value="index">{{ index + 1 }}. {{ item[0] }}</option>
        <option value="-1">Свободная поездка</option>
      </select>
      <h2>{{ missionIndex < 0 ? 'Свободная поездка' : mission[0] }}</h2>
      <p>{{ missionIndex < 0 ? 'Выбери любой доступный маршрут и исследуй город. На каждой остановке строй новое предложение.' : mission[1] }}</p>
      <p><strong>Сейчас:</strong> {{ name(current) }} <template v-if="missionIndex >= 0">· <strong>Цель:</strong> {{ name(mission[3]) }}</template></p>
    </SurfacePanel>
    <SurfacePanel>
      <h2>Карта маршрутов</h2>
      <p>1. Выбери автобус. 2. Выбери соседнюю остановку по его линии.</p>
      <div class="action-row" role="group" aria-label="Автобусы">
        <TouchButton v-for="(item, number) in routes" :key="number" :variant="route === number ? 'primary' : 'secondary'" :disabled="!activeRoutes.includes(number) || !!pending || checked || done" :aria-pressed="route === number" @click="selectRoute(number)"><span class="route-swatch" :style="{ background: item.color }" aria-hidden="true"></span>Автобус № {{ number }}</TouchButton>
      </div>
      <p class="route-current"><strong>Вы здесь:</strong> {{ name(current) }}. <strong>Доступны автобусы:</strong> {{ activeRoutes.map(number => '№ ' + number).join(', ') }}.</p>
      <p v-if="route"><strong>Маршрут № {{ route }}:</strong> {{ routes[route].stops.map(name).join(' → ') }}. <strong>Следующие остановки:</strong> {{ nextStops.map(name).join(' или ') }}.</p>
      <p v-if="travelStatus" class="route-travel" role="status" aria-live="polite">{{ travelStatus }}</p>
      <svg class="route-map" viewBox="0 0 1100 660" aria-label="Схема остановок трёх автобусных маршрутов. Нажмите доступную соседнюю остановку.">
        <rect width="1100" height="660" fill="#f0f3eb" />
        <polyline v-for="item in mapRoutes" :key="item.number" :points="item.points" fill="none" :stroke="item.color" :stroke-width="route === item.number ? 12 : 7" :opacity="!route || route === item.number ? 1 : .3" stroke-linejoin="round" stroke-linecap="round" />
        <g v-for="[id, place] in stopEntries" :key="id" class="map-stop" :class="{ reachable: nextStops.includes(id), here: current === id }" role="button" :tabindex="pending || checked || done ? -1 : 0" :aria-label="`Остановка ${place[0]}${current === id ? ', вы здесь' : nextStops.includes(id) ? ', следующая по маршруту' : ''}`" :aria-disabled="!!pending || checked || done" @click="selectStop(id)" @keydown.enter.prevent="selectStop(id)" @keydown.space.prevent="selectStop(id)"><rect :x="place[3] - 76" :y="place[4] - 31" width="152" height="87" rx="16" :fill="current === id ? '#e5d8ef' : nextStops.includes(id) ? '#e6f4e7' : '#fffdf9'" :stroke="nextStops.includes(id) ? '#32765b' : '#b7b4bf'" :stroke-width="nextStops.includes(id) ? 4 : 2" /><circle :cx="place[3]" :cy="place[4]" r="13" :fill="current === id ? '#7255a1' : '#fff'" stroke="#54476a" stroke-width="3" /><text :x="place[3]" :y="place[4] + 34" text-anchor="middle" font-size="17" font-weight="700" fill="#302b38">{{ place[0] }}</text></g>
        <g v-if="route" class="map-bus" :transform="`translate(${busPosition.x - 34} ${busPosition.y - 62})`" aria-hidden="true"><rect x="0" y="0" width="68" height="34" rx="8" :fill="routes[route].color" stroke="#fff" stroke-width="3" /><rect x="8" y="7" width="20" height="11" rx="2" fill="#e5f4ff" /><rect x="34" y="7" width="16" height="11" rx="2" fill="#e5f4ff" /><circle cx="15" cy="34" r="5" fill="#272f3a" /><circle cx="52" cy="34" r="5" fill="#272f3a" /><rect x="48" y="-12" width="26" height="20" rx="5" fill="#fff" stroke="#333" stroke-width="2" /><text x="61" y="3" text-anchor="middle" font-size="14" font-weight="800" fill="#222">{{ route }}</text></g>
      </svg>
      <p>Нажми подсвеченную остановку на карте или кнопку ниже. Маршруты работают в обе стороны. Расстояния и время поездки не указаны.</p>
      <div class="stop-grid" role="group" aria-label="Остановки">
        <button v-for="[id, place] in stopEntries" :key="id" type="button" :disabled="!!pending || checked || done" :class="{ reachable: nextStops.includes(id), here: current === id }" @click="selectStop(id)">{{ place[0] }}<small v-if="current === id">Вы здесь</small><small v-else-if="nextStops.includes(id)">Следующая остановка</small></button>
      </div>
      <div class="action-row"><TouchButton variant="secondary" @click="reset()">Начать маршрут заново</TouchButton><TouchButton variant="secondary" @click="reset(-1)">Свободная поездка</TouchButton></div>
    </SurfacePanel>
    <SurfacePanel v-if="pending">
      <h2>Твоя реплика: {{ name(current) }} → {{ name(pending) }}</h2>
      <p>Собери предложение: откуда, куда и на каком автобусе едем.</p>
      <div class="trip-preview" aria-hidden="true"><span>{{ name(current) }}</span><div class="trip-track"><span class="trip-bus" :style="{ left: `${driveProgress * 100}%`, background: routes[route].color }">🚌 <b>{{ route }}</b></span></div><span>{{ name(pending) }}</span></div>
      <div class="word-row" aria-label="Собранное предложение"><button v-for="(word, index) in chosen" :key="index" type="button" :disabled="checked" @click="remove(index)">{{ word }}</button><span v-if="!chosen.length">Нажимай карточки снизу…</span></div>
      <div class="word-row" aria-label="Карточки со словами"><button v-for="(word, index) in bank" :key="word + index" type="button" :disabled="checked" @click="add(index)">{{ word }}</button></div>
      <div class="action-row"><TouchButton v-if="!checked" :disabled="!chosen.length" @click="check">Проверить</TouchButton><TouchButton v-else :disabled="driving" @click="continueTrip">{{ driving ? 'Автобус едет…' : messageKind === 'error' ? 'Попробовать снова' : 'Дальше' }}</TouchButton><TouchButton v-if="!checked" variant="secondary" @click="clear">Очистить</TouchButton><TouchButton v-if="!checked" variant="secondary" @click="pending = null; chosen = []; bank = []">Другую остановку</TouchButton></div>
    </SurfacePanel>
    <p class="route-feedback" :class="messageKind" role="status" aria-live="polite">{{ message }}</p>
    <SurfacePanel v-if="done"><h2>Маршрут пройден!</h2><p>Прочитай дневник поездки вслух.</p><TouchButton @click="reset(missionIndex < missions.length - 1 ? missionIndex + 1 : 0)">{{ missionIndex < missions.length - 1 ? 'Следующее задание' : 'Повторить задания' }}</TouchButton></SurfacePanel>
    <details v-if="mode === 'learn'" class="game-help"><summary>Подсказка · Көмек</summary><p><b>Откуда?</b> от + родительный падеж: от парка, от библиотеки.<br>Қайдан? Шыққан орынды көрсетеміз.</p><p><b>Куда?</b> к + дательный падеж: к парку, к библиотеке.<br>Қайда? Қозғалыс бағытын көрсетеміз.</p><p><b>На чём?</b> на автобусе № 23.<br>Немен? № 23 автобуспен.</p></details>
    <SurfacePanel><h2>Дневник поездки</h2><p>Переездов: {{ log.length }} · Проверок: {{ tries }} · Верно с первой попытки: {{ first }}</p><p>{{ path.map(name).join(' → ') }}</p><ol><li v-for="(line, index) in log" :key="index">{{ line }}</li></ol><p>Учебный город из истории «Не к той школе!». Номер автобуса и номер школы — разные вещи.</p></SurfacePanel>
  </div>
</template>

<style scoped>
.route-game select { display: block; min-height: 56px; max-width: 100%; margin: 8px 0 18px; padding: 8px; font: inherit; border: 2px solid var(--color-border); border-radius: var(--radius-control); }
.route-map { display: block; width: 100%; height: auto; margin: 16px 0; border: 2px solid var(--color-border); border-radius: 16px; }
.route-swatch { display: inline-block; width: 18px; height: 18px; margin-right: 8px; border: 1px solid #333; border-radius: 50%; vertical-align: middle; }
.route-current { padding: 12px 16px; border-radius: var(--radius-control); background: var(--color-selected); }
.route-travel { font-weight: 700; }
.map-bus { pointer-events: none; filter: drop-shadow(0 3px 4px #26334388); }
.trip-preview { display: grid; grid-template-columns: minmax(0, 1fr) minmax(80px, 2fr) minmax(0, 1fr); align-items: center; gap: 12px; margin: 16px 0 26px; font-weight: 700; overflow-wrap: anywhere; }
.trip-track { position: relative; height: 5px; margin: 0 26px; background: var(--color-border); }
.trip-bus { position: absolute; top: -30px; transform: translateX(-50%); white-space: nowrap; padding: 4px 7px; border-radius: 8px; color: #fff; font-size: 18px; }
.map-stop { cursor: pointer; }
.map-stop:focus-visible { outline: none; }
.map-stop:focus-visible rect { stroke: var(--color-focus); stroke-width: 6; }
.stop-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 12px; }
.stop-grid button, .word-row button { min-height: 64px; padding: 10px 14px; border: 2px solid var(--color-border); border-radius: var(--radius-control); background: var(--color-surface); color: var(--color-text); font: inherit; font-weight: 700; }
.stop-grid button.reachable { border-color: var(--color-primary); background: var(--color-selected); }
.stop-grid button.here { background: #e5d8ef; }
.stop-grid small { display: block; font-size: .7em; font-weight: 500; }
.word-row { display: flex; flex-wrap: wrap; gap: 12px; min-height: 76px; margin: 14px 0; }
.route-feedback { padding: 18px; border: 2px solid var(--color-border); border-radius: var(--radius-control); background: var(--color-selected); }
.route-feedback.success { border-color: var(--color-success); background: var(--color-success-bg); }
.route-feedback.error { border-color: var(--color-error); background: var(--color-error-bg); }
</style>
