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
        <span class="expand-btn" @click="emit('toggle-expand')">
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
  expanded: { type: Boolean, default: false }
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
  background: #f7f8fa;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  border: 1px solid #e8eaed;
  margin-bottom: 24px;
  /* 반응형 처리를 위한 최소 너비 설정 */
  min-width: 0;
  overflow: hidden;
}

.actions {
  display: flex;
  align-items: center;
  margin-top: 12px;
  gap: 12px;
  /* 반응형 처리를 위한 flex-wrap 추가 */
  flex-wrap: wrap;
}

.spacer {
  flex: 1;
  /* 최소 너비 설정으로 버튼들이 압축되지 않도록 */
  min-width: 0;
}

.expand-btn {
  font-size: 13px;
  color: #1976d2;
  cursor: pointer;
  /* 버튼이 줄어들지 않도록 */
  flex-shrink: 0;
  white-space: nowrap;
}

.button-group {
  display: flex;
  gap: 10px;
  /* 버튼 그룹이 줄어들지 않도록 */
  flex-shrink: 0;
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
  /* 버튼 텍스트가 줄어들지 않도록 */
  white-space: nowrap;
  /* 최소 너비 설정 */
  min-width: 60px;
}

.search-btn {
  background-color: #c3d977;
  color: #1e3a0f;
  border: 1px solid #a6ce39;
}
.search-btn:hover {
  background-color: #a6ce39;
  color: white;
}

.reset-btn {
  background-color: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
}
.reset-btn:hover {
  background-color: #e9ecef;
  color: #495057;
}

/* 반응형 미디어 쿼리 */
@media (max-width: 768px) {
  .search-filter-shell {
    padding: 12px;
  }
  
  .actions {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .spacer {
    display: none;
  }
  
  .expand-btn {
    text-align: center;
    padding: 8px;
    background: #f0f0f0;
    border-radius: 4px;
  }
  
  .button-group {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .search-filter-shell {
    padding: 8px;
  }
  
  .button-group {
    flex-direction: column;
    gap: 8px;
  }
  
  .search-btn,
  .reset-btn {
    width: 100%;
  }
}
</style>
