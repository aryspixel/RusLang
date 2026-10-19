<script setup>
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import WorkPassport from './WorkPassport.vue'
import DATA from './data.json'
defineProps({ item: { type: Object, required: true } })
const works = new Map(DATA.works.map(work => [work.id, work]))
</script>

<template>
  <FeedbackMessage :kind="item.selected === 0 ? 'success' : 'error'" :title="item.selected === null ? 'Ответ пропущен' : item.selected === 0 ? 'Верно. Закрепим связь.' : 'Есть ошибка. Разберём её.'">
    <p><strong>Правильный ответ:</strong> {{ item.q.choices[0].text }}</p>
    <p>{{ item.q.explanation }}</p>
    <template v-if="item.selected !== null && item.selected !== 0 && item.q.kind === 'plot'">
      <h3>С чем перепутали</h3>
      <p>В произведении «{{ works.get(item.q.choices[item.selected].work).title }}»: {{ works.get(item.q.choices[item.selected].work).plot }} Сопоставьте эту ситуацию с описанием в вопросе.</p>
    </template>
    <h3>Как рассуждать</h3><p>{{ item.q.method }}</p>
    <WorkPassport :work="works.get(item.q.work)" />
  </FeedbackMessage>
</template>
