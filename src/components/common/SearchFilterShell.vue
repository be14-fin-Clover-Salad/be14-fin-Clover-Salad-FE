<template>
  <div class="search-filter-shell">
    <form @submit.prevent="emitSearch">
      <slot name="fields" :filters="filters" :expanded="expanded" />

      <div class="actions">
        <!-- 가운데 더보기 버튼 -->
        <!-- 
        더보기 버튼 검색 필드가 많아 접기 기능이 필요한 경우에만 사용
        기본적으로 항상 표시. 필요없는 경우 v-if 등의 조건 처리로 감추기
        사용 예시 : 
        <SearchFilterShell
        :initial="searchForm"
        :showToggle="true"
        ...
        />
        -->
        <div class="spacer"></div>
        <span v-if="props.showToggle"class="expand-btn" @click="emit('toggle-expand')">
          {{ expanded ? '접기 ▲' : '더보기 ▼' }}
        </span>

        <!-- 검색/초기화 버튼 -->
        <div class="button-group">
          <button type="submit" class="search-btn">검색</button>
          <button type="button" class="reset-btn" @click="emitReset">초기화</button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, defineEmits, defineProps } from 'vue'

const emit = defineEmits(['search', 'reset', 'toggle-expand'])

const props = defineProps({
  initial: { type: Object, default: () => ({}) },
  expanded: { type: Boolean, default: false },
  showToggle: { type: Boolean, default: true } // 더보기 버튼 표시 여부
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
  background: #f5f8f2;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  border: 1px solid #e0e4d8;
  margin-bottom: 24px;
}

.actions {
  display: flex;
  align-items: center;
  margin-top: 12px;
  gap: 12px;
}

.spacer {
  flex: 1;
}

.expand-btn {
  font-size: 13px;
  color: #1976d2;
  cursor: pointer;
}

.button-group {
  display: flex;
  gap: 10px;
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
  background-color: #c3d977;
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
