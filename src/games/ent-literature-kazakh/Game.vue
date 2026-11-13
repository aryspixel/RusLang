<script setup>
import EntMixedTrainer from '../../components/EntMixedTrainer.vue'
import { questions } from './data.js'
const specification = 'https://new.testcenter.kz/wp-content/uploads/2025/10/03_%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B0%D1%8F-%D0%BB%D0%B8%D1%82%D0%B5%D1%80%D0%B0%D1%82%D1%83%D1%80%D0%B0-%D1%81-%D0%BD%D0%B5%D1%80%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%BC-%D1%8F%D0%B7.-%D0%BE%D0%B1%D1%83%D1%87%D0%B5%D0%BD%D0%B8%D1%8F.pdf'
</script>
<template>
  <EntMixedTrainer title="Русская литература · ЕНТ для казахских школ" intro="Авторы, произведения, жанры и анализ текста из круга чтения школ с казахским языком обучения." :questions="questions" :specification="specification" />
</template>
