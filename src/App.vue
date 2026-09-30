<script setup>
import { computed, onMounted, onUnmounted, ref, defineAsyncComponent } from 'vue'
import { games } from './games/registry.js'
import TouchButton from './components/TouchButton.vue'
import SurfacePanel from './components/SurfacePanel.vue'
import ProgressMeter from './components/ProgressMeter.vue'
import FeedbackMessage from './components/FeedbackMessage.vue'
import ChoiceGroup from './components/ChoiceGroup.vue'

const hash = ref(window.location.hash)
const selected = ref(null)
const previewFeedback = ref(false)
const themeChoice = ref('auto')
const onHashChange = () => { hash.value = window.location.hash }
onMounted(() => window.addEventListener('hashchange', onHashChange))
onUnmounted(() => window.removeEventListener('hashchange', onHashChange))

const gameId = computed(() => hash.value.startsWith('#/game/') ? hash.value.slice(7) : null)
const game = computed(() => games.find(item => item.id === gameId.value))
const gameComponent = computed(() => game.value?.status === 'ready' && game.value.load ? defineAsyncComponent(game.value.load) : null)
const stylePage = computed(() => hash.value === '#/components')
const activeTheme = computed(() => themeChoice.value === 'auto' ? (game.value?.defaultTheme || 'neutral') : themeChoice.value)
function audienceLabel(item) {
  if (item.gradeMin === null) return 'Класс уточняется'
  const grades = item.gradeMin === item.gradeMax ? `${item.gradeMin} класс` : `${item.gradeMin}–${item.gradeMax} классы`
  return item.audienceSource === 'source' ? grades : `${grades} · предварительно`
}
</script>

<template>
  <div class="site-shell" :class="`theme-${activeTheme}`">
    <header class="site-header">
      <a class="site-brand" href="#/">RusLang</a>
      <span class="site-header__label">Тренажёры по русскому языку</span>
      <label class="theme-picker">Оформление
        <select v-model="themeChoice">
          <option value="auto">По заданию</option>
          <option value="neutral">Нейтральное</option>
          <option value="junior">Начальная школа</option>
          <option value="middle">Средняя школа</option>
          <option value="senior">Старшая школа</option>
        </select>
      </label>
    </header>

    <main class="site-main">
      <template v-if="gameComponent">
        <a class="back-link" href="#/">← К каталогу</a>
        <component :is="gameComponent" />
      </template>

      <template v-else-if="stylePage">
        <a class="back-link" href="#/">← К каталогу</a>
        <h1>Общие элементы</h1>
        <p class="lead">Проверка размера и поведения элементов перед переносом игр.</p>
        <div class="demo-grid">
          <SurfacePanel>
            <h2>Ответ на вопрос</h2>
            <p>Выбери один вариант. Ответ здесь служит примером интерфейса.</p>
            <ChoiceGroup label="Пример выбора ответа" :options="[{ value: 'a', label: 'Первый вариант' }, { value: 'b', label: 'Второй вариант' }]" :selected="selected" @select="selected = $event; previewFeedback = false" />
            <div class="action-row"><TouchButton :disabled="selected === null" @click="previewFeedback = true">Проверить</TouchButton><TouchButton variant="secondary" @click="selected = null; previewFeedback = false">Сбросить</TouchButton></div>
            <FeedbackMessage v-if="previewFeedback" kind="success" title="Выбор принят">Здесь появится учебное объяснение из конкретной игры.</FeedbackMessage>
          </SurfacePanel>
          <SurfacePanel>
            <h2>Прогресс</h2>
            <ProgressMeter :current="3" :total="10" />
            <p class="muted">Текст и шкала сообщают одно и то же состояние.</p>
          </SurfacePanel>
        </div>
      </template>

      <template v-else-if="gameId">
        <a class="back-link" href="#/">← К каталогу</a>
        <SurfacePanel>
          <h1>{{ game?.title || 'Тренажёр не найден' }}</h1>
          <p v-if="game" class="audience-label">{{ audienceLabel(game) }}</p>
          <p v-if="game">Этот тренажёр указан в плане переноса. Игровой экран ещё не готов.</p>
          <p v-else>Проверьте ссылку или вернитесь к каталогу.</p>
        </SurfacePanel>
      </template>

      <template v-else>
        <div class="hero">
          <p class="eyebrow">Русский язык · интерактивная панель</p>
          <h1>Каталог тренажёров</h1>
          <p class="lead">Общий интерфейс для учебных игр. Сейчас готова основа проекта; упражнения ожидают переноса из HTML.</p>
          <a class="text-link" href="#/components">Посмотреть общие элементы →</a>
        </div>
        <h2 class="section-title">В плане переноса · {{ games.length }}</h2>
        <div class="catalog-grid">
          <SurfacePanel v-for="item in games" :key="item.id">
            <span class="catalog-card__status">Ожидает переноса</span>
            <h3>{{ item.title }}</h3>
            <p class="audience-label">{{ audienceLabel(item) }}</p>
            <p>{{ item.topic }}</p>
            <p class="muted">{{ item.interaction }}</p>
          </SurfacePanel>
        </div>
      </template>
    </main>
  </div>
</template>
