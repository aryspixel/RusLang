<script setup>
import PracticeSessionTrainer from '../../components/PracticeSessionTrainer.vue'
import RuleCard from './RuleCard.vue'
import AnswerReview from './AnswerReview.vue'
import DATA from './data.json'

const config = {
  title: 'Причастия и деепричастия',
  storageKey: 'shortforms-ent-mistakes-v1',
  kinds: { identify: 'Распознавание формы', spelling: 'Н и НН', punct: 'Обороты и запятые', grammar: 'Грамматические ошибки', mixed: 'Смешанные задания' },
  introTitle: 'От правила к практике',
  intro: 'Различайте формы, выбирайте Н или НН, находите границы оборотов и проверяйте запятые. После каждого ответа в обучении — объяснение.',
  referenceTitle: 'Памятки по теме',
  referenceCountLabel: 'памяток',
  referenceIntro: 'Шесть памяток: определения, алгоритмы, частые ошибки и примеры. В незавершённом подходе справочник закрыт, чтобы сохранить условия выбранного режима.',
  referenceFields: ['title', 'rule', 'method', 'trap', 'example'],
  searchLabel: 'Поиск по памяткам',
  searchPlaceholder: 'Например: НН, исполнитель, запятые',
  emptySearch: 'Ничего не найдено. Попробуйте часть слова или другое название темы.',
  footer: 'История ошибок хранится только в этом браузере.',
}
</script>

<template>
  <PracticeSessionTrainer :data="DATA" :config="config">
    <template #review="{ item }"><AnswerReview :item="item" /></template>
    <template #reference="{ work }"><RuleCard :work="work" /></template>
  </PracticeSessionTrainer>
</template>
