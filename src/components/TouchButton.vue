<script setup>
defineProps({
  variant: { type: String, default: 'primary' },
  type: { type: String, default: 'button' },
})
</script>

<template>
  <button class="touch-button" :class="`touch-button--${variant}`" :type="type">
    <slot />
  </button>
</template>
