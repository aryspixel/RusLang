<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch, defineAsyncComponent } from 'vue'
import { games } from './games/registry.js'
import { categories, subcategories, trainerCount } from './catalog/categories.js'
import SurfacePanel from './components/SurfacePanel.vue'

const hash = ref(window.location.hash)
const main = ref(null)
const onHashChange = () => { hash.value = window.location.hash }
onMounted(() => window.addEventListener('hashchange', onHashChange))
onUnmounted(() => window.removeEventListener('hashchange', onHashChange))
watch(hash, async () => {
  await nextTick()
  main.value?.focus()
  window.scrollTo(0, 0)
})
const gameId = computed(() => hash.value.startsWith('#/game/') ? hash.value.slice(7) : null)
const game = computed(() => games.find(item => item.id === gameId.value))
const gameComponent = computed(() => game.value?.status === 'ready' && game.value.load ? defineAsyncComponent(game.value.load) : null)
const activeTheme = computed(() => game.value?.defaultTheme || 'neutral')
const categoryPath = computed(() => hash.value.startsWith('#/category/') ? hash.value.slice(11) : null)
const categoryId = computed(() => categoryPath.value?.split('/')[0])
const subcategoryId = computed(() => categoryPath.value?.split('/').slice(1).join('/') || null)
const category = computed(() => categories.find(item => item.id === categoryId.value))
const subcategory = computed(() => subcategories.find(item => item.category === categoryId.value && item.id === subcategoryId.value))
const readyGames = computed(() => games.filter(item => item.status === 'ready'))
const categoryGames = computed(() => readyGames.value.filter(item => item.category === categoryId.value))
const visibleGames = computed(() => categoryGames.value.filter(item => (item.subcategory || null) === subcategoryId.value))
const visibleSubcategories = computed(() => subcategories.filter(item => item.category === categoryId.value && categoryGames.value.some(game => game.subcategory === item.id)))
const gameCategory = computed(() => categories.find(item => item.id === game.value?.category))
const gameSubcategory = computed(() => subcategories.find(item => item.category === game.value?.category && item.id === game.value?.subcategory))
const backHref = computed(() => gameCategory.value ? '#/category/' + gameCategory.value.id + (gameSubcategory.value ? '/' + gameSubcategory.value.id : '') : '#/')
function audienceLabel(item) {
  if (item.gradeMin === null) return 'Класс уточняется'
  const grades = item.gradeMin === item.gradeMax ? item.gradeMin + ' класс' : item.gradeMin + '–' + item.gradeMax + ' классы'
  return item.audienceSource === 'source' ? grades : grades + ' · предварительно'
}
</script>

<template>
  <div class="site-shell" :class="'theme-' + activeTheme">
    <header class="site-header">
      <a class="site-brand" href="#/" aria-label="RusLang — все разделы">RusLang</a>
      <span class="site-header__label">Тренажёры по русскому языку</span>
    </header>
    <main ref="main" class="site-main" tabindex="-1">
      <template v-if="gameComponent">
        <a class="back-link" :href="backHref">← {{ gameSubcategory?.title || gameCategory?.title || 'Все разделы' }}</a>
        <component :is="gameComponent" />
      </template>
      <template v-else-if="gameId">
        <a class="back-link" :href="backHref">← {{ gameSubcategory?.title || gameCategory?.title || 'Все разделы' }}</a>
        <SurfacePanel>
          <h1>{{ game?.title || 'Тренажёр не найден' }}</h1>
          <p v-if="game" class="audience-label">{{ audienceLabel(game) }}</p>
          <p v-if="game">Игровой экран ещё не готов.</p>
          <p v-else>Проверьте ссылку или вернитесь к разделам.</p>
        </SurfacePanel>
      </template>
      <template v-else-if="category && (!subcategoryId || subcategory)">
        <a class="back-link" :href="subcategory ? '#/category/' + category.id : '#/'">← {{ subcategory ? category.title : 'Все разделы' }}</a>
        <div class="catalog-heading">
          <div><h1>{{ subcategory?.title || category.title }}</h1><p class="muted">{{ subcategory?.description || category.description }}</p></div>
          <span class="catalog-count">{{ trainerCount(subcategory ? visibleGames.length : categoryGames.length) }}</span>
        </div>
        <nav v-if="!subcategory && visibleSubcategories.length" class="catalog-subcategories" aria-label="Подразделы">
          <a v-for="item in visibleSubcategories" :key="item.id" class="surface-panel catalog-subcategory" :href="'#/category/' + category.id + '/' + item.id">
            <div><h2>{{ item.title }}</h2><p>{{ item.description }}</p><span class="catalog-count">{{ trainerCount(categoryGames.filter(game => game.subcategory === item.id).length) }}</span></div>
            <span class="catalog-subcategory__arrow" aria-hidden="true">→</span>
          </a>
        </nav>
        <div class="catalog-grid">
          <SurfacePanel v-for="item in visibleGames" :key="item.id" class="catalog-card">
            <h2>{{ item.title }}</h2>
            <p class="muted">{{ item.interaction }}</p>
            <a class="touch-button catalog-card__open" :href="'#/game/' + item.id" :aria-label="'Начать: ' + item.title">Начать <span aria-hidden="true">→</span></a>
          </SurfacePanel>
        </div>
      </template>
      <template v-else-if="categoryPath !== null">
        <a class="back-link" href="#/">← Все разделы</a>
        <SurfacePanel><h1>Раздел не найден</h1><p>Вернитесь на главную и выберите раздел.</p></SurfacePanel>
      </template>
      <template v-else>
        <div class="catalog-welcome">
          <p class="catalog-eyebrow">Практика на каждом уроке</p>
          <h1>Русский язык.<br />Выберите свой раздел.</h1>
          <p class="muted">От первых слов до сложных предложений</p>
        </div>
        <nav class="category-grid" aria-label="Разделы тренажёров">
          <a v-for="item in categories" :key="item.id" class="category-card" :class="'category-card--' + item.id" :href="'#/category/' + item.id">
            <div class="category-card__top">
              <svg class="category-card__icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="item.icon" /></svg>
              <span class="category-card__count">{{ trainerCount(readyGames.filter(game => game.category === item.id).length) }}</span>
            </div>
            <p class="category-card__caption">{{ item.caption }}</p>
            <h2>{{ item.title }}</h2>
            <p class="category-card__description">{{ item.description }}</p>
            <span class="category-card__action">Открыть раздел <span aria-hidden="true">↗</span></span>
          </a>
        </nav>
      </template>
    </main>
  </div>
</template>
