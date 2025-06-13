<template>
  <div class="employee-page">
    <!-- 1. 상단 검색창 영역 -->
    <div class="search-bar-area">
      <SearchFilterShell :initial="searchForm" @search="handleSearch" @reset="handleReset">
        <template #fields="{ filters }">
          <EmployeeSearchFields :filters="filters" />
        </template>
      </SearchFilterShell>
    </div>
    <div class="main-content">
      <!-- 2. 좌측 부서/팀 트리 영역 -->
      <div class="sidebar">
        <div v-if="tree.length" class="tree-outer-border">
          <DepartmentTreeNode
            v-for="dept in tree"
            :key="dept.id"
            :node="dept"
            :opened-path="openedPath"
            :on-toggle="handleToggle"
          />
        </div>
      </div>
      <!-- 3. 중앙 직원 리스트 영역 -->
      <div class="employee-list-area">
        <EmployeeDepartmentList @select-employee="handleSelectEmployee" />
      </div>
      <!-- 4. 우측 직원 상세 정보 영역 -->
      <div class="employee-detail-area">
        <EmployeeDetail :employee="selectedEmployee" />
      </div>
    </div>
  </div>
</template>

<script setup>
import SearchFilterShell from '@/components/common/SearchFilterShell.vue'
import EmployeeSearchFields from '@/components/employee/EmployeeSearchFields.vue'
import EmployeeDepartmentList from '@/components/employee/EmployeeDepartmentList.vue'
import EmployeeDetail from '@/components/employee/EmployeeDetail.vue'
import { reactive, ref, onMounted, onBeforeUnmount } from 'vue'
import api from '@/api/auth'
import DepartmentTreeNode from '@/components/employee/DepartmentTreeNode.vue'
import { useDepartmentStore } from '@/stores/departmentStore'

const departmentStore = useDepartmentStore()
const selectedEmployee = ref(null)

const searchForm = reactive({
  code: '',
  name: '',
  phone: '',
  email: '',
  level: '',
  hireDateFrom: '',
  hireDateTo: '',
  workPlace: '',
  departmentName: ''
})

const tree = ref([])
const openedPath = ref([])

function buildTree(list, parent = null) {
  const map = {}
  list.forEach(item => map[item.id] = { ...item, children: [], parent: null })
  const roots = []
  list.forEach(item => {
    if (item.supDeptId) {
      map[item.id].parent = map[item.supDeptId]
      map[item.supDeptId].children.push(map[item.id])
    } else {
      roots.push(map[item.id])
    }
  })
  return roots
}

onMounted(async () => {
  try {
    const res = await api.get('/department/hierarchy')
    const treeData = buildTree(res.data)
    tree.value = treeData
    departmentStore.setDepartmentTree(treeData)
    console.log('부서 트리 데이터 로드 완료:', treeData)
  } catch (error) {
    console.error('부서 트리 데이터 로드 실패:', error)
  }
})

function getPathToRoot(node) {
  const path = []
  let cur = node
  while (cur) {
    path.push(cur)
    cur = cur.parent
  }
  path.reverse()
  return path.map(n => n.id)
}

function handleToggle(node) {
  const path = getPathToRoot(node)
  const idx = openedPath.value.indexOf(node.id)
  
  if (idx !== -1) {
    if (idx === openedPath.value.length - 1) {
      openedPath.value = openedPath.value.slice(0, -1)
    } else {
      openedPath.value = openedPath.value.slice(0, idx + 1)
    }
  } else {
    openedPath.value = path
  }
}

function handleSearch(filters) {
  api.post('/employee/search', {
    code: filters.code,
    name: filters.name,
    phone: filters.phone,
    email: filters.email,
    level: filters.level,
    hireDateFrom: filters.hireDateFrom,
    hireDateTo: filters.hireDateTo,
    workPlace: filters.workPlace,
    departmentName: filters.departmentName
  })
    .then(res => {
      console.log('검색 결과:', res.data)
    })
    .catch(err => {
      console.error('검색 오류:', err)
    })
}
function handleReset() {
}

const handleSelectEmployee = (employee) => {
  console.log('선택된 사원 정보:', employee)
  selectedEmployee.value = employee
}

onBeforeUnmount(() => {
  departmentStore.setSelectedDepartment(null)
})
</script>

<script>
export default {};
</script>

<style lang="scss" scoped>
.employee-search-fields {
  background-color: #f8fdf2;
  padding: 16px 24px;
  border-radius: 8px;
  margin-bottom: 12px;
}
.row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 10px;
}
.row:last-child {
  grid-template-columns: repeat(4, 1fr);
}
.field {
  display: flex;
  flex-direction: column;
}
.field label {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 2px;
  color: #333;
}
.field input {
  padding: 4px 8px;
  font-size: 13px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.tree-outer-border {
  border-radius: 5px;
  border: 1px solid #F6F6F6;
  padding: 30px;
  background: #fff;
  width: 349px;
  height: 583px;
  box-sizing: border-box;
  overflow-y: auto;
}
.main-content {
  display: flex;
  justify-content: center;
  align-items: stretch;
  height: calc(100vh - 120px);
}
.sidebar {
  width: 349px;
  flex-shrink: 0;
}
.employee-list-area {
  flex: 1;
  min-width: 0;
  display: flex;
  justify-content: center;
}
.employee-detail-area {
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
  overflow-y: auto;
}
</style>