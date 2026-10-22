<script setup>
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import RuleCard from './RuleCard.vue'
import DATA from './data.json'
defineProps({ item: { type: Object, required: true } })
const works = new Map(DATA.works.map(work => [work.id, work]))
</script>

<template>
  <FeedbackMessage :kind="item.selected === 0 ? 'success' : 'error'" :title="item.selected === null ? 'Ответ пропущен' : item.selected === 0 ? 'Верно. Разберём почему.' : 'Есть ошибка. Разберём её.'">
    <p><strong>Правильный ответ:</strong> {{ item.q.choices[0].text }}</p>
    <h3>1. Опорный вопрос</h3><p>{{ item.q.hints[0] }}</p>
    <h3>2. Разбор ответа</h3><p>{{ item.q.explanation }}</p>
    <h3>3. Как избежать ошибки</h3><p>{{ works.get(item.q.work).trap }}</p>
    <h3>4. Порядок проверки</h3><p>{{ item.q.method }}</p>
    <RuleCard :work="works.get(item.q.work)" />
  </FeedbackMessage>
</template>
