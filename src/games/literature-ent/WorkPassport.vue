<script setup>
defineProps({ work: { type: Object, required: true } })
const fields = [['heroes', 'Герои и образы'], ['plot', 'Содержание / движение переживания'], ['meaning', 'Тема и идея'], ['detail', 'Что запомнить'], ['question', 'Вопрос для устного повторения']]
</script>

<template>
  <details class="game-help">
    <summary>Паспорт: {{ work.title }}</summary>
    <dl>
      <dt>Автор · жанр</dt><dd>{{ work.author }} · {{ work.genre }}</dd>
      <template v-for="[key, label] in fields" :key="key"><dt>{{ label }}</dt><dd>{{ work[key] }}</dd></template>
    </dl>
  </details>
</template>

<style scoped>
dt { font-weight: 750; margin-top: var(--space-2); }
dd { margin: var(--space-1) 0 0; }
</style>
