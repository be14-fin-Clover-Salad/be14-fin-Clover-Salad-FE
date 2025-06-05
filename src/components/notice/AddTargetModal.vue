<template>
  <div class="modal-backdrop" @click.self="close">
    <div class="modal-content">
      <h3>공지 대상자 선택</h3>
      <p class="selected-dept-label">현재 선택된 부서: {{ selectedDeptName }}</p>

      <div class="modal-body">
        <!-- 좌측: 부서 트리 -->
        <div class="tree-panel">
          <ul>
            <li
              :class="{ selected: selectedDeptId === null }"
              @click="selectedDeptId = null"
            >
              전체
            </li>
            <li
              v-for="dept in departments"
              :key="dept.id"
              :class="{ selected: isSelectedDept(dept.id) }"
              @click="selectedDeptId = Number(dept.id)"
            >
              {{ dept.name }}
            </li>
          </ul>
        </div>

        <!-- 중앙: 직원 목록 -->
        <div class="employee-panel">
          <input
            type="text"
            v-model="searchKeyword"
            placeholder="이름 검색"
            class="search-input"
          />

          <div style="margin-bottom: 8px;">
            <label>
              <input
                type="checkbox"
                :checked="isDeptAllChecked"
                @change="toggleDeptAll"
              />
              전체 선택
            </label>
          </div>

          <ul class="employee-list">
            <li v-for="emp in filteredEmployees" :key="emp.id">
              <label>
                <input
                  type="checkbox"
                  :value="emp.id"
                  :checked="selectedIds.includes(emp.id)"
                  @change="toggleSelect(emp.id)"
                />
                {{ emp.name }} {{ emp.level }} ({{ getDeptName(emp.department_id) }})
              </label>
            </li>
          </ul>
        </div>

        <!-- 우측: 선택된 대상자 -->
        <div class="selected-panel">
          <h4>받는 사람 {{ selected.length }}</h4>
          <ul>
            <li v-for="emp in selected" :key="emp.id">
              {{ emp.name }} {{ emp.level }} ({{ getDeptName(emp.department_id) }})
              <span @click="remove(emp.id)">✕</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="modal-footer">
        <button class="cancel-btn" @click="close">취소</button>
        <button class="confirm-btn" @click="confirm">확인</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  departments: Array,
  employees: Array,
  preselected: {
    type: Array,
    default: () => []
  },
  loginUserId: {
    type: [Number, String],
    required: true
  }
})

console.log('👤 props.loginUserId:', props.loginUserId)

const emit = defineEmits(['update:selected', 'close'])

const selectedDeptId = ref(null)
const searchKeyword = ref('')
const selectedIds = ref(
  props.preselected
    .filter(e => Number(e.id) !== Number(props.loginUserId))
    .map(e => e.id)
)

watch(
  () => props.preselected,
  (newVal) => {
    selectedIds.value = newVal
      .filter(e => Number(e.id) !== Number(props.loginUserId))
      .map(e => e.id)
  },
  { immediate: true }
)

const getDeptName = (deptId) => {
  const dept = props.departments.find(d => Number(d.id) === Number(deptId))
  return dept ? dept.name : ''
}

const selectedDeptName = computed(() => {
  if (selectedDeptId.value === null) return '전체'
  const dept = props.departments.find(d => Number(d.id) === Number(selectedDeptId.value))
  return dept ? dept.name : '-'
})

const isSelectedDept = (id) => {
  return Number(selectedDeptId.value) === Number(id)
}

const selected = computed(() =>
  props.employees
    .filter(emp => emp.level !== '관리자')
    .filter(emp => Number(emp.id) !== Number(props.loginUserId))
    .filter(emp => selectedIds.value.includes(emp.id))
)

const filteredEmployees = computed(() =>
  props.employees
    .filter(emp => emp.level !== '관리자')
    .filter(emp => Number(emp.id) !== Number(props.loginUserId))
    .filter(emp => selectedDeptId.value === null || Number(emp.department_id) === Number(selectedDeptId.value))
    .filter(emp => emp.name.toLowerCase().includes(searchKeyword.value.trim().toLowerCase()))
)

const toggleSelect = (empId) => {
  if (selectedIds.value.includes(empId)) {
    selectedIds.value = selectedIds.value.filter(id => id !== empId)
  } else {
    selectedIds.value.push(empId)
  }
}

const isDeptAllChecked = computed(() =>
  filteredEmployees.value.length > 0 &&
  filteredEmployees.value.every(emp => selectedIds.value.includes(emp.id))
)

const toggleDeptAll = (event) => {
  const ids = filteredEmployees.value.map(emp => emp.id)
  if (event.target.checked) {
    selectedIds.value = Array.from(new Set([...selectedIds.value, ...ids]))
  } else {
    selectedIds.value = selectedIds.value.filter(id => !ids.includes(id))
  }
}

const remove = (empId) => {
  selectedIds.value = selectedIds.value.filter(id => id !== empId)
}

const close = () => emit('close')

const confirm = () => {
  const selectedEmps = props.employees
    .filter(emp => emp.level !== '관리자')
    .filter(emp => Number(emp.id) !== Number(props.loginUserId))
    .filter(emp => selectedIds.value.includes(emp.id))
  emit('update:selected', selectedEmps)
  close()
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}
.modal-content {
  background: white;
  width: 1000px;
  max-width: 90%;
  border-radius: 8px;
  padding: 1.5rem;
}
.modal-body {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
}
.tree-panel,
.employee-panel,
.selected-panel {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 1rem;
  height: 400px;
  overflow-y: auto;
}
.tree-panel ul,
.employee-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.tree-panel li {
  padding: 6px 10px;
  border-radius: 4px;
  margin-bottom: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.tree-panel li:hover {
  background-color: #f0f0f0;
}
.tree-panel li.selected {
  background-color: #e0f7ef;
  border-left: 4px solid #00a86b;
  font-weight: 600;
  color: #007a5c;
}
.selected-dept-label {
  margin-top: -0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  color: #444;
}
.search-input {
  width: 90%;
  margin-bottom: 0.5rem;
  padding: 0.4rem;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
  gap: 1rem;
}
.cancel-btn,
.confirm-btn {
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-size: 1rem;
  border: none;
  cursor: pointer;
}
.cancel-btn {
  background-color: #ccc;
  color: #333;
}
.confirm-btn {
  background-color: #00a86b;
  color: white;
}
.selected-panel span {
  margin-left: 8px;
  color: red;
  cursor: pointer;
}
</style>
