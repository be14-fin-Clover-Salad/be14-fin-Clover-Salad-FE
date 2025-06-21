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

    <!-- 직원 검색 결과 모달 -->
    <EmployeeSearchResult 
      :is-visible="showSearchModal"
      :employees="searchResults"
      :search-filters="searchFilters"
      :loading="searchLoading"
      @close="closeSearchModal"
      @confirm-selection="handleConfirmEmployeeSelection"
      @update-filters="handleUpdateFilters"
    />
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
        <EmployeeDepartmentList 
          @select-employee="handleSelectEmployee" 
          :selected-employee-id="selectedEmployee?.id"
        />
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
import EmployeeSearchResult from '@/components/employee/EmployeeSearchResult.vue'
import { reactive, ref, onMounted, onBeforeUnmount } from 'vue'
import api from '@/api/auth'
import DepartmentTreeNode from '@/components/employee/DepartmentTreeNode.vue'
import { useDepartmentStore } from '@/stores/departmentStore'

const departmentStore = useDepartmentStore()
const selectedEmployee = ref(null)

// 검색 관련 상태
const showSearchModal = ref(false)
const searchResults = ref([])
const searchFilters = ref({})
const searchLoading = ref(false)

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
  // 검색 필터 저장
  searchFilters.value = { ...filters }
  searchLoading.value = true
  showSearchModal.value = true

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
      // 관리자를 제외한 검색 결과 필터링
      searchResults.value = (res.data || []).filter(employee => employee.level !== '관리자')
    })
    .catch(err => {
      searchResults.value = []
      alert('검색 중 오류가 발생했습니다.')
    })
    .finally(() => {
      searchLoading.value = false
    })
}

const handleSelectEmployee = (employee) => {
  selectedEmployee.value = employee
}

// 모달에서 직원 확인 선택 시 처리
const handleConfirmEmployeeSelection = async (employee) => {
  
  // 검색 결과에서 받은 id 사용
  const employeeId = employee.id
  if (!employeeId) {
    return
  }

  try {
    // 직원 상세 정보 조회
    const response = await api.get(`/employee/detail?employeeId=${employeeId}`)
    const employeeDetail = response.data

    if (!employeeDetail) {
      console.error('직원 상세 정보를 찾을 수 없습니다')
      return
    }

    // 검색된 직원 정보로 상태 업데이트
    selectedEmployee.value = employeeDetail
    showSearchModal.value = false
    
    // 직원의 부서 정보도 가져오기 (부서 트리 확장을 위해)
    let departmentInfo = null
    
    // departmentId가 있으면 직접 사용, 없으면 departmentName으로 찾기
    let departmentId = employeeDetail.departmentId || employeeDetail.deptId
    
    if (!departmentId && employeeDetail.departmentName) {
      // 부서명으로 부서 ID 찾기
      departmentId = findDepartmentIdByName(employeeDetail.departmentName)
    }
    
    if (departmentId) {
      try {
        // 부서 계층 정보 조회
        const hierarchyResponse = await api.get('/department/hierarchy')
        const hierarchy = hierarchyResponse.data
        
        // 부서 정보 찾기
        departmentInfo = findDepartmentInHierarchy(hierarchy, departmentId)
        
        if (departmentInfo) {
          // 부서 트리에서 해당 부서로 확장 및 부서 선택
          const pathToDepartment = getDepartmentPath(departmentInfo.id)
          if (pathToDepartment.length > 0) {
            openedPath.value = pathToDepartment
          }
          // 부서 스토어에 선택된 부서 설정
          departmentStore.setSelectedDepartment(departmentInfo.id)
        }
      } catch (deptError) {
        console.error('부서 정보 조회 실패:', deptError)
      }
    }
    
  } catch (error) {
    console.error('직원 상세 정보 조회 중 오류 발생:', error)
    alert('직원 정보를 가져오는데 실패했습니다.')
  }
}

// 부서 계층에서 특정 ID의 부서 찾기
const findDepartmentInHierarchy = (hierarchy, targetId) => {
  for (const dept of hierarchy) {
    if (dept.id === targetId) {
      return dept
    }
    if (dept.children) {
      const found = findDepartmentInHierarchy(dept.children, targetId)
      if (found) return found
    }
  }
  return null
}

// 부서 ID로부터 루트까지의 경로를 구하는 함수
const getDepartmentPath = (departmentId) => {
  const findDepartmentInTree = (nodes, targetId, path = []) => {
    for (const node of nodes) {
      const currentPath = [...path, node.id]
      if (node.id === targetId) {
        return currentPath
      }
      if (node.children && node.children.length > 0) {
        const childPath = findDepartmentInTree(node.children, targetId, currentPath)
        if (childPath) {
          return childPath
        }
      }
    }
    return null
  }
  
  return findDepartmentInTree(tree.value, departmentId) || []
}

// 부서명으로 부서 ID를 찾는 함수
const findDepartmentIdByName = (departmentName) => {
  const searchInTree = (nodes, targetName) => {
    for (const node of nodes) {
      if (node.name === targetName) {
        return node.id
      }
      if (node.children && node.children.length > 0) {
        const foundId = searchInTree(node.children, targetName)
        if (foundId) {
          return foundId
        }
      }
    }
    return null
  }
  
  return searchInTree(tree.value, departmentName)
}

// 검색 모달 닫기
const closeSearchModal = () => {
  showSearchModal.value = false
}

// 검색 리셋 처리
function handleReset() {
  searchResults.value = []
  searchFilters.value = {}
  showSearchModal.value = false
}

// 필터 업데이트 처리
const handleUpdateFilters = (newFilters) => {
  searchFilters.value = newFilters
  // 필터가 업데이트되면 검색 실행
  handleSearch(newFilters)
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