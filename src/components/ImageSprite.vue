<script setup>
defineProps({
  src: { type: String, required: true },
  crop: { type: Array, required: true },
  label: { type: String, default: '' },
})
</script>

<template>
  <svg :viewBox="crop.join(' ')" :role="label ? 'img' : undefined" :aria-label="label || undefined" :aria-hidden="!label" class="image-sprite">
    <image :href="src" width="1536" height="1024" />
  </svg>
</template>

<style scoped>
.image-sprite { display: block; width: 100%; height: auto; overflow: hidden; }
</style>
