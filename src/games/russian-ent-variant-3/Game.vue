<script setup>
import EntMixedTrainer from '../../components/EntMixedTrainer.vue'
import { questions } from './data.js'

const specification = 'https://testcenter.kz/wp-content/uploads/2025/10/05_%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9-%D1%8F%D0%B7%D1%8B%D0%BA.pdf'
</script>

<template>
  <EntMixedTrainer
    title="Русский язык · вариант 3"
    intro="40 заданий: 25 с одним ответом, 5 по одному тексту, 5 с выбором нескольких ответов и 5 на соответствие. Максимум — 50 тренировочных баллов."
    :questions="questions"
    :specification="specification"
    specification-label="спецификации НЦТ по русскому языку"
    weighted-score
  />
</template>
