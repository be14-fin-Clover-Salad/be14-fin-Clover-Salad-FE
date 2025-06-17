<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <!-- 모달 헤더 -->
      <div class="modal-header">
        <div class="header-content">
          <h2 class="modal-title">
            <i class="icon-search"></i>
            직원 검색 결과
          </h2>
          <div class="search-info">
            총 <span class="highlight">{{ employees.length }}</span>명의 직원이 검색되었습니다
          </div>
        </div>
        <button class="close-btn" @click="closeModal">
          <i class="icon-close">×</i>
        </button>
      </div>

      <!-- 모달 바디 -->
      <div class="modal-body">
        <!-- 검색 필터 요약 -->
        <div v-if="searchSummary" class="search-summary">
          <span class="summary-label">검색 조건:</span>
          <div class="filter-cards">
            <div v-for="(value, key) in filteredSearchFilters" :key="key" class="filter-card">
              <span class="filter-label">{{ getFilterLabel(key) }}:</span>
              <span class="filter-value">{{ value }}</span>
              <button class="filter-remove" @click="removeFilter(key)">
                <i class="icon-close">×</i>
              </button>
            </div>
          </div>
        </div>

        <!-- 직원 목록 테이블 -->
        <div class="table-container">
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>검색 중...</p>
          </div>
          
          <div v-else-if="employees.length === 0" class="empty-state">
            <i class="icon-empty">📄</i>
            <p>검색 조건에 맞는 직원을 찾을 수 없습니다</p>
            <p class="empty-hint">다른 검색 조건을 시도해보세요</p>
          </div>

          <table v-else class="employee-table">
            <thead>
              <tr>
                <th>사번</th>
                <th>이름</th>
                <th>부서</th>
                <th>직급</th>
                <th>전화번호</th>
                <th>이메일</th>
                <th>입사일</th>
                <th>근무지</th>
              </tr>
            </thead>
          </table>
          <div class="table-body-container">
            <table class="employee-table">
              <tbody>
                <tr 
                  v-for="employee in employees" 
                  :key="employee.id || employee.employeeId || employee.empId || employee.code"
                  class="employee-row"
                  :class="{ 'row-selected': getEmployeeId(selectedEmployee) === getEmployeeId(employee) }"
                  @dblclick="selectEmployee(employee)"
                  @click="highlightRow($event, employee)"
                >
                  <td class="emp-code">{{ employee.code }}</td>
                  <td class="emp-name">
                    <div class="name-cell">
                      <div class="avatar">{{ getInitials(employee.name) }}</div>
                      <span>{{ employee.name }}</span>
                    </div>
                  </td>
                  <td>{{ employee.departmentName }}</td>
                  <td>
                    <span class="level-badge" :class="getLevelClass(employee.level)">
                      {{ employee.level }}
                    </span>
                  </td>
                  <td>{{ formatPhone(employee.phone) }}</td>
                  <td class="email-cell">{{ employee.email }}</td>
                  <td>{{ formatDate(employee.hireDate) }}</td>
                  <td>{{ employee.workPlace }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 모달 푸터 -->
      <div class="modal-footer">
        <div class="footer-info">
          <div v-if="selectedEmployee" class="selected-info">
            <i class="icon-user">👤</i>
            선택된 직원: <strong>{{ selectedEmployee.name }} ({{ selectedEmployee.code }})</strong>
          </div>
          <!-- <div v-else class="selection-guide">
            <i class="icon-info">ℹ️</i>
            직원을 클릭하여 선택하고 확인 버튼을 누르세요 (더블클릭 시 바로 확인)
          </div> -->
        </div>
        <div class="footer-actions">
          <button 
            class="btn-primary" 
            :disabled="!selectedEmployee"
            @click="confirmSelection"
          >
            확인
          </button>
          <button class="btn-secondary" @click="closeModal">닫기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props
const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  employees: {
    type: Array,
    default: () => []
  },
  searchFilters: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'select-employee', 'confirm-selection', 'update-filters'])

// 선택된 직원 상태
const selectedEmployee = ref(null)

// 필터링된 검색 조건
const filteredSearchFilters = computed(() => {
  const filters = props.searchFilters
  return Object.entries(filters)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .reduce((acc, [key, value]) => {
      acc[key] = value
      return acc
    }, {})
})

const searchSummary = computed(() => {
  return Object.keys(filteredSearchFilters.value).length > 0
})

// 필터 라벨 매핑
const filterLabels = {
  name: '이름',
  code: '사번',
  departmentName: '부서',
  level: '직급',
  workPlace: '근무지'
}

const getFilterLabel = (key) => {
  return filterLabels[key] || key
}

// 필터 제거 함수
const removeFilter = (key) => {
  const newFilters = { ...props.searchFilters }
  delete newFilters[key]
  emit('update-filters', newFilters)
}

// 메서드들
const closeModal = () => {
  emit('close')
}

const selectEmployee = (employee) => {
  selectedEmployee.value = employee
  // 더블클릭 시에는 바로 확인
  confirmSelection()
}

const confirmSelection = () => {
  if (!selectedEmployee.value) {
    alert('직원을 선택해주세요.')
    return
  }
  
  // 사번이 있는지 확인
  if (!selectedEmployee.value.code) {
    alert('직원 정보가 올바르지 않습니다.')
    return
  }
  
  emit('confirm-selection', selectedEmployee.value)
  closeModal()
}

const highlightRow = (event, employee) => {
  // 기존 하이라이트 제거
  document.querySelectorAll('.employee-row.selected').forEach(row => {
    row.classList.remove('selected')
  })
  // 새로운 하이라이트 추가
  event.currentTarget.classList.add('selected')
  // 선택된 직원 설정 (단일 클릭)
  selectedEmployee.value = employee
}

const getEmployeeId = (employee) => {
  if (!employee) return null
  // 사번을 우선적으로 사용 (더 안전)
  return employee.code || employee.id || employee.employeeId || employee.empId
}

const getInitials = (name) => {
  if (!name) return ''
  return name.charAt(0).toUpperCase()
}

const getLevelClass = (level) => {
  const levelMap = {
    '대표': 'level-ceo',
    '임원': 'level-executive',
    '부장': 'level-manager',
    '차장': 'level-deputy',
    '과장': 'level-supervisor',
    '대리': 'level-assistant',
    '주임': 'level-staff',
    '사원': 'level-employee'
  }
  return levelMap[level] || 'level-default'
}

const formatPhone = (phone) => {
  if (!phone) return ''
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ko-KR')
}

// ESC 키로 모달 닫기 및 선택 상태 초기화
watch(() => props.isVisible, (newValue) => {
  if (newValue) {
    document.addEventListener('keydown', handleEscKey)
    // 모달이 열릴 때 선택 상태 초기화
    selectedEmployee.value = null
  } else {
    document.removeEventListener('keydown', handleEscKey)
    // 모달이 닫힐 때도 선택 상태 초기화
    selectedEmployee.value = null
  }
})

const handleEscKey = (event) => {
  if (event.key === 'Escape') {
    closeModal()
  }
}
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  width: 90vw;
  max-width: 1200px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 모달 헤더 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(135deg, #4A6741 0%, #8BA888 100%);
  color: white;

  .header-content {
    flex: 1;
  }

  .modal-title {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 8px;

    .icon-search {
      font-size: 18px;
    }
  }

  .search-info {
    font-size: 14px;
    opacity: 0.9;

    .highlight {
      color: #ffd700;
      font-weight: 600;
    }
  }

  .close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    padding: 8px;
    border-radius: 6px;
    transition: background-color 0.2s;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
}

/* 모달 바디 */
.modal-body {
  flex: 1;
  padding: 20px 28px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.search-summary {
  background: #F8FDF2;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  border-left: 4px solid #4A6741;

  .summary-label {
    font-weight: 600;
    color: #495057;
    margin-bottom: 8px;
    display: block;
  }

  .filter-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .filter-card {
    background: white;
    padding: 6px 12px;
    border-radius: 16px;
    border: 1px solid #e9ecef;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s ease;

    &:hover {
      border-color: #4A6741;
      box-shadow: 0 2px 4px rgba(74, 103, 65, 0.1);
    }

    .filter-label {
      color: #6c757d;
      font-size: 12px;
    }

    .filter-value {
      color: #495057;
      font-weight: 500;
    }

    .filter-remove {
      background: none;
      border: none;
      color: #adb5bd;
      cursor: pointer;
      padding: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      width: 16px;
      height: 16px;
      font-size: 14px;
      transition: all 0.2s ease;

      &:hover {
        background: #f8f9fa;
        color: #dc3545;
      }
    }
  }
}

.table-container {
  flex: 1;
  overflow: hidden;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

/* 로딩 및 빈 상태 */
.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #6c757d;

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e9ecef;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  .icon-empty {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  p {
    margin: 4px 0;
    font-size: 16px;
  }

  .empty-hint {
    font-size: 14px;
    color: #adb5bd;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 테이블 스타일 */
.employee-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: white;

  th {
    background: #F8FDF2;
    color: #495057;
    font-weight: 600;
    padding: 16px 12px;
    text-align: left;
    border-bottom: 2px solid #e9ecef;
    font-size: 14px;
    white-space: nowrap;
    position: sticky;
    top: 0;
    z-index: 2;
  }

  td {
    padding: 14px 12px;
    border-bottom: 1px solid #e9ecef;
    font-size: 14px;
    vertical-align: middle;
  }
}

.table-body-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.employee-row {
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #F8FDF2;
  }

  &.selected,
  &.row-selected {
    background-color: #E8F0E5;
    border-left: 4px solid #4A6741;
  }

  &:active {
    background-color: #D5E0D0;
  }
}

.emp-code {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #495057;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 10px;

  .avatar {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #4A6741, #8BA888);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-weight: 600;
    font-size: 14px;
  }
}

.level-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;

  &.level-ceo { background: #e8f5e8; color: #2e7d32; }
  &.level-executive { background: #fff3e0; color: #f57c00; }
  &.level-manager { background: #e3f2fd; color: #1976d2; }
  &.level-deputy { background: #f3e5f5; color: #7b1fa2; }
  &.level-supervisor { background: #e0f2f1; color: #00695c; }
  &.level-assistant { background: #fff8e1; color: #ff8f00; }
  &.level-staff { background: #fce4ec; color: #c2185b; }
  &.level-employee { background: #f1f8e9; color: #558b2f; }
  &.level-default { background: #f5f5f5; color: #616161; }
}

.email-cell {
  color: #4A6741;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 모달 푸터 */
.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 28px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;

  .footer-info {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #6c757d;

    .icon-info, .icon-user {
      font-size: 16px;
    }

    .selected-info {
      color: #4A6741;
      font-weight: 500;

      strong {
        color: #495057;
      }
    }

    .selection-guide {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .footer-actions {
    display: flex;
    gap: 12px;
  }
}

/* 버튼 스타일 */
.btn-primary {
  padding: 10px 20px;
  background: #4A6741;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #3D5635;
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    background: #cbd5e0;
    color: #a0aec0;
    cursor: not-allowed;
    transform: none;
  }
}

.btn-secondary {
  padding: 10px 20px;
  background: #8BA888;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #7A9A77;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}

/* 반응형 */
@media (max-width: 768px) {
  .modal-container {
    width: 95vw;
    max-height: 90vh;
  }

  .modal-header {
    padding: 16px 20px;

    .modal-title {
      font-size: 18px;
    }
  }

  .modal-body {
    padding: 16px 20px;
  }

  .employee-table {
    th, td {
      padding: 10px 8px;
      font-size: 13px;
    }
  }

  .modal-footer {
    padding: 16px 20px;
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
}
</style>
