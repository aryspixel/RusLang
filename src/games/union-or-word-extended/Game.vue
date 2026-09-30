<script setup>
import GrammarTrainer from '../../components/GrammarTrainer.vue'
import { modes, help } from './data.js'
</script>
<template><GrammarTrainer :modes="modes" :help="help" /></template>
