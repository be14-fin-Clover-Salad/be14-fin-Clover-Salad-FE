<template>
  <div class="employee-dept-list-outer">
    <div class="dept-info-row">
      <div v-if="departmentInfo.hasData" class="dept-info-box">
        <template v-if="departmentInfo.isUnassigned">
          <span class="lower-dept">미배정</span>
        </template>
        <template v-else>
          <span class="upper-dept">{{ departmentInfo.upper }}</span> / <span class="lower-dept">{{ departmentInfo.lower }}</span>
        </template>
      </div>
      <div v-if="!loading && !error && employees.length > 0" class="employee-count-box">
        <span class="text">총</span> <span class="count">{{ employees.length }}</span> <span class="text">명</span>
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
        <div v-else-if="employees.length === 0" class="no-data">
          선택된 부서의 직원이 없습니다.
        </div>
        <div v-else v-for="employee in employees" :key="employee.id" class="employee-card" @click="fetchEmployeeDetail(employee.id)">
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
import { ref, watch, computed } from 'vue';
import { useDepartmentStore } from '@/stores/departmentStore'
import axios from 'axios'

const departmentStore = useDepartmentStore()
const employees = ref([])
const loading = ref(false)
const error = ref(null)

const departmentInfo = computed(() => {
  try {
    const deptId = departmentStore.selectedDepartmentId
    if (!deptId || !departmentStore.departmentTree) {
      console.log('부서 ID 또는 부서 트리가 없습니다:', { deptId, tree: departmentStore.departmentTree })
      return { upper: '', lower: '', isUnassigned: false, hasData: false }
    }
    
    const deptInfo = departmentStore.findParentDepartment(deptId)
    console.log('찾은 부서 정보:', deptInfo)
    
    if (!deptInfo) {
      console.log('부서 정보를 찾을 수 없습니다')
      return { upper: '', lower: '', isUnassigned: false, hasData: false }
    }

    if (!deptInfo.parent) {
      return {
        upper: '',
        lower: '미배정',
        isUnassigned: true,
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
    console.error('부서 정보 처리 중 에러 발생:', error)
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
  loading.value = true
  error.value = null
  
  try {
    console.log('요청하는 부서 ID:', departmentId)
    const response = await axios.get(`http://localhost:8080/department/employee?departmentId=${departmentId}`)
    console.log('API 응답 데이터:', response.data)
    employees.value = response.data
  } catch (err) {
    console.error('API 요청 에러:', err)
    error.value = '직원 목록을 불러오는데 실패했습니다.'
  } finally {
    loading.value = false
  }
}

const emit = defineEmits(['select-employee'])

const fetchEmployeeDetail = async (employeeId) => {
  try {
    console.log('요청하는 사원 ID:', employeeId)
    const response = await axios.get(`http://localhost:8080/employee/detail?employeeId=${employeeId}`)
    console.log('사원 상세 정보 응답:', response.data)
    emit('select-employee', response.data)
  } catch (err) {
    console.error('사원 상세 정보 요청 에러:', err)
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


watch(() => departmentStore.selectedDepartmentId, (newId) => {
  console.log('선택된 부서 ID 변경:', newId)
  if (newId) {
    fetchEmployees(newId)
  }
})
</script>

<style scoped>
.employee-dept-list-outer {
  width: 434px;
  height: 583px;
  min-width: 434px;
  min-height: 583px;
  max-width: 434px;
  max-height: 583px;
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
}

.employee-img-box {
  width: 56px;
  height: 56px;
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
}

.employee-name-level {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
}

.employee-name-level .level {
  font-size: 15px;
  font-weight: 400;
  color: #666;
  margin-left: 6px;
}

.employee-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.employee-details p {
  margin: 0;
  font-size: 14px;
  color: #666;
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
</style> 