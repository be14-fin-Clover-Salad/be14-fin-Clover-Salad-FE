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
        <EmployeeDepartmentList />
      </div>
      <!-- 4. 우측 직원 상세 정보 영역 -->
      <div class="employee-detail-area">
        <!-- 직원 상세 정보 컴포넌트 자리 -->
      </div>
    </div>
  </div>
</template>

<script setup>
import SearchFilterShell from '@/components/common/SearchFilterShell.vue'
import EmployeeSearchFields from '@/components/employee/EmployeeSearchFields.vue'
import EmployeeDepartmentList from '@/components/employee/EmployeeDepartmentList.vue'
import { reactive, ref, onMounted } from 'vue'
import api from '@/api/auth'
import DepartmentTreeNode from '@/components/employee/DepartmentTreeNode.vue'

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
  const res = await api.get('/department/hierarchy')
  tree.value = buildTree(res.data)
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
    // 현재 노드가 이미 열려있는 경우
    if (idx === openedPath.value.length - 1) {
      // 현재 노드가 마지막 노드인 경우, 현재 노드만 닫음
      openedPath.value = openedPath.value.slice(0, -1)
    } else {
      // 현재 노드가 중간에 있는 경우, 현재 노드까지만 유지
      openedPath.value = openedPath.value.slice(0, idx + 1)
    }
  } else {
    // 현재 노드가 닫혀있는 경우, 경로에 추가
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
      // TODO: 결과를 리스트에 반영
    })
    .catch(err => {
      console.error('검색 오류:', err)
    })
}
function handleReset() {
  // TODO: 초기화 시 추가 동작 필요시 구현
}
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
.employee-list-area {
  flex: 1;
  margin: 0 20px;
}
</style>