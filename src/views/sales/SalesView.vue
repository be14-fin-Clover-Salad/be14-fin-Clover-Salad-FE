<template>
  <section>
    <SearchFilterShell :initial="searchForm" @search="handleSearch" @reset="handleReset">
      <template #fields="{ filters }">
        <div class="sales-search-fields">
          <div class="row-first">
            <div class="field">
              <label>부서명</label>
              <input v-model="filters.department" type="text" placeholder="예: 영업부" />
            </div>
            <div class="field">
              <label>직원명</label>
              <input v-model="filters.employeeName" type="text" placeholder="예: 김영업" />
            </div>
            <div class="field">
              <label>계약 코드</label>
              <input v-model="filters.contractCode" type="text" placeholder="예: C-20240101" />
            </div>
          </div>
          <div class="row-second">
            <div class="field">
              <label>매출 날짜 (시작)</label>
              <input v-model="filters.startDate" type="date" min="0001-01-01" max="9999-12-31" />
            </div>
            <div class="field">
              <label>매출 날짜 (종료)</label>
              <input v-model="filters.endDate" type="date" min="0001-01-01" max="9999-12-31" />
            </div>
            <div class="field">
              <label>최소 금액</label>
              <input v-model="filters.minAmount" type="number" placeholder="예: 1000000" />
            </div>
            <div class="field">
              <label>최대 금액</label>
              <input v-model="filters.maxAmount" type="number" placeholder="예: 10000000" />
            </div>
          </div>
        </div>
      </template>
      <template #leftActions>
        <button v-if="userRole === 'admin'" type="button" class="register-btn" @click="handleRegister">등록</button>
        <button v-if="userRole === 'admin'" type="button" class="delete-btn" @click="handleDelete">삭제</button>
      </template>
    </SearchFilterShell>

    <div class="table-wrapper">
      <div v-if="isDeleteMode" class="delete-mode-notice">
        <span>🗑️ 삭제 모드: 삭제할 행을 클릭하세요</span>
        <button type="button" class="cancel-delete-btn" @click="cancelDeleteMode">취소</button>
      </div>
      
      <div v-if="rows.length > 0" class="custom-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th v-for="col in columns" :key="col.key">
                {{ col.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(row, rowIndex) in rows" 
              :key="rowIndex"
              :class="{ 
                'selected-for-delete': selectedRowIndex === rowIndex,
                'clickable': isDeleteMode 
              }"
              @click="handleRowClick(rowIndex, row)"
            >
              <td v-for="col in columns" :key="col.key">
                {{ row[col.key] || '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-else class="no-data-message">
        검색 결과가 없습니다.
      </div>
    </div>

    <!-- 삭제 확인 모달 -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content" @click.stop>
        <h3>삭제 확인</h3>
        <p>정말 삭제하시겠습니까?</p>
        <div class="selected-row-info" v-if="selectedRow">
          <p><strong>매출 날짜:</strong> {{ selectedRow.salesDate }}</p>
          <p><strong>부서:</strong> {{ selectedRow.department }}</p>
          <p><strong>직원명:</strong> {{ selectedRow.employeeName }}</p>
          <p><strong>매출 금액:</strong> {{ selectedRow.amount }}</p>
        </div>
        <div class="modal-actions">
          <button type="button" class="confirm-delete-btn" @click="confirmDelete">삭제</button>
          <button type="button" class="cancel-modal-btn" @click="closeDeleteModal">취소</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import BaseDataTable from '@/components/BaseDataTable.vue'
import SearchFilterShell from '@/components/common/SearchFilterShell.vue'

const router = useRouter()

// 사용자 권한 관리
const userRole = ref('')

// 사용자 권한 확인 함수
function checkUserRole() {
  try {
    // localStorage에서 사용자 정보 가져오기 (실제 저장 위치에 따라 수정 필요)
    const userInfo = localStorage.getItem('userInfo')
    if (userInfo) {
      const parsedUserInfo = JSON.parse(userInfo)
      if (parsedUserInfo.levelLabel === '관리자') {
        userRole.value = 'admin'
      } else {
        userRole.value = 'user'
      }
    }
    
    // 또는 sessionStorage 사용하는 경우:
    // const userInfo = sessionStorage.getItem('userInfo')
    
    // 또는 Pinia/Vuex store 사용하는 경우:
    // const userStore = useUserStore()
    // if (userStore.user.levelLabel === '관리자') {
    //   userRole.value = 'admin'
    // }
    
  } catch (error) {
    console.error('사용자 정보를 가져오는 중 오류 발생:', error)
    userRole.value = 'user' // 기본값으로 일반 사용자 설정
  }
}

// 컴포넌트 마운트 시 사용자 권한 확인
onMounted(() => {
  checkUserRole()
})

const searchForm = reactive({
  startDate: '',
  endDate: '',
  minAmount: null,
  maxAmount: null,
  department: '',
  employeeName: '',
  contractCode: ''
})

async function handleSearch(data) {
  console.log('검색 조건:', data)
  
  // API 요청 body 구성
  const requestBody = {
    startDate: data.startDate || "",
    endDate: data.endDate || "",
    department: data.department || "",
    employeeName: data.employeeName || "",
    minAmount: data.minAmount ? parseInt(data.minAmount) : null,
    maxAmount: data.maxAmount ? parseInt(data.maxAmount) : null,
    contractCode: data.contractCode || ""
  }
  
  try {
    const response = await axios.post('http://localhost:8080/sales/search', requestBody)
    console.log('검색 결과:', response.data)
    
    // 백엔드 응답 데이터를 테이블 형태로 변환
    if (response.data && Array.isArray(response.data)) {
      rows.value = response.data.map((item, index) => ({
        index: index + 1,
        salesDate: item.salesDate,
        department: item.department,
        employeeName: item.employeeName,
        amount: formatCurrency(item.amount),
        contractCode: item.contractCode
      }))
    }
  } catch (error) {
    console.error('검색 API 호출 실패:', error)
    alert('검색 중 오류가 발생했습니다.')
  }
}

function handleReset() {
  console.log('검색 조건 초기화됨')
  
  // 모든 검색 조건 초기화
  searchForm.startDate = ''
  searchForm.endDate = ''
  searchForm.minAmount = null
  searchForm.maxAmount = null
  searchForm.department = ''
  searchForm.employeeName = ''
  searchForm.contractCode = ''
}

function handleRegister() {
  console.log('등록 버튼 클릭')
  console.log('라우터 객체:', router)
  try {
    router.push('/sales/register')
    console.log('라우터 push 완료')
  } catch (error) {
    console.error('라우터 push 에러:', error)
  }
}

function handleDelete() {
  console.log('삭제 버튼 클릭')
  isDeleteMode.value = true
  selectedRowIndex.value = null
  selectedRow.value = null
}

function cancelDeleteMode() {
  isDeleteMode.value = false
  selectedRowIndex.value = null
  selectedRow.value = null
}

function handleRowClick(rowIndex, row) {
  if (!isDeleteMode.value) return
  
  selectedRowIndex.value = rowIndex
  selectedRow.value = row
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  selectedRowIndex.value = null
  selectedRow.value = null
}

async function confirmDelete() {
  if (!selectedRow.value) return
  
  try {
    // 실제 삭제 API 호출 (백엔드 구현에 따라 수정 필요)
    console.log('삭제할 데이터:', selectedRow.value)
    // const response = await axios.delete(`http://localhost:8080/sales/${selectedRow.value.id}`)
    
    // 삭제 성공 시 테이블에서 해당 행 제거
    rows.value.splice(selectedRowIndex.value, 1)
    
    alert('매출 데이터가 성공적으로 삭제되었습니다.')
    
    // 모달 닫기 및 삭제 모드 종료
    closeDeleteModal()
    cancelDeleteMode()
    
  } catch (error) {
    console.error('삭제 API 호출 실패:', error)
    alert('삭제 중 오류가 발생했습니다.')
  }
}

const columns = [
  { label: '번호', key: 'index' },
  { label: '매출 날짜', key: 'salesDate' },
  { label: '부서', key: 'department' },
  { label: '직원명', key: 'employeeName' },
  { label: '매출 금액', key: 'amount' },
  { label: '계약 코드', key: 'contractCode' }
]

// 테이블 데이터 (API 응답으로 업데이트됨)
const rows = ref([])

// 삭제 모드 관련 상태
const isDeleteMode = ref(false)
const selectedRowIndex = ref(null)
const selectedRow = ref(null)
const showDeleteModal = ref(false)

// 금액 포맷팅 함수
function formatCurrency(amount) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(amount)
}
</script>

<style scoped>
section {
  padding: 20px;
}

.register-btn,
.delete-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.register-btn {
  background-color: #cbe86b;
  color: #1a1a1a;
}

.delete-btn {
  background-color: #f8d7da;
  color: #721c24;
}

.sales-search-fields {
  background-color: #f8fdf2;
  padding: 16px 24px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.row-first {
  display: flex;
  justify-content: flex-start;
  gap: 30px;
  margin-bottom: 10px;
}

.row-second {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 10px;
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

.row-first .field input {
  width: 200px;
}

.table-wrapper {
  margin-top: 24px;
}

.no-data-message {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
  font-size: 16px;
  background: #F9F9F9;
  border-radius: 4px;
}

/* 삭제 모드 관련 스타일 */
.delete-mode-notice {
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  padding: 12px 16px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #856404;
  font-weight: 500;
}

.cancel-delete-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.cancel-delete-btn:hover {
  background-color: #5a6268;
}

/* 커스텀 테이블 스타일 */
.custom-table-wrapper {
  overflow-x: auto;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  table-layout: auto;
}

.data-table thead tr {
  background-color: #e1ecb6;
  text-align: left;
}

.data-table th,
.data-table td {
  padding: 10px;
  border: 1px solid #d1d1d1;
  white-space: nowrap;
}

.data-table tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

.data-table tbody tr.clickable {
  cursor: pointer;
}

.data-table tbody tr.clickable:hover {
  background-color: #e9ecef;
}

.data-table tbody tr.selected-for-delete {
  background-color: #FFC6C6 !important;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  min-width: 400px;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-content h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 18px;
}

.modal-content p {
  margin: 8px 0;
  color: #666;
}

.selected-row-info {
  background-color: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
  margin: 16px 0;
  border-left: 4px solid #FFC6C6;
}

.selected-row-info p {
  margin: 4px 0;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.confirm-delete-btn,
.cancel-modal-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.confirm-delete-btn {
  background-color: #dc3545;
  color: white;
}

.confirm-delete-btn:hover {
  background-color: #c82333;
}

.cancel-modal-btn {
  background-color: #6c757d;
  color: white;
}

.cancel-modal-btn:hover {
  background-color: #5a6268;
}
</style>
