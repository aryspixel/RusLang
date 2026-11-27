<script setup>
import { ref } from 'vue'
import EntMixedTrainer from '../../components/EntMixedTrainer.vue'
import { questions } from './data.js'
import { questions as variantTwoQuestions } from '../ent-russian-kazakh-2/data.js'
const specification = 'https://new.testcenter.kz/wp-content/uploads/2025/10/06_%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9-%D1%8F%D0%B7%D1%8B%D0%BA-%D1%81-%D0%BD%D0%B5%D1%80%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%BC-%D1%8F%D0%B7%D1%8B%D0%BA%D0%BE%D0%BC-%D0%BE%D0%B1%D1%83%D1%87%D0%B5%D0%BD%D0%B8%D1%8F.pdf'
const variant = ref(1)
</script>
<template>
  <div class="action-row" role="group" aria-label="Вариант теста">
    <button type="button" class="choice-group__option" :class="{ 'choice-group__option--selected': variant === 1 }" :aria-pressed="variant === 1" @click="variant = 1">Вариант 1</button>
    <button type="button" class="choice-group__option" :class="{ 'choice-group__option--selected': variant === 2 }" :aria-pressed="variant === 2" @click="variant = 2">Вариант 2</button>
  </div>
  <div v-show="variant === 1"><EntMixedTrainer title="Русский язык · ЕНТ для казахских школ · вариант 1" intro="Орфография, формы слов, синтаксис и работа с текстом. Выбирай ответы, устанавливай соответствия и разбирай ошибки." :questions="questions" :specification="specification" /></div>
  <div v-show="variant === 2"><EntMixedTrainer title="Русский язык · ЕНТ для казахских школ · вариант 2" intro="40 заданий: 25 с одним ответом, 5 по общему тексту, 5 с несколькими ответами и 5 на соответствие. Ориентир по времени — около 80 минут." :questions="variantTwoQuestions" :specification="specification" /></div>
</template>
