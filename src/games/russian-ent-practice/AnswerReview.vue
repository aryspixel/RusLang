<script setup>
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import RuleCard from '../participles/RuleCard.vue'
import DATA from './data.js'

defineProps({ item: { type: Object, required: true } })
const works = new Map(DATA.works.map(work => [work.id, work]))
</script>

<template>
  <FeedbackMessage :kind="item.selected === 0 ? 'success' : 'error'" :title="item.selected === null ? 'Ответ пропущен' : item.selected === 0 ? 'Верно. Разберём почему.' : 'Есть ошибка. Разберём её.'">
    <p><strong>Правильный ответ:</strong> {{ item.q.choices[0].text }}</p>
    <p>{{ item.q.explanation }}</p>
    <RuleCard :work="works.get(item.q.work)" />
  </FeedbackMessage>
</template>
