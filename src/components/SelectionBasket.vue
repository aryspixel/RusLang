<script setup>
import TouchButton from './TouchButton.vue'
defineProps({ products: { type: Array, required: true }, selected: { type: Array, required: true }, disabled: Boolean })
const emit = defineEmits(['add', 'remove'])
</script>
<template>
 <div class="selection-basket">
  <div class="product-grid" role="group" aria-label="Покупки"><button v-for="p in products" :key="p.id" class="choice-group__option product-card" :data-product="p.id" :disabled="disabled || selected.includes(p.id)" @click="emit('add',p.id)"><span class="product-emoji" aria-hidden="true">{{ p.emoji }}</span>{{ p.label }}<span v-if="selected.includes(p.id)"> ✓</span></button></div>
  <div class="ali-basket"><h3>🛒 Корзина</h3><p v-if="!selected.length">Пока пусто</p><div v-else class="basket-products"><TouchButton v-for="id in selected" :key="id" variant="secondary" :data-basket-product="id" :disabled="disabled" :aria-label="`Удалить из корзины: ${products.find(p=>p.id===id)?.label}`" @click="emit('remove',id)">{{ products.find(p=>p.id===id)?.emoji }} {{ products.find(p=>p.id===id)?.label }} ✕</TouchButton></div></div>
 </div>
</template>
<style scoped>
.product-grid { display: grid; grid-template-columns: repeat(6,minmax(0,1fr)); gap: 12px; margin: 16px 0; }
.product-card { min-width: 0; text-align: center; padding: 8px; font-size: 18px; }.product-emoji { display: block; font-size: 35px; white-space: nowrap; }
.ali-basket { padding: 16px; border: 3px dashed var(--color-border); border-radius: var(--radius-control); }.basket-products { display: flex; flex-wrap: wrap; gap: 10px; }.basket-products .touch-button { min-width: 0; padding: 10px 12px; }
@media(max-width:1099px) { .product-grid { grid-template-columns: repeat(4,minmax(0,1fr)); } }
@media(max-width:599px) { .product-grid { grid-template-columns: repeat(2,minmax(0,1fr)); } }
</style>
