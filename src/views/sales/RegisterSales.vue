<template>
  <section>
    <div class="register-container">
      <div class="header">
        <h2>매출 등록</h2>
        <div class="header-actions">
          <button class="save-btn" @click="handleSave">저장</button>
          <button class="cancel-btn" @click="handleCancel">취소</button>
          <button class="reset-btn" @click="handleReset">초기화</button>
        </div>
      </div>
      
      <div class="form-container">
        <div class="form-fields">
          <div class="field-row">
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
          </div>
          
          <div class="field-row">
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
          </div>
          
          <div class="field-row">
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
            <div class="field">
              <!-- 빈 공간 -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

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
        // 관리자가 아닌 경우 접근 차단
        alert('비정상적인 접근입니다.')
        router.push('/')
        return
      }
    } else {
      // 사용자 정보가 없는 경우도 접근 차단
      alert('비정상적인 접근입니다.')
      router.push('/')
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
    alert('비정상적인 접근입니다.')
    router.push('/')
  }
}

// 컴포넌트 마운트 시 사용자 권한 확인
onMounted(() => {
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
    const response = await axios.post('http://localhost:8080/sales', requestBody)
    console.log('등록 성공:', response.data)
    alert('매출이 성공적으로 등록되었습니다.')
    router.push('/sales')
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

function handleCancel() {
  console.log('취소 버튼 클릭')
  router.push('/sales')
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
</script>

<style scoped>
section {
  padding: 20px;
}

.register-container {
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e9ecef;
}

.header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.cancel-btn,
.save-btn,
.reset-btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.cancel-btn {
  background-color: #d9d9d9;
  color: #333;
}

.cancel-btn:hover {
  background-color: #e9e9e9;
}

.save-btn {
  background-color: #cbe86b;
  color: #1a1a1a;
}

.save-btn:hover {
  background-color: #b8d654;
}

.reset-btn {
  background-color: #ffc107;
  color: #212529;
}

.reset-btn:hover {
  background-color: #e0a800;
}

.form-container {
  background-color: #f8fdf2;
  padding: 24px;
  border-radius: 8px;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.field {
  display: flex;
  flex-direction: column;
}

.field label {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.required {
  color: #dc3545;
}

.field input {
  padding: 12px 16px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  transition: border-color 0.2s;
}

.field input:focus {
  outline: none;
  border-color: #cbe86b;
  box-shadow: 0 0 0 2px rgba(203, 232, 107, 0.2);
}

.field input.error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
}

.field input[type="number"] {
  text-align: left;
}

.field input[type="date"] {
  color: #333;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .field-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
