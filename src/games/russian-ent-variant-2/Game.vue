<script setup>
import PracticeSessionTrainer from '../../components/PracticeSessionTrainer.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import RuleCard from '../participles/RuleCard.vue'
import DATA from './data.js'

const references = new Map(DATA.works.map(work => [work.id, work]))
const config = {
  title: 'Русский язык · вариант 2',
  storageKey: 'russian-ent-variant-2-mistakes-v1',
  defaultCount: 'all',
  hideSettingsButton: true,
  kinds: { choice: 'Выбор ответа' },
  introTitle: 'Тренировочный вариант по русскому языку',
  intro: '40 новых вопросов по орфографии, пунктуации, морфологии, синтаксису и лексике. Выберите обучение с объяснениями или тест без подсказок.',
  referenceTitle: 'Памятки по разделам',
  referenceCountLabel: 'разделов',
  referenceIntro: 'Краткий алгоритм работы с вопросами каждого раздела.',
  referenceFields: ['title', 'rule', 'method', 'trap', 'example'],
  searchLabel: 'Поиск по памяткам',
  searchPlaceholder: 'Например: пунктуация',
  emptySearch: 'Памяток по запросу нет.',
}
</script>

<template>
  <PracticeSessionTrainer :data="DATA" :config="config">
    <template #review="{ item }">
      <FeedbackMessage :kind="item.selected === 0 ? 'success' : 'error'" :title="item.selected === null ? 'Ответ пропущен' : item.selected === 0 ? 'Верно. Разберём почему.' : 'Есть ошибка. Разберём её.'">
        <p><strong>Правильный ответ:</strong> {{ item.q.choices[0].text }}</p>
        <p>{{ item.q.explanation }}</p>
        <RuleCard :work="references.get(item.q.work)" />
      </FeedbackMessage>
    </template>
    <template #reference="{ work }"><RuleCard :work="work" /></template>
  </PracticeSessionTrainer>
</template>
