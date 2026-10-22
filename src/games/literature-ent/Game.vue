<script setup>
import PracticeSessionTrainer from '../../components/PracticeSessionTrainer.vue'
import WorkPassport from './WorkPassport.vue'
import AnswerReview from './AnswerReview.vue'
import DATA from './data.json'

const config = {
  title: 'Литература: подготовка к ЕНТ',
  storageKey: 'lit-ent-mistakes-v1',
  kinds: { plot: 'Произведение по описанию', author: 'Автор и произведение', detail: 'Герои, детали и смысл' },
  introTitle: 'От паспорта к уверенному ответу',
  intro: 'Повторяйте произведения небольшими порциями. Находите опорные детали, разбирайте ошибки и возвращайтесь к сложным вопросам.',
  referenceTitle: 'Паспорта произведений',
  referenceCountLabel: 'паспортов и карт повторения',
  referenceIntro: `${DATA.works.length} карточек, включая карты повторения больших произведений. В лирике обращайте внимание на образы и движение чувства; в прозе и драме — на события, конфликт и выбор героя.`,
  referenceFields: ['title', 'author', 'heroes'],
  searchLabel: 'Найдите автора, название или героя',
  searchPlaceholder: 'Например: Печорин, Пушкин, Улыбка',
  emptySearch: 'Ничего не найдено. Попробуйте фамилию автора или часть названия.',
  footer: 'Учебный тренажёр по презентации «Паспорта произведений». Задания составлены для обучения и не являются официальными заданиями ЕНТ. История ошибок хранится только в этом браузере.',
}
</script>

<template>
  <PracticeSessionTrainer :data="DATA" :config="config">
    <template #review="{ item }"><AnswerReview :item="item" /></template>
    <template #reference="{ work }"><WorkPassport :work="work" /></template>
  </PracticeSessionTrainer>
</template>
