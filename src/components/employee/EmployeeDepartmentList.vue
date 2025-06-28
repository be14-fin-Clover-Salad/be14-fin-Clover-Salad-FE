<template>
  <div class="employee-dept-list-outer">
    <div class="dept-info-row">
      <div v-if="departmentInfo.hasData" class="dept-info-box">
        <template v-if="departmentInfo.isUnassigned">
          <span class="lower-dept">미배정</span>
        </template>
        <template v-else-if="departmentInfo.upper">
          <span class="upper-dept">{{ departmentInfo.upper }}</span> / <span class="lower-dept">{{ departmentInfo.lower }}</span>
        </template>
        <template v-else>
          <span class="lower-dept">{{ departmentInfo.lower }}</span>
        </template>
      </div>
      <div v-if="!loading && !error && filteredEmployees.length > 0" class="employee-count-box">
        <span class="text">총</span> <span class="count">{{ filteredEmployees.length }}</span> <span class="text">명</span>
      </div>
    </div>
    <div
      class="employee-list"
      :class="{ 'scrolling': isScrolling }"
      ref="employeeListRef"
      @scroll="handleScroll"
    >
      <div class="employee-list-header">
      </div>
      <div class="employee-list-content">
        <div v-if="loading" class="loading">
          직원 목록을 불러오는 중...
        </div>
        <div v-else-if="error" class="error">
          {{ error }}
        </div>
        <div v-else-if="filteredEmployees.length === 0" class="no-data">
          선택된 부서의 직원이 없습니다.
        </div>
        <div v-else v-for="employee in filteredEmployees" :key="employee.id" class="employee-card" :class="{ 'selected': employee.id === props.selectedEmployeeId }" @click="fetchEmployeeDetail(employee.id)">
          <div class="employee-img-box">
            <img v-if="employee.path" :src="employee.path" alt="직원 사진" class="employee-img" />
            <div v-else class="employee-img">사진</div>
          </div>
          <div class="employee-info">
            <div class="employee-name-level">
              <span class="name">{{ employee.name }}</span>
              <span class="level">| {{ employee.level }}</span>
            </div>
            <div class="employee-details">
              <p>{{ formatPhoneNumber(employee.phone) }}</p>
              <p>{{ employee.email }}</p>
              <p>{{ employee.departmentName }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useDepartmentStore } from '@/stores/departmentStore'
import api from '@/api/auth'

const departmentStore = useDepartmentStore()
const employees = ref([])
const loading = ref(false)
const error = ref(null)

const departmentInfo = computed(() => {
  try {
    const deptId = departmentStore.selectedDepartmentId
    if (!deptId || !departmentStore.departmentTree) {
      return { upper: '', lower: '', isUnassigned: false, hasData: false }
    }
    
    const deptInfo = departmentStore.findParentDepartment(deptId)
    
    if (!deptInfo) {
      return { upper: '', lower: '', isUnassigned: false, hasData: false }
    }

    // 상위 부서가 없는 경우 (최상위 부서인 경우)
    if (!deptInfo.parent) {
      return {
        upper: '',
        lower: deptInfo.current?.name || '',
        isUnassigned: false,
        hasData: true
      }
    }
    
    return {
      upper: deptInfo.parent?.name || '',
      lower: deptInfo.current?.name || '',
      isUnassigned: false,
      hasData: true
    }
  } catch (error) {
    return { upper: '', lower: '', isUnassigned: false, hasData: false }
  }
})

const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return phone;
}

const fetchEmployees = async (departmentId) => {
  try {
    loading.value = true
    error.value = null
    
    const response = await api.get(`/department/employee?departmentId=${departmentId}`)
    employees.value = response.data
  } catch (error) {
    console.error('부서 직원 조회 실패:', error)
    error.value = '직원 목록을 불러오는데 실패했습니다.'
    employees.value = []
  } finally {
    loading.value = false
  }
}

const emit = defineEmits(['select-employee'])

const fetchEmployeeDetail = async (employeeId) => {
  try {
    const response = await api.get(`/employee/detail?employeeId=${employeeId}`)
    emit('select-employee', response.data)
  } catch (error) {
    console.error('직원 상세 조회 실패:', error)
  }
}

const isScrolling = ref(false);
const employeeListRef = ref(null);
let scrollTimeout = null;

function handleScroll() {
  isScrolling.value = true;
  if (scrollTimeout) clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    isScrolling.value = false;
  }, 1000);
}

const props = defineProps({
  selectedEmployeeId: {
    type: [String, Number],
    default: null
  }
})

// 관리자를 제외한 직원 목록
const filteredEmployees = computed(() => {
  return employees.value.filter(employee => employee.level !== '관리자')
})

watch(() => departmentStore.selectedDepartmentId, (newId) => {
  if (newId) {
    fetchEmployees(newId)
  }
})
</script>

<style scoped>
.employee-dept-list-outer {
  width: 100%;
  height: 100%;
  border-radius: 5px;
  border: 1px solid #F6F6F6;
  background: #fff;
  box-sizing: border-box;
  padding: 30px;
  display: flex;
  flex-direction: column;
}

.dept-info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.dept-info-box {
  background: #FAFAFA;
  border: 1px solid #E5E5E5;
  border-radius: 4px;
  padding: 12px 18px;
  font-size: 15px;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  min-height: 45px;
  min-width: 100px;
  width: fit-content;
  box-sizing: border-box;
}

.employee-count-box {
  font-size: 16px;
  font-weight: 600;
  margin-left: 16px;
  margin-right: 15px;
}

.employee-count-box .count {
  color: #B53B1B;
  font-weight: 700;
}

.employee-count-box .text {
  color: #333;
  font-weight: 600;
}

.upper-dept {
  font-weight: 500;
  color: #A3B13C;
  text-align: left;
}

.lower-dept {
  font-weight: 500;
  text-align: left;
}

.employee-list {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #e0e0e0 #fff;
}

.employee-list::-webkit-scrollbar {
  width: 8px;
  background: transparent;
}
.employee-list::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}
.employee-list.scrolling::-webkit-scrollbar-thumb {
  opacity: 1;
}

/* Firefox용 */
.employee-list {
  scrollbar-color: #e0e0e0 #fff;
}
.employee-list:not(.scrolling) {
  scrollbar-color: transparent #fff;
}

.employee-card {
  display: flex;
  align-items: flex-start;
  background: #fff;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  padding: 18px 20px;
  gap: 18px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

.employee-card:hover {
  background-color: #f8f8f8;
  border-color: #d5d5d5;
}

.employee-img-box {
  width: 56px;
  height: 56px;
  min-width: 56px;
  background: #F5F5F5;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.employee-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.employee-img:not(img) {
  color: #999;
  font-size: 15px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.employee-info {
  display: flex;
  flex-direction: column;
  gap: 7px;
  flex: 1;
  min-width: 0;
}

.employee-name-level {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.employee-name-level .name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.employee-name-level .level {
  font-size: 15px;
  font-weight: 400;
  color: #666;
  white-space: nowrap;
  flex-shrink: 0;
}

.employee-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.employee-details p {
  margin: 0;
  font-size: 14px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.loading, .error, .no-data {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error {
  color: #ff4d4f;
}

.employee-list-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.employee-card.selected {
  background-color: #d5eb97 !important;
  border-color: #c4d88a !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.employee-card.selected::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: #a3b13c;
  border-radius: 4px 0 0 4px;
}

/* 반응형 스타일 */
@media (max-width: 768px) {
  .employee-dept-list-outer {
    padding: 20px;
  }

  .employee-card {
    padding: 12px 15px;
    gap: 12px;
  }

  .employee-img-box {
    width: 48px;
    height: 48px;
    min-width: 48px;
  }

  .employee-name-level {
    font-size: 14px;
  }

  .employee-name-level .level {
    font-size: 13px;
  }

  .employee-details p {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .employee-dept-list-outer {
    padding: 15px;
  }

  .employee-card {
    padding: 10px;
    gap: 10px;
  }

  .employee-img-box {
    width: 40px;
    height: 40px;
    min-width: 40px;
  }
}
</style> 