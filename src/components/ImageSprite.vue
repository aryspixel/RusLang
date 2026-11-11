<script setup>
defineProps({
  src: { type: String, required: true },
  crop: { type: Array, required: true },
  imageSize: { type: Array, default: () => [1536, 1024] },
  label: { type: String, default: '' },
})
</script>

<template>
  <svg :viewBox="crop.join(' ')" :role="label ? 'img' : undefined" :aria-label="label || undefined" :aria-hidden="!label" class="image-sprite">
    <image :href="src" :width="imageSize[0]" :height="imageSize[1]" />
  </svg>
</template>

<style scoped>
.image-sprite { display: block; width: 100%; height: auto; overflow: hidden; }
</style>
