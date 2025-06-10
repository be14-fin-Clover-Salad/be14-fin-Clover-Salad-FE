<template>
  <div class="search-filter-shell">
    <form @submit.prevent="emitSearch">
      <slot name="fields" :filters="filters" />
      <div class="actions">
        <div class="left-actions">
          <slot name="leftActions" />
        </div>
        <div class="right-actions">
          <button type="submit" class="search-btn">검색</button>
          <button type="button" class="reset-btn" @click="emitReset">초기화</button>
        </div>
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
  background: #fafff0;
  border-radius: 8px;
}
.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}

.left-actions {
  display: flex;
  gap: 8px;
}

.right-actions {
  display: flex;
  gap: 8px;
}
.search-btn,
.reset-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: bold;
  border: none;
  cursor: pointer;
}
.search-btn {
  background-color: #cbe86b;
  color: #1a1a1a;
}
.reset-btn {
  background-color: #eee;
}
</style>
