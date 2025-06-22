<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-box">
      <!-- 모달 헤더 -->
      <div class="modal-header">
        <h2 class="modal-title">결재 상세</h2>
        <button class="close-btn" @click="emit('close')">×</button>
      </div>

      <div class="modal-content">
        <!-- 결재 정보 테이블 -->
        <div class="table-container">
          <table class="erp-table">
            <tbody>
              <tr>
                <th class="th-label">결재 코드</th>
                <td class="td-value">{{ approval.code }}</td>
                <th class="th-label">계약 코드</th>
                <td class="td-value">{{ approval.contractCode }}</td>
              </tr>
              <tr>
                <th class="th-label">결재 요청 일시</th>
                <td class="td-value">{{ formatDateTime(approval.reqDate) }}</td>
                <th class="th-label">결재 요청 담당자</th>
                <td class="td-value">{{ approval.reqName }}</td>
              </tr>
              <tr>
                <th class="th-label">결재 승인 일시</th>
                <td class="td-value">{{ formatDateTime(approval.aprvDate) || '-' }}</td>
                <th class="th-label">결재 승인 담당자</th>
                <td class="td-value">{{ approval.aprvName || '-' }}</td>
              </tr>
              <tr>
                <th class="th-label">결재 상태</th>
                <td class="td-value">
                  <span class="status-badge" :class="getStatusClass(approval.state)">
                    {{ approval.state }}
                  </span>
                </td>
                <th class="th-label">관련 계약</th>
                <td class="td-value">
                  <button class="contract-link-btn" @click="goToContract">
                    계약 상세 보기
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 결재 제목 -->
        <div class="section-container">
          <h3 class="section-title">결재 제목</h3>
          <div class="content-box">
            {{ approval.title }}
          </div>
        </div>

        <!-- 결재 내용 -->
        <div class="section-container">
          <h3 class="section-title">결재 내용</h3>
          <div class="content-box">
            <textarea 
              :value="approval.content" 
              readonly 
              rows="6"
              class="content-textarea"
            ></textarea>
          </div>
        </div>

        <!-- 결재 코멘트 -->
        <div class="section-container">
          <h3 class="section-title">결재 코멘트</h3>
          <div v-if="canEditComment" class="content-box editable">
            <textarea 
              v-model="editableComment"
              rows="4"
              class="comment-textarea editable"
              placeholder="결재 코멘트를 입력하세요..."
            ></textarea>
          </div>
          <div v-else class="content-box">
            <textarea 
              :value="approval.comment || ''" 
              readonly 
              rows="4"
              class="comment-textarea"
            ></textarea>
          </div>
        </div>

        <!-- 승인/반려 버튼 -->
        <div v-if="canApprove" class="action-section">
          <div class="button-group">
            <button class="approve-btn" @click="handleApprove">
              <span class="btn-icon">✓</span>
              승인
            </button>
            <button class="reject-btn" @click="handleReject">
              <span class="btn-icon">✗</span>
              반려
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import api from '@/api/auth'

const props = defineProps({
  isOpen: Boolean,
  approval: Object,
  isNotificationView: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'refresh'])

const authStore = useAuthStore()
const router = useRouter()

// 편집 가능한 코멘트 상태
const editableComment = ref('')

// approval이 변경될 때마다 editableComment 초기화
watch(() => props.approval, (newApproval) => {
  if (newApproval) {
    editableComment.value = newApproval.comment || ''
  }
}, { immediate: true })

// 현재 사용자의 권한 레벨 확인
const userLevelLabel = computed(() => authStore.userInfo?.levelLabel || '')

// 권한 분기 로직
const canApprove = computed(() => {
  const level = userLevelLabel.value
  const isRequestStatus = props.approval?.state === '요청'
  
  // 팀장이고 요청 상태일 때만 승인/반려 권한 있음 (관리자는 제외)
  return level === '팀장' && isRequestStatus
})

const canEditComment = computed(() => {
  const level = userLevelLabel.value
  const isRequestStatus = props.approval?.state === '요청'
  
  // 팀장이고 요청 상태일 때만 코멘트 수정 가능 (관리자는 제외)
  return level === '팀장' && isRequestStatus
})

const isReadOnlyForLowerLevels = computed(() => {
  const level = userLevelLabel.value
  const isRequestStatus = props.approval?.state === '요청'
  const readOnlyLevels = ['사원', '주임', '대리', '과장', '관리자']
  
  // 사원~과장, 관리자이고 요청 상태일 때는 읽기 전용
  return readOnlyLevels.includes(level) && isRequestStatus
})

// 상태에 따른 CSS 클래스 반환
const getStatusClass = (status) => {
  switch (status) {
    case '승인':
      return 'status-approved'
    case '요청':
      return 'status-pending'
    case '반려':
      return 'status-rejected'
    default:
      return ''
  }
}

// 계약 관리 페이지로 이동
const goToContract = () => {
  // 모달 닫기
  emit('close')
  
  // 계약 관리 페이지로 이동하면서 계약 코드를 쿼리 파라미터로 전달
  router.push({
    path: '/contract/manage',
    query: {
      contractCode: props.approval.contractCode
    }
  })
}

// 승인 처리
const handleApprove = async () => {
  try {
    const token = authStore.accessToken
    
    const requestData = {
      approvalId: props.approval.id,
      decision: "APPROVE",
      comment: editableComment.value
    }
    
    await api.post('/approval/decision', requestData, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      withCredentials: true
    })
    
    alert('승인이 완료되었습니다.')
    emit('refresh') // 부모 컴포넌트에 새로고침 신호
    emit('close') // 모달 닫기
    
  } catch (error) {
    console.error('승인 처리 중 오류:', error)
    alert('승인 처리 중 오류가 발생했습니다.')
  }
}

// 반려 처리
const handleReject = async () => {
  if (!editableComment.value.trim()) {
    alert('반려 사유를 입력해주세요.')
    return
  }
  
  try {
    const token = authStore.accessToken
    
    const requestData = {
      approvalId: props.approval.id,
      decision: "REJECT",
      comment: editableComment.value
    }
    
    await api.post('/approval/decision', requestData, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      withCredentials: true
    })
    
    alert('반려가 완료되었습니다.')
    emit('refresh') // 부모 컴포넌트에 새로고침 신호
    emit('close') // 모달 닫기
    
  } catch (error) {
    console.error('반려 처리 중 오류:', error)
    alert('반려 처리 중 오류가 발생했습니다.')
  }
}

// 모달이 열릴 때 탭 변경 방지
watch(() => props.isOpen, (newValue) => {
  if (newValue && props.isNotificationView) {
    // 알림 페이지에서 모달이 열릴 때는 탭 변경을 하지 않음
    return
  }
  // 기존 탭 변경 로직
  if (newValue) {
    // 탭 변경 로직
  }
})

// 날짜 포맷 함수
const formatDateTime = (dateStr) => {
  if (!dateStr) return null
  
  // 2025-06-22-11:16:25 형식을 2025-06-22 11:16 형식으로 변환
  if (typeof dateStr === 'string' && dateStr.includes('-') && dateStr.includes(':')) {
    // 마지막 하이픈을 공백으로 바꾸고 초 단위 제거
    const parts = dateStr.split('-')
    if (parts.length === 4) {
      const datePart = `${parts[0]}-${parts[1]}-${parts[2]}`
      const timePart = parts[3].substring(0, 5) // HH:mm만 추출 (초 제거)
      return `${datePart} ${timePart}`
    }
  }
  
  // 기존 방식으로 파싱 시도
  let date
  if (typeof dateStr === 'string') {
    date = new Date(dateStr)
  } else if (typeof dateStr === 'number') {
    date = new Date(dateStr)
  } else {
    date = dateStr
  }
  
  // 유효한 날짜인지 확인
  if (isNaN(date.getTime())) {
    return dateStr // 원본 데이터 그대로 반환
  }
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}`
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.modal-box {
  width: 1000px;
  max-height: 90vh;
  background: #ffffff;
  border-radius: 8px;
  padding: 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  background: linear-gradient(135deg, #4A6741 0%, #8BA888 100%);
  color: white;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: white;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: white;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.modal-content {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.table-container {
  margin-bottom: 24px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.erp-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.erp-table th,
.erp-table td {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
  vertical-align: middle;
}

.erp-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-right: 1px solid #e0e0e0;
  width: 140px;
}

.erp-table td {
  font-weight: 400;
  color: #212529;
  font-size: 14px;
  background: white;
}

.erp-table tr:last-child th,
.erp-table tr:last-child td {
  border-bottom: none;
}

.erp-table tr:hover td {
  background-color: #f8f9fa;
}

.section-container {
  margin-bottom: 24px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #495057;
  padding-bottom: 8px;
  border-bottom: 2px solid #e9ecef;
  display: flex;
  align-items: center;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 16px;
  background: #4A6741;
  margin-right: 8px;
  border-radius: 2px;
}

.content-box {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 16px;
  min-height: 28px;
  display: flex;
  align-items: center;
}

.content-box.editable {
  background: #ffffff;
  border: 2px solid #007bff;
}

.content-textarea,
.comment-textarea {
  width: 100%;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #212529;
  resize: none;
  outline: none;
  font-family: inherit;
  line-height: 1.6;
  padding: 0;
}

.content-textarea {
  min-height: 120px;
}

.comment-textarea {
  min-height: 80px;
}

.comment-textarea.editable {
  background: #ffffff;
}

.comment-textarea::placeholder {
  color: #6c757d;
  font-style: italic;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 4px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 600;
  text-align: center;
  height: 16px;
  min-width: 30px;
  justify-content: center;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: white;
}

.status-badge.status-approved {
  background-color: #4A90E2;
}

.status-badge.status-pending {
  background-color: #ffc107;
}

.status-badge.status-rejected {
  background-color: #FF5D5D;
}

.contract-link-btn {
  background: none;
  border: none;
  color: #007bff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  margin: 0;
  text-decoration: underline;
  transition: color 0.2s;
}

.contract-link-btn:hover {
  color: #0056b3;
  text-decoration: none;
}

.action-section {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 0;
  border-top: 1px solid #e0e0e0;
  margin-top: 20px;
}

.button-group {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

.approve-btn,
.reject-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  min-width: 70px;
}

.approve-btn {
  background: #28a745;
  color: white;
}

.reject-btn {
  background: #dc3545;
  color: white;
}

.approve-btn:hover {
  background: #218838;
}

.reject-btn:hover {
  background: #c82333;
}

.btn-icon {
  margin-right: 5px;
  font-size: 13px;
  font-weight: bold;
}

@media (max-width: 1024px) {
  .modal-box {
    width: 95%;
    margin: 0 auto;
  }
  
  .erp-table th,
  .erp-table td {
    padding: 12px;
    font-size: 13px;
  }
  
  .erp-table th {
    width: 120px;
  }
}

@media (max-width: 768px) {
  .modal-box {
    width: 98%;
    max-height: 95vh;
  }
  
  .modal-header {
    padding: 16px 20px;
  }
  
  .modal-content {
    padding: 20px;
  }
  
  .erp-table {
    font-size: 12px;
  }
  
  .erp-table th,
  .erp-table td {
    padding: 10px;
  }
  
  .button-group {
    flex-direction: column;
    width: 100%;
  }
  
  .approve-btn,
  .reject-btn {
    width: 100%;
  }
}
</style> 