<script setup>
defineProps({ work: { type: Object, required: true } })
const fields = [['rule', 'Основное правило'], ['method', 'Порядок разбора'], ['trap', 'Частая ловушка'], ['example', 'Пример']]
</script>

<template>
  <details class="game-help">
    <summary>Памятка: {{ work.title }}</summary>
    <dl>
      <template v-for="[key, label] in fields" :key="key"><dt>{{ label }}</dt><dd>{{ work[key] }}</dd></template>
    </dl>
  </details>
</template>

<style scoped>
dt { font-weight: 750; margin-top: var(--space-2); }
dd { margin: var(--space-1) 0 0; }
</style>
