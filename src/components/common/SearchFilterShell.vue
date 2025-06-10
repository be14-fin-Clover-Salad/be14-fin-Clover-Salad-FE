<template>
  <div class="search-filter-shell">
    <form @submit.prevent="emitSearch">
      <slot name="fields" :filters="filters" />
      <div class="actions">
        <button type="submit" class="search-btn">검색</button>
        <button type="button" class="reset-btn" @click="emitReset">초기화</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, defineEmits, defineProps } from 'vue'

const emit = defineEmits(['search', 'reset'])
const props = defineProps({
  initial: { type: Object, default: () => ({}) }
})
const filters = reactive({ ...props.initial })

function emitSearch() {
  emit('search', { ...filters })
}
function emitReset() {
  Object.keys(filters).forEach(key => filters[key] = '')
  emit('reset')
}
</script>

<style scoped>
.search-filter-shell {
  padding: 16px;
  background: #f5f8f2; /* 톤다운된 연두톤 */
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  border: 1px solid #e0e4d8;
  margin-bottom: 24px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
}

.search-btn,
.reset-btn {
  padding: 7px 14px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.search-btn {
  background-color: #c3d977; /* 채도 낮춘 라임 */
  color: #222;
}
.search-btn:hover {
  background-color: #b3cc6a;
}

.reset-btn {
  background-color: #f1f1f1;
  color: #444;
}
.reset-btn:hover {
  background-color: #e4e4e4;
}
</style>
