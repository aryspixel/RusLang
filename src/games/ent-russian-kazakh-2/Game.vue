<script setup>
import EntMixedTrainer from '../../components/EntMixedTrainer.vue'
import { questions } from './data.js'

const specification = 'https://prod.testcenter.kz/wp-content/uploads/2025/10/06_%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9-%D1%8F%D0%B7%D1%8B%D0%BA-%D1%81-%D0%BD%D0%B5%D1%80%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%BC-%D1%8F%D0%B7%D1%8B%D0%BA%D0%BE%D0%BC-%D0%BE%D0%B1%D1%83%D1%87%D0%B5%D0%BD%D0%B8%D1%8F.pdf'
</script>

<template>
  <EntMixedTrainer title="Русский язык · ЕНТ для казахских школ · вариант 2" intro="40 заданий: 25 с одним ответом, 5 по общему тексту, 5 с несколькими ответами и 5 на соответствие. Ориентир по времени — около 80 минут." :questions="questions" :specification="specification" />
</template>
