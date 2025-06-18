<template>
  <div class="modal-backdrop" @click.self="close">
    <div class="modal-content">
      <h3>공지 대상자 선택</h3>
      <p class="selected-dept-label">현재 선택된 부서: {{ selectedDeptName }}</p>

      <div class="modal-body">
        <div class="tree-panel">
          <ul>
            <li>
              <div
                class="tree-item"
                :class="{ selected: selectedDeptId === null }"
                @click="selectedDeptId = null"
              >
                <span class="dept-name is-parent">전체</span>
              </div>
            </li>
            <TreeViewItem
              v-for="root in rootDepartments"
              :key="root.id"
              :dept="root"
              :departments="departments"
              :selected-dept-id="selectedDeptId"
              :is-top-level="true"
              @select="handleDeptSelect"
            />
          </ul>
        </div>
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
                {{ emp.name }} {{ emp.level }} ({{ getDeptName(emp.departmentId) }})
              </label>
            </li>
          </ul>
        </div>
        <div class="selected-panel">
          <h4>
            받는 사람 <span class="count">{{ selected.length }}</span>
          </h4>
          <ul>
            <li v-if="selected.length === 0" class="empty-selected">선택된 인원이 없습니다.</li>
            <li v-for="emp in selected" :key="emp.id">
              <span class="emp-info">
                {{ emp.name }} {{ emp.level }} ({{ getDeptName(emp.departmentId) }})
              </span>
              <span class="emp-remove" @click="remove(emp.id)">❌</span>
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
import { ref, computed, onMounted } from 'vue'
import TreeViewItem from '@/components/common/TreeViewItem.vue'

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

const emit = defineEmits(['update:selected', 'close'])

const selectedDeptId = ref(null)
const searchKeyword = ref('')
const selectedIds = ref([])

onMounted(() => {
  selectedIds.value = props.preselected
    .filter(e => String(e.employeeId || e.id) !== String(props.loginUserId))
    .map(e => e.employeeId || e.id)
})

const rootDepartments = computed(() =>
  props.departments.filter(d => d.supDeptId === null)
)

const handleDeptSelect = (deptId) => {
  selectedDeptId.value = deptId
}

const collectDeptIds = (id, depts) => {
  const children = depts.filter(d => d.supDeptId === id)
  return [id, ...children.flatMap(child => collectDeptIds(child.id, depts))]
}

const getDeptName = (deptId) => {
  const dept = props.departments.find(d => String(d.id) === String(deptId))
  return dept ? dept.name : ''
}

const selectedDeptName = computed(() => {
  if (selectedDeptId.value === null) return '전체'
  const dept = props.departments.find(d => String(d.id) === String(selectedDeptId.value))
  return dept ? dept.name : '-'
})

const selected = computed(() =>
  props.employees
    .filter(emp => emp.level !== '관리자')
    .filter(emp => String(emp.id) !== String(props.loginUserId))
    .filter(emp => selectedIds.value.includes(emp.id))
)

const filteredEmployees = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  const validEmployees = props.employees
    .filter(emp => emp.level !== '관리자')
    .filter(emp => String(emp.id) !== String(props.loginUserId))

  const deptIds = selectedDeptId.value === null
    ? null
    : collectDeptIds(selectedDeptId.value, props.departments)

  return validEmployees
    .filter(emp => !deptIds || deptIds.includes(Number(emp.departmentId)))
    .filter(emp => emp.name.toLowerCase().includes(keyword))
})

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
    .filter(emp => String(emp.id) !== String(props.loginUserId))
    .filter(emp => selectedIds.value.includes(emp.id))
  emit('update:selected', selectedEmps)
  close()
}
</script>

<style scoped>
.tree-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-bottom: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
  padding: 6px 8px;
  cursor: pointer;
}
.tree-item:hover {
  background-color: #f0f0f0;
}
.tree-item.selected {
  background-color: #e0f7ef;
  border-left: 4px solid #00a86b;
}
.dept-name {
  font-size: 1rem;
  font-weight: 400;
}
.dept-name.is-parent {
  font-size: 1.15rem;
  font-weight: 700;
}
.tree-panel li {
  padding: 0;
  margin-bottom: 4px;
}
.tree-panel ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
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
.employee-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.employee-list li label {
  display: block;
  padding: 4px 6px;
  transition: background-color 0.2s;
  border-radius: 4px;
}
.employee-list li label:hover {
  background-color: #f9f9f9;
}
.selected-dept-label {
  margin-top: -0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  color: #444;
}
.search-input {
  width: 95%;
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

.selected-panel h4 {
  margin: 0 0 1rem 0;
  padding: 0;
  font-size: 1.09rem;
  font-weight: 700;
  color: #222;
  display: flex;
  align-items: flex-end;
  gap: 6px;
}
.selected-panel .count {
  font-weight: bold;
  font-size: 1.05rem;
  margin-left: 3px;
  margin-bottom: 1px;
}
.selected-panel ul {
  padding-left: 0;
  margin-top: 0.1rem;
}
.selected-panel ul li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 0 2.5px 0;
  font-size: 1rem;
  gap: 0;
}
.selected-panel .emp-info {
  flex: 1;
  text-align: left;
  word-break: keep-all;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 0;
  padding-left: 0.5px;
}
.selected-panel .emp-remove {
  color: #e53935;
  cursor: pointer;
  font-size: 1.14rem;
  padding: 2px 11px 2px 10px;
  border-radius: 50%;
  line-height: 1;
  transition: background 0.13s, color 0.13s, transform 0.13s;
  margin-left: 8px;
}
.empty-selected {
  color: #888;
  font-size: 0.95rem;
  padding: 0.5rem 0;
}
.count {
  font-weight: bold;
  color: #00a86b;
}
</style>