<script setup>
import { defineAsyncComponent, ref } from 'vue'
import TouchButton from '../../components/TouchButton.vue'
import SearchHouse from './SearchHouse.vue'
const FurnishHouse = defineAsyncComponent(() => import('./FurnishHouse.vue'))
const active = ref('search')
const furnishingLoaded = ref(false)
function switchBlock(value) {
  if (value === 'furnish') furnishingLoaded.value = true
  active.value = value
}
</script>

<template>
  <div class="game-layout">
    <h1>Перепутанный дом Али</h1>
    <nav class="game-tabs" aria-label="Игры с домом Али">
      <TouchButton :variant="active === 'search' ? 'primary' : 'secondary'" :aria-pressed="active === 'search'" @click="switchBlock('search')">Что перепутано?</TouchButton>
      <TouchButton :variant="active === 'furnish' ? 'primary' : 'secondary'" :aria-pressed="active === 'furnish'" @click="switchBlock('furnish')">Обставь дом</TouchButton>
    </nav>
    <SearchHouse v-show="active === 'search'" />
    <FurnishHouse v-if="furnishingLoaded" v-show="active === 'furnish'" :active="active === 'furnish'" />
  </div>
</template>
