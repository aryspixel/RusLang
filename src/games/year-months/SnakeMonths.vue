<script setup>
import WordSnakeTrainer from '../../components/WordSnakeTrainer.vue'
import { months } from './data.js'
const vocabulary = months.map(month => ({ id: month.id, label: month.ru }))
</script>

<template>
  <WordSnakeTrainer :vocabulary="vocabulary" :show-targets="false" title="Найди месяцы змейкой"
    result-title="Все 12 месяцев найдены!"
    result-text="Ты прочитал названия месяцев по буквенным змейкам."
    repeat-label="Повторить 3 уровень" />
</template>
