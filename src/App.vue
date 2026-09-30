<script setup>
import { computed, onMounted, onUnmounted, ref, defineAsyncComponent } from 'vue'
import { games } from './games/registry.js'
import { filterGroups, matchesFilters } from './catalog/filtering.js'
import TouchButton from './components/TouchButton.vue'
import SurfacePanel from './components/SurfacePanel.vue'
import ProgressMeter from './components/ProgressMeter.vue'
import FeedbackMessage from './components/FeedbackMessage.vue'
import ChoiceGroup from './components/ChoiceGroup.vue'

const hash = ref(window.location.hash)
const selected = ref(null)
const previewFeedback = ref(false)
const searchText = ref('')
const selectedFilters = ref({ grade: [], topic: [], format: [], language: [] })
const onHashChange = () => { hash.value = window.location.hash }
onMounted(() => window.addEventListener('hashchange', onHashChange))
onUnmounted(() => window.removeEventListener('hashchange', onHashChange))

const gameId = computed(() => hash.value.startsWith('#/game/') ? hash.value.slice(7) : null)
const game = computed(() => games.find(item => item.id === gameId.value))
const gameComponent = computed(() => game.value?.status === 'ready' && game.value.load ? defineAsyncComponent(game.value.load) : null)
const stylePage = computed(() => hash.value === '#/components')
const activeTheme = computed(() => game.value?.defaultTheme || 'neutral')
const visibleGames = computed(() => games.filter(item => matchesFilters(item, selectedFilters.value, searchText.value)))
const hasFilters = computed(() => searchText.value.trim() !== '' || Object.values(selectedFilters.value).some(values => values.length > 0))
function availableOptions(group) {
  return group.options.filter(option => games.some(item => item.facets[group.key].includes(option.id)))
}
function toggleFilter(group, id) {
  const current = selectedFilters.value[group]
  selectedFilters.value = { ...selectedFilters.value, [group]: current.includes(id) ? current.filter(value => value !== id) : [...current, id] }
}
function clearFilters() {
  selectedFilters.value = { grade: [], topic: [], format: [], language: [] }
  searchText.value = ''
}
function facetLabel(groupKey, id) {
  return filterGroups.find(group => group.key === groupKey)?.options.find(option => option.id === id)?.label || id
}
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
          <p class="lead">Интерактивные упражнения по русскому языку. Выберите тренажёр или уточните список фильтрами.</p>
          <a class="text-link" href="#/components">Посмотреть общие элементы →</a>
        </div>
        <SurfacePanel class="catalog-filters">
          <div class="catalog-filters__heading">
            <div><h2>Найти упражнение</h2><p class="muted">Выберите нужные признаки или введите название.</p></div>
            <TouchButton v-if="hasFilters" variant="secondary" @click="clearFilters">Сбросить фильтры</TouchButton>
          </div>
          <label class="catalog-search">Поиск по названию и теме
            <input v-model="searchText" type="search" placeholder="Например, дни недели" />
          </label>
          <fieldset v-for="group in filterGroups" :key="group.key" class="filter-group">
            <legend>{{ group.title }}</legend>
            <div class="filter-group__options">
              <button v-for="option in availableOptions(group)" :key="option.id" type="button" class="filter-chip" :class="{ 'filter-chip--active': selectedFilters[group.key].includes(option.id) }" :aria-pressed="selectedFilters[group.key].includes(option.id)" @click="toggleFilter(group.key, option.id)">{{ option.label }}</button>
            </div>
          </fieldset>
        </SurfacePanel>
        <h2 class="section-title" role="status">Найдено: {{ visibleGames.length }} из {{ games.length }}</h2>
        <div class="catalog-grid">
          <SurfacePanel v-for="item in visibleGames" :key="item.id">
            <span class="catalog-card__status">{{ item.status === 'ready' ? 'Можно играть' : 'Ожидает переноса' }}</span>
            <h3>{{ item.title }}</h3>
            <p class="audience-label">{{ audienceLabel(item) }}</p>
            <p>{{ item.topic }}</p>
            <p class="muted">{{ item.interaction }}</p>
            <div class="catalog-card__tags" aria-label="Теги упражнения">
              <span class="catalog-card__tag">{{ facetLabel('topic', item.facets.topic[0]) }}</span>
              <span v-for="id in item.facets.format" :key="id" class="catalog-card__tag">{{ facetLabel('format', id) }}</span>
              <span class="catalog-card__tag">{{ facetLabel('language', item.facets.language[0]) }}</span>
            </div>
            <a v-if="item.status === 'ready'" class="catalog-card__open" :href="`#/game/${item.id}`">Открыть тренажёр →</a>
          </SurfacePanel>
        </div>
        <SurfacePanel v-if="visibleGames.length === 0" class="catalog-empty">
          <h3>По этим признакам ничего не найдено</h3>
          <p>Попробуйте убрать один из фильтров или изменить поисковый запрос.</p>
          <TouchButton variant="secondary" @click="clearFilters">Показать все упражнения</TouchButton>
        </SurfacePanel>
      </template>
    </main>
  </div>
</template>
