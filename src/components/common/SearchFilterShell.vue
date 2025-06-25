<template>
  <div class="search-filter-shell">
    <form @submit.prevent="emitSearch">
      <slot name="fields" :filters="filters" :expanded="props.showToggle ? isExpanded : true" />

      <div class="actions">
        <span v-if="props.showToggle" class="expand-btn" @click="toggleExpand">
          <span class="expand-text">{{ isExpanded ? '접기' : '더보기' }}</span>
          <svg 
            class="expand-icon" 
            :class="{ 'expanded': isExpanded }"
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M7 10L12 15L17 10" 
              stroke="currentColor" 
              stroke-width="2" 
              stroke-linecap="round" 
              stroke-linejoin="round"
            />
          </svg>
          <!-- 기존 버전 -->
        <!-- <div class="spacer"></div>
        <span v-if="props.showToggle"class="expand-btn" @click="emit('toggle-expand')">
          {{ expanded ? '접기 ▲' : '더보기 ▼' }} -->
        </span>

        <!-- 검색/초기화 버튼을 오른쪽으로 -->
        <div class="spacer"></div>
        <div class="button-group">
          <button type="submit" class="search-btn">검색</button>
          <button type="button" class="reset-btn" @click="emitReset">초기화</button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, defineEmits, defineProps, ref } from 'vue'

const emit = defineEmits(['search', 'reset', 'toggle-expand'])

const props = defineProps({
  initial: { type: Object, default: () => ({}) },
  expanded: { type: Boolean, default: false },
  showToggle: { type: Boolean, default: true } // 더보기 버튼 표시 여부
})

const filters = reactive({ ...props.initial })
const isExpanded = ref(props.expanded)

function emitSearch() {
  emit('search', { ...filters })
}

function emitReset() {
  Object.keys(filters).forEach(key => filters[key] = '')
  emit('reset')
}

function toggleExpand() {
  isExpanded.value = !isExpanded.value
  emit('toggle-expand', isExpanded.value)
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
  color: #333333;
  cursor: pointer;
  /* 버튼이 줄어들지 않도록 */
  flex-shrink: 0;
  white-space: nowrap;
  padding: 4px 8px;
  margin-left: 16px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.expand-btn:hover {
  background-color: #e0e0e0;
  color: #000000;
}

.expand-text {
  font-weight: 500;
}

.expand-icon {
  transition: transform 0.2s ease;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.button-group {
  display: flex;
  gap: 10px;
  /* 버튼 그룹이 줄어들지 않도록 */
  flex-shrink: 0;
  margin-right: 20px;
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
  background-color: #d5eb97;
  color: #2d5016;
  border: 1px solid #c3d977;
}
.search-btn:hover {
  background-color: #c3d977;
  color: #1e3a0f;
}

.reset-btn {
  background-color: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
}
.reset-btn:hover {
  background-color: #f7f9f0;
  color: #2d5016;
  border-color: #d5eb97;
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

/* 전역 input 스타일 - 모든 자식 컴포넌트에 적용 */
.search-filter-shell :deep(input),
.search-filter-shell :deep(select) {
  padding: 4px 8px;
  font-size: 13px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  vertical-align: middle;
  line-height: 1.5;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
  transition: border-color 0.2s ease;
}

.search-filter-shell :deep(input:focus),
.search-filter-shell :deep(select:focus) {
  outline: none;
  border-color: #d5eb97;
  box-shadow: 0 0 0 2px rgba(213, 235, 151, 0.2);
}

.search-filter-shell :deep(input::placeholder) {
  color: #999;
  font-size: 13px;
}

.search-filter-shell :deep(select) {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 8px center;
  background-repeat: no-repeat;
  background-size: 16px;
  padding-right: 32px;
}

/* 반응형 input 스타일 */
@media (max-width: 768px) {
  .search-filter-shell :deep(input),
  .search-filter-shell :deep(select) {
    font-size: 12px;
    padding: 3px 6px;
  }
  
  .search-filter-shell :deep(input::placeholder) {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .search-filter-shell :deep(input),
  .search-filter-shell :deep(select) {
    font-size: 11px;
    padding: 2px 4px;
  }
  
  .search-filter-shell :deep(input::placeholder) {
    font-size: 11px;
  }
}
</style>
