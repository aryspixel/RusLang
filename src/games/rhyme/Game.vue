<script setup>
import PracticeSessionTrainer from '../../components/PracticeSessionTrainer.vue'
import RuleCard from './RuleCard.vue'
import AnswerReview from './AnswerReview.vue'
import DATA from './data.json'

const config = {
  title: 'Рифма и рифмовка',
  storageKey: 'rhyme-ent-mistakes-v1',
  answerSound: true,
  soundStorageKey: 'rhyme-sound-enabled',
  kinds: { theory: 'Понятия', scheme: 'Буквенные схемы', poem: 'Разбор четверостиший', gender: 'Рифмы по ударению' },
  introTitle: 'От правила к практике',
  intro: 'Находите созвучия, составляйте схемы и различайте рифмы по ударению. В обучении после каждого ответа — понятный разбор.',
  referenceTitle: 'Памятки по теме',
  referenceCountLabel: 'памяток',
  referenceIntro: 'Пять памяток: определения, схемы, частые ошибки и примеры. В незавершённом подходе справочник закрыт, чтобы сохранить условия выбранного режима.',
  referenceFields: ['title', 'rule', 'method', 'trap', 'example'],
  searchLabel: 'Поиск по памяткам',
  searchPlaceholder: 'Например: строфа, схема, ударение',
  emptySearch: 'Ничего не найдено. Попробуйте часть слова или другое название темы.',
  footer: 'Учебный тренажёр по теме «Рифма и рифмовка». Задания авторские, не официальный вариант ЕНТ. История ошибок хранится только в этом браузере. Основные правила: учебные определения по стиховедению и презентация «Рифма и рифмовка». Классические фрагменты — А. С. Пушкин и М. Ю. Лермонтов; остальные четверостишия учебные.',
}
</script>

<template>
  <PracticeSessionTrainer :data="DATA" :config="config">
    <template #review="{ item }"><AnswerReview :item="item" /></template>
    <template #reference="{ work }"><RuleCard :work="work" /></template>
  </PracticeSessionTrainer>
</template>
