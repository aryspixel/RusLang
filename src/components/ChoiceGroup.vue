<script setup>
defineProps({
  options: { type: Array, required: true },
  selected: { type: [String, Number, Array], default: null },
  disabled: { type: Boolean, default: false },
  label: { type: String, required: true },
})
const emit = defineEmits(['select'])
</script>

<template>
  <div class="choice-group" role="group" :aria-label="label">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="choice-group__option"
      :class="{ 'choice-group__option--selected': Array.isArray(selected) ? selected.includes(option.value) : selected === option.value }"
      :aria-pressed="Array.isArray(selected) ? selected.includes(option.value) : selected === option.value"
      :disabled="disabled"
      @click="emit('select', option.value)"
    >{{ option.label }}</button>
  </div>
</template>
