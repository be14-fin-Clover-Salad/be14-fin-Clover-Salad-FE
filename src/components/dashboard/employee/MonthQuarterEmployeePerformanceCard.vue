<template>
  <div class="performance-card">
    <h3>{{ title }}</h3>
    <div class="progress-bar">
      <div
        class="progress-fill"
        :style="{ width: progressPercent + '%', backgroundColor: isAchieved ? '#4caf50' : '#f44336' }"
      ></div>
    </div>
    <p>{{ displayActual }} / {{ displayTarget }} ({{ progressPercent.toFixed(1) }}%)</p>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  title: String,
  actual: [Number, Object],
  target: [Number, Object],
  achieved: Boolean,
})

const progressPercent = computed(() => {
  if (typeof props.actual === 'object' && typeof props.target === 'object') {
    const actualAvg = props.actual.count > 0 ? props.actual.score / props.actual.count : 0;
    const targetAvg = props.target.count > 0 ? props.target.score / props.target.count : 0;
    return targetAvg > 0 ? Math.min((actualAvg / targetAvg) * 100, 100) : 0;
  }

  if (!props.target) return 0;
  return Math.min((props.actual / props.target) * 100, 100);
});


const displayActual = computed(() => {
  if (typeof props.actual === 'object') {
    const { score, count } = props.actual;
    return count > 0 ? (score / count / 10).toFixed(1) : '-';
  }
  return props.actual;
});

const displayTarget = computed(() => {
  if (typeof props.target === 'object') {
    const { score, count } = props.target;
    return count > 0 ? (score / count / 10).toFixed(1) : '-';
  }
  return props.target;
});

const isAchieved = computed(() => {
  if (typeof props.actual === 'object' && typeof props.target === 'object') {
    const actualAvg = props.actual.count > 0 ? props.actual.score / props.actual.count : 0;
    const targetAvg = props.target.count > 0 ? props.target.score / props.target.count : 0;
    return actualAvg >= targetAvg;
  }
  return props.actual >= props.target;
});

</script>

<style scoped>
.performance-card {
  flex: 1 0 200px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.progress-bar {
  width: 100%;
  height: 10px;
  background-color: #eee;
  border-radius: 4px;
  overflow: hidden;
  margin: 8px 0;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}
</style>
