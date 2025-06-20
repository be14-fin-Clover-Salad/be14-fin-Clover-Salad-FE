<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3>매출 등록</h3>
        <button class="close-btn" @click="handleClose">×</button>
      </div>
      
      <div class="modal-body">
        <div class="form-fields">
          <div class="field">
            <label>매출 날짜 <span class="required">*</span></label>
            <input 
              v-model="registerForm.salesDate" 
              type="date" 
              required
              min="0001-01-01"
              max="9999-12-31"
              :class="{ 'error': errors.salesDate }"
            />
            <span v-if="errors.salesDate" class="error-message">{{ errors.salesDate }}</span>
          </div>
          
          <div class="field">
            <label>부서명 <span class="required">*</span></label>
            <input 
              v-model="registerForm.department" 
              type="text" 
              placeholder="예: 영업부"
              required
              :class="{ 'error': errors.department }"
            />
            <span v-if="errors.department" class="error-message">{{ errors.department }}</span>
          </div>
          
          <div class="field">
            <label>직원명 <span class="required">*</span></label>
            <input 
              v-model="registerForm.employeeName" 
              type="text" 
              placeholder="예: 김영업"
              required
              :class="{ 'error': errors.employeeName }"
            />
            <span v-if="errors.employeeName" class="error-message">{{ errors.employeeName }}</span>
          </div>
          
          <div class="field">
            <label>매출 금액 <span class="required">*</span></label>
            <input 
              v-model="formattedAmount" 
              type="text" 
              placeholder="예: 1,000,000"
              required
              @input="handleAmountInput"
              :class="{ 'error': errors.amount }"
            />
            <span v-if="errors.amount" class="error-message">{{ errors.amount }}</span>
          </div>
          
          <div class="field">
            <label>계약 ID <span class="required">*</span></label>
            <input 
              v-model="registerForm.contractId" 
              type="number" 
              placeholder="예: 1001"
              required
              min="1"
              :class="{ 'error': errors.contractId }"
            />
            <span v-if="errors.contractId" class="error-message">{{ errors.contractId }}</span>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <div class="footer-left">
          <button class="reset-btn" @click="handleReset">초기화</button>
        </div>
        <div class="footer-right">
          <button class="save-btn" @click="handleSave">저장</button>
          <button class="cancel-btn" @click="handleClose">취소</button>
        </div>
      </div>
    </div>
  </div>
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

// 모달 관련 이벤트
const emit = defineEmits(['close', 'success'])

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
      // 관리자가 아닌 경우 접근 차단
      alert('비정상적인 접근입니다.')
      handleClose()
      return
    }
  } catch (error) {
    console.error('사용자 정보를 가져오는 중 오류 발생:', error)
    alert('비정상적인 접근입니다.')
    handleClose()
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
      alert('비정상적인 접근입니다.')
      handleClose()
      return
    }
  }
  checkUserRole()
})

const registerForm = reactive({
  salesDate: '',
  department: '',
  employeeName: '',
  amount: null,
  contractId: null
})

const errors = ref({})
const formattedAmount = ref('')

// 숫자 포맷팅 함수
function formatNumber(value) {
  if (!value) return ''
  // 숫자가 아닌 문자 제거
  const numericValue = value.toString().replace(/[^0-9]/g, '')
  if (!numericValue) return ''
  // 세 자리마다 콤마 추가
  return parseInt(numericValue).toLocaleString('ko-KR')
}

// 포맷된 숫자를 실제 숫자로 변환
function parseFormattedNumber(value) {
  if (!value) return null
  const numericValue = value.toString().replace(/[^0-9]/g, '')
  return numericValue ? parseInt(numericValue) : null
}

// 금액 입력 핸들러
function handleAmountInput(event) {
  const inputValue = event.target.value
  const numericValue = parseFormattedNumber(inputValue)
  
  // 실제 금액 값 업데이트
  registerForm.amount = numericValue
  
  // 포맷된 값 업데이트
  formattedAmount.value = formatNumber(inputValue)
}

function validateForm() {
  errors.value = {}
  
  if (!registerForm.salesDate) {
    errors.value.salesDate = '매출 날짜를 입력해주세요.'
  }
  
  if (!registerForm.department.trim()) {
    errors.value.department = '부서명을 입력해주세요.'
  }
  
  if (!registerForm.employeeName.trim()) {
    errors.value.employeeName = '직원명을 입력해주세요.'
  }
  
  if (!registerForm.amount || registerForm.amount <= 0) {
    errors.value.amount = '올바른 매출 금액을 입력해주세요.'
  }
  
  if (!registerForm.contractId || registerForm.contractId <= 0) {
    errors.value.contractId = '올바른 계약 ID를 입력해주세요.'
  }
  
  return Object.keys(errors.value).length === 0
}

async function handleSave() {
  console.log('저장 버튼 클릭')
  
  if (!validateForm()) {
    console.log('유효성 검사 실패:', errors.value)
    return
  }
  
  const requestBody = {
    salesDate: registerForm.salesDate,
    department: registerForm.department.trim(),
    employeeName: registerForm.employeeName.trim(),
    amount: parseInt(registerForm.amount),
    contractId: parseInt(registerForm.contractId)
  }
  
  console.log('전송할 데이터:', requestBody)
  
  try {
    const response = await api.post('/sales', requestBody)
    console.log('등록 성공:', response.data)
    alert('매출이 성공적으로 등록되었습니다.')
    emit('success', response.data)
    handleClose()
  } catch (error) {
    console.error('등록 API 호출 실패:', error)
    
    // 상세한 에러 정보 출력
    if (error.response) {
      console.error('응답 상태:', error.response.status)
      console.error('응답 데이터:', error.response.data)
      console.error('응답 헤더:', error.response.headers)
      
      if (error.response.status === 500) {
        alert(`서버 오류가 발생했습니다.\n에러 내용: ${error.response.data}`)
      } else {
        alert(`등록 중 오류가 발생했습니다. (상태 코드: ${error.response.status})`)
      }
    } else if (error.request) {
      console.error('요청:', error.request)
      alert('서버에 연결할 수 없습니다.')
    } else {
      console.error('에러:', error.message)
      alert('알 수 없는 오류가 발생했습니다.')
    }
  }
}

function handleClose() {
  console.log('모달 닫기')
  emit('close')
}

function handleReset() {
  console.log('초기화 버튼 클릭')
  
  // 모든 폼 데이터 초기화
  registerForm.salesDate = ''
  registerForm.department = ''
  registerForm.employeeName = ''
  registerForm.amount = null
  registerForm.contractId = null
  
  // 포맷된 금액도 초기화
  formattedAmount.value = ''
  
  // 에러 메시지도 초기화
  errors.value = {}
  
  console.log('폼 데이터가 초기화되었습니다.')
}

function handleOverlayClick() {
  handleClose()
}
</script>

<style scoped>
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

.modal-container {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: linear-gradient(135deg, #4A6741 0%, #8BA888 100%);
  border-bottom: 1px solid #e9ecef;
  color: white;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: white;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.modal-body {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-left: -100px;
}

.field {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  justify-content: center;
}

.field label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  min-width: 80px;
  text-align: right;
}

.required {
  color: #dc3545;
  font-weight: 700;
}

.field input {
  padding: 6px 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  transition: border-color 0.2s;
  width: 300px;
  flex-shrink: 0;
}

.field input:focus {
  outline: none;
  border-color: #28a745;
  box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.1);
}

.field input.error {
  border-color: #dc3545;
}

.field input.error:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.1);
}

.error-message {
  color: #dc3545;
  font-size: 11px;
  margin-top: 2px;
  font-weight: 500;
}

.field input::placeholder {
  color: #adb5bd;
  font-size: 13px;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.footer-left {
  flex: 1;
}

.footer-right {
  display: flex;
  gap: 8px;
}

.cancel-btn,
.save-btn,
.reset-btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
  min-width: 60px;
}

.cancel-btn {
  background-color: #adb5bd;
  color: white;
}

.cancel-btn:hover {
  background-color: #9ca3af;
}

.save-btn {
  background-color: #4A6741;
  color: white;
}

.save-btn:hover {
  background-color: #3d5635;
}

.reset-btn {
  background-color: #dc3545;
  color: white;
}

.reset-btn:hover {
  background-color: #c82333;
}

@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    margin: 20px;
  }
  
  .modal-header {
    padding: 12px 20px;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .modal-footer {
    padding: 12px 20px;
  }
  
  .field input {
    padding: 10px 12px;
    font-size: 16px;
  }
}
</style>
