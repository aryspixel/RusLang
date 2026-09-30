<script setup>
import { computed, onMounted, onUnmounted, ref, defineAsyncComponent } from 'vue'
import { games } from './games/registry.js'
import { filterGroups, matchesFilters } from './catalog/filtering.js'
import TouchButton from './components/TouchButton.vue'
import SurfacePanel from './components/SurfacePanel.vue'

const hash = ref(window.location.hash)
const searchText = ref('')
const selectedFilters = ref({ grade: [], topic: [], format: [], language: [] })
const onHashChange = () => { hash.value = window.location.hash }
onMounted(() => window.addEventListener('hashchange', onHashChange))
onUnmounted(() => window.removeEventListener('hashchange', onHashChange))

const gameId = computed(() => hash.value.startsWith('#/game/') ? hash.value.slice(7) : null)
const game = computed(() => games.find(item => item.id === gameId.value))
const gameComponent = computed(() => game.value?.status === 'ready' && game.value.load ? defineAsyncComponent(game.value.load) : null)
const activeTheme = computed(() => game.value?.defaultTheme || 'neutral')
const readyGames = computed(() => games.filter(item => item.status === 'ready'))
const visibleGames = computed(() => readyGames.value.filter(item => matchesFilters(item, selectedFilters.value, searchText.value)))
const hasFilters = computed(() => searchText.value.trim() !== '' || Object.values(selectedFilters.value).some(values => values.length > 0))
function availableOptions(group) {
  return group.options.filter(option => readyGames.value.some(item => item.facets[group.key].includes(option.id)))
}
function toggleFilter(group, id) {
  const current = selectedFilters.value[group]
  selectedFilters.value = { ...selectedFilters.value, [group]: current.includes(id) ? current.filter(value => value !== id) : [...current, id] }
}
function clearFilters() {
  selectedFilters.value = { grade: [], topic: [], format: [], language: [] }
  searchText.value = ''
}
function cardTags(item) {
  const normalize = text => text.trim().toLocaleLowerCase('ru')
  const labels = ['topic', 'format', 'language'].flatMap(key =>
    item.facets[key].map(id => filterGroups.find(group => group.key === key)?.options.find(option => option.id === id)?.label || id)
  )
  return [...new Set(labels)].filter(label => normalize(label) !== normalize(item.title))
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
        <h1 class="section-title">Каталог тренажёров</h1>
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
        <h2 class="section-title" role="status">Найдено: {{ visibleGames.length }} из {{ readyGames.length }}</h2>
        <div class="catalog-grid">
          <SurfacePanel v-for="item in visibleGames" :key="item.id">
            <h3>{{ item.title }}</h3>
            <p class="audience-label">{{ audienceLabel(item) }}</p>
            <div class="catalog-card__tags" aria-label="Теги упражнения">
              <span v-for="label in cardTags(item)" :key="label" class="catalog-card__tag">{{ label }}</span>
            </div>
            <a class="touch-button catalog-card__open" :href="`#/game/${item.id}`" :aria-label="`Начать: ${item.title}`">Начать</a>
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
