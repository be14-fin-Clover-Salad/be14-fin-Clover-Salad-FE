<template>
  <section>
    <SearchFilterShell :initial="searchForm" @search="handleSearch" @reset="handleReset">
      <template #fields="{ filters, expanded }">
        <SalesSearchFields :filters="filters" :expanded="expanded" />
      </template>
    </SearchFilterShell>

    <div class="table-wrapper">
      <div v-if="isDeleteMode" class="delete-mode-notice">
        <span>삭제할 행을 클릭하세요</span>
        <button type="button" class="cancel-delete-btn" @click="cancelDeleteMode">취소</button>
      </div>
      
      <BaseDataTable
        :columns="columns"
        :rows="rows"
        :isLoading="isLoading"
        :selectedCode="selectedRowIndex"
        @row-click="handleRowClick"
      />
      
      <!-- 등록/삭제 버튼을 테이블 하단으로 이동 -->
      <div class="action-buttons">
        <button v-if="userRole === 'admin'" type="button" class="register-btn" @click="handleRegister">등록</button>
        <button v-if="userRole === 'admin'" type="button" class="delete-btn" @click="handleDelete">삭제</button>
      </div>
    </div>

    <!-- 매출 등록 모달 -->
    <RegisterSales 
      v-if="showRegisterModal" 
      @close="closeRegisterModal" 
      @success="handleRegisterSuccess" 
    />

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
import api from '@/api/auth'
import BaseDataTable from '@/components/BaseDataTable.vue'
import SearchFilterShell from '@/components/common/SearchFilterShell.vue'
import SalesSearchFields from '@/components/sales/SalesSearchFields.vue'
import RegisterSales from '@/views/sales/RegisterSales.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 사용자 권한 관리
const userRole = ref('')

// 사용자 권한 확인 함수
function checkUserRole() {
  try {
    // Pinia 스토어에서 사용자 정보 가져오기
    if (authStore.userInfo && authStore.userInfo.levelLabel === '관리자') {
      userRole.value = 'admin'
    } else {
      userRole.value = 'user'
    }
  } catch (error) {
    console.error('사용자 정보를 가져오는 중 오류 발생:', error)
    userRole.value = 'user' // 기본값으로 일반 사용자 설정
  }
}

// 컴포넌트 마운트 시 사용자 권한 확인
onMounted(async () => {
  // 사용자 정보가 없으면 먼저 가져오기
  if (!authStore.userInfo) {
    try {
      await authStore.fetchUserInfo()
    } catch (error) {
      console.error('사용자 정보를 가져오는데 실패했습니다:', error)
    }
  }
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
    isLoading.value = true
    const response = await api.post('/sales/search', requestBody)
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
  } finally {
    isLoading.value = false
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
  showRegisterModal.value = true
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

function handleRowClick(row) {
  if (!isDeleteMode.value) return
  
  // row에서 index를 찾기
  const rowIndex = rows.value.findIndex(r => r === row)
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

function closeRegisterModal() {
  console.log('등록 모달 닫기')
  showRegisterModal.value = false
}

function handleRegisterSuccess(data) {
  console.log('매출 등록 성공:', data)
  // 등록 성공 후 테이블 새로고침
  handleSearch(searchForm)
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

// 로딩 상태
const isLoading = ref(false)

// 삭제 모드 관련 상태
const isDeleteMode = ref(false)
const selectedRowIndex = ref(null)
const selectedRow = ref(null)
const showDeleteModal = ref(false)

// 매출 등록 모달 관련 상태
const showRegisterModal = ref(false)

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
  font-weight: 600;
  border: none;
  cursor: pointer;
  font-size: 13px;
  color: white;
  transition: all 0.2s ease;
}

.register-btn {
  background-color: #27ae60;
}

.register-btn:hover {
  background-color: #229954;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.delete-btn {
  background-color: #e74c3c;
}

.delete-btn:hover {
  background-color: #c0392b;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.sales-search-fields {
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
  width: 100%;
  display: block;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 16px;
  padding: 12px 0;
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
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 14px 18px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #495057;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.delete-mode-notice span {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.delete-mode-notice span::before {
  font-size: 16px;
  opacity: 0.7;
}

.cancel-delete-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.cancel-delete-btn:hover {
  background: #5a6268;
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
  padding: 32px;
  border-radius: 12px;
  min-width: 480px;
  max-width: 600px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid #e1e5e9;
}

.modal-content h3 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
}

.modal-content p {
  margin: 0 0 24px 0;
  color: #5a6c7d;
  font-size: 14px;
  line-height: 1.5;
}

.selected-row-info {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin: 0 0 24px 0;
  border: 1px solid #e9ecef;
}

.selected-row-info p {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #495057;
  line-height: 1.4;
}

.selected-row-info p:last-child {
  margin-bottom: 0;
}

.selected-row-info strong {
  color: #2c3e50;
  font-weight: 600;
  margin-right: 8px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 0;
}

.confirm-delete-btn,
.cancel-modal-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 13px;
  transition: all 0.2s ease;
  min-width: 70px;
}

.confirm-delete-btn {
  background-color: #e74c3c;
  color: white;
}

.confirm-delete-btn:hover {
  background-color: #c0392b;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.cancel-modal-btn {
  background-color: #95a5a6;
  color: white;
}

.cancel-modal-btn:hover {
  background-color: #7f8c8d;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(149, 165, 166, 0.3);
}

.table-wrapper table {
  width: 100% !important;
}

/* SalesView에서만 테이블을 100%로 확장 */
::v-deep(.data-table) {
  width: 100%;
  table-layout: auto;
}
</style>
