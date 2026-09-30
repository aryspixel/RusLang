<script setup>
import { computed, ref } from 'vue'
import SurfacePanel from '../../components/SurfacePanel.vue'
import TouchButton from '../../components/TouchButton.vue'
import FeedbackMessage from '../../components/FeedbackMessage.vue'
import { diagrams } from './data.js'
const selected = ref('hom')
const seen = ref(['hom'])
const started = ref(false)
const finished = ref(false)
const diagram = computed(() => diagrams.find(item=>item.id===selected.value))
function select(id) { selected.value=id; if(!seen.value.includes(id))seen.value.push(id) }
function restart() { selected.value='hom';seen.value=['hom'];finished.value=false;started.value=false }
</script>
<template>
  <div class="game-layout">
    <h1>Как подчиняются придаточные</h1>
    <p>Выбери вид подчинения. Прочитай правило и пример, затем проследи связи на схеме.</p>
    <SurfacePanel v-if="!started"><p>Стрелки показывают связи частей предложения. Рассмотри четыре вида подчинения.</p><TouchButton @click="started=true">Рассмотреть схемы</TouchButton></SurfacePanel>
    <SurfacePanel v-else-if="finished"><h2>Карточка изучена</h2><p>Просмотрено видов подчинения: {{ seen.length }} из 4. Эта карточка не выставляет оценку.</p><div class="action-row"><TouchButton @click="finished=false">Вернуться к схемам</TouchButton><TouchButton variant="secondary" @click="restart">Начать заново</TouchButton></div></SurfacePanel>
    <template v-else>
      <div class="action-row" role="group" aria-label="Вид подчинения"><TouchButton v-for="item in diagrams" :key="item.id" :variant="selected===item.id ? 'primary' : 'secondary'" :aria-pressed="selected===item.id" @click="select(item.id)">{{ item.title }}</TouchButton></div>
      <SurfacePanel>
        <h2>{{ diagram.title }} подчинение</h2><p>{{ diagram.description }}</p><p class="diagram-example"><strong>Пример:</strong> {{ diagram.example }}</p>
        <figure class="diagram" :aria-label="diagram.alternative">
          <SurfacePanel class="diagram-node"><span class="muted">{{ diagram.nodes[0].label }}</span><strong>{{ diagram.nodes[0].text }}</strong></SurfacePanel>
          <div v-if="selected==='seq'" class="diagram-chain"><template v-for="(node,index) in diagram.nodes.slice(1)" :key="node.label"><div class="diagram-edge" aria-hidden="true">{{ diagram.edges[index] }}</div><SurfacePanel class="diagram-node"><span class="muted">{{ node.label }}</span><strong>{{ node.text }}</strong></SurfacePanel></template></div>
          <div v-else class="diagram-fork"><div v-for="(node,index) in diagram.nodes.slice(1,3)" :key="node.label" class="diagram-lane"><div class="diagram-edge" aria-hidden="true">{{ diagram.edges[index] }}</div><SurfacePanel class="diagram-node"><span class="muted">{{ node.label }}</span><strong>{{ node.text }}</strong></SurfacePanel><template v-if="selected==='mix' && index===1"><div class="diagram-edge" aria-hidden="true">{{ diagram.edges[2] }}</div><SurfacePanel class="diagram-node"><span class="muted">{{ diagram.nodes[3].label }}</span><strong>{{ diagram.nodes[3].text }}</strong></SurfacePanel></template></div></div>
          <figcaption class="diagram-caption">{{ diagram.alternative }}.</figcaption>
        </figure>
        <FeedbackMessage title="Связь частей предложения">{{ diagram.description }}</FeedbackMessage><p class="diagram-progress">Просмотрено видов: {{ seen.length }} из 4.</p><div class="action-row"><TouchButton v-if="selected!==diagrams.at(-1).id" @click="select(diagrams[diagrams.findIndex(item=>item.id===selected)+1].id)">Следующий вид</TouchButton><TouchButton v-else @click="finished=true">Завершить просмотр</TouchButton></div>
      </SurfacePanel>
    </template>
  </div>
</template>
<style scoped>
.diagram { display:flex;flex-direction:column;align-items:center;gap:var(--space-2);margin:var(--space-3) 0 }
.diagram-node { display:grid;gap:var(--space-1);text-align:center;max-width:100%;width:100%;padding:var(--space-2) }
.diagram > .diagram-node { width:min(100%,650px) }
.diagram-fork { display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3);width:100% }
.diagram-lane,.diagram-chain { display:flex;flex-direction:column;align-items:center;gap:var(--space-2);min-width:0 }
.diagram-chain { width:min(100%,650px) }
.diagram-edge { font-weight:800;font-size:clamp(22px,1.6vw,30px) }
.diagram-example { font-size:clamp(22px,1.6vw,30px);margin:var(--space-3) 0 }
.diagram-caption { margin:var(--space-2) 0;align-self:stretch }
.diagram-progress { margin-top:var(--space-3) }
@media(max-width:600px) { .diagram-fork { grid-template-columns:1fr } }
</style>
