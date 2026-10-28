<script setup>
import PracticeSessionTrainer from '../../components/PracticeSessionTrainer.vue'
import RuleCard from '../participles/RuleCard.vue'
import AnswerReview from './AnswerReview.vue'
import DATA from './data.js'

const config = {
  title: 'Русский язык · тренировочный тест',
  storageKey: 'russian-ent-practice-mistakes-v1',
  defaultCount: 'all',
  kinds: { choice: 'Выбор ответа' },
  introTitle: 'Тренажёр по русскому языку',
  intro: '45 вопросов по орфографии, пунктуации, грамматике, лексике и средствам выразительности. Выберите обучение с объяснениями или тест без подсказок.',
  referenceTitle: 'Памятки по темам',
  referenceCountLabel: 'тем',
  referenceIntro: 'Краткие правила и алгоритмы по пяти разделам тренажёра.',
  referenceFields: ['title', 'rule', 'method', 'trap', 'example'],
  searchLabel: 'Поиск по памяткам',
  searchPlaceholder: 'Например: запятая, корень, метафора',
  emptySearch: 'Памяток по запросу нет.',
}
</script>

<template>
  <PracticeSessionTrainer :data="DATA" :config="config">
    <template #review="{ item }"><AnswerReview :item="item" /></template>
    <template #reference="{ work }"><RuleCard :work="work" /></template>
  </PracticeSessionTrainer>
</template>
