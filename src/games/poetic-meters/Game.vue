<script setup>
import PracticeSessionTrainer from '../../components/PracticeSessionTrainer.vue'
import RuleCard from './RuleCard.vue'
import AnswerReview from './AnswerReview.vue'
import DATA from './data.json'

const config = {
  title: 'Стихотворные размеры',
  storageKey: 'meter-ent-mistakes-v1',
  answerSound: true,
  soundStorageKey: 'meter-sound-enabled',
  kinds: { theory: 'Понятия', scheme: 'Схемы размеров', model: 'Слова-модели', line: 'Разбор строк', count: 'Число стоп', error: 'Частые ошибки' },
  introTitle: 'От правила к практике',
  intro: 'Различайте хорей, ямб и трёхсложные размеры. Находите ударения и считайте стопы. В обучении после ответа — подробный разбор строки.',
  referenceTitle: 'Памятки по теме',
  referenceCountLabel: 'памяток',
  referenceIntro: 'Шесть памяток: понятия, схемы, примеры и частые ошибки. В незавершённом подходе справочник закрыт, чтобы сохранить условия выбранного режима.',
  referenceFields: ['title', 'rule', 'method', 'trap', 'example'],
  searchLabel: 'Поиск по памяткам',
  searchPlaceholder: 'Например: амфибрахий, стопа, ударение',
  emptySearch: 'Ничего не найдено. Попробуйте часть слова или другое название темы.',
  footer: 'Учебный тренажёр по стихотворным размерам. Авторские задания по презентации-конспекту, не официальный вариант ЕНТ. История ошибок хранится в этом браузере. В разборе ударные слоги выделены заглавными буквами, / отделяет стопы. Цитаты: А. С. Пушкин, Ф. И. Тютчев, М. Ю. Лермонтов, Н. А. Некрасов, А. А. Фет.',
}
</script>

<template>
  <PracticeSessionTrainer :data="DATA" :config="config">
    <template #review="{ item }"><AnswerReview :item="item" /></template>
    <template #reference="{ work }"><RuleCard :work="work" /></template>
  </PracticeSessionTrainer>
</template>
