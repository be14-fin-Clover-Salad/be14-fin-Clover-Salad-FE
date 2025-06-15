<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-box">
      <div class="form-grid">
        <!-- 첫 번째 행: 결재코드, 계약코드, 결재상태 -->
        <div class="field">
          <label>결재 코드:</label>
          <div class="input">{{ approval.code }}</div>
        </div>

        <div class="field">
          <label>계약 코드:</label>
          <div class="input">{{ approval.contractCode }}</div>
        </div>

        <div class="field status-field">
          <label>결재 상태:</label>
          <span class="status-badge" :class="getStatusClass(approval.state)">
            {{ approval.state }}
          </span>
        </div>

        <div class="field two-col">
          <label>결재 요청 일시:</label>
          <div class="input">{{ approval.reqDate }}</div>
        </div>

        <div class="field two-col">
          <label>결재 요청 담당자:</label>
          <div class="input">{{ approval.reqName }}</div>
        </div>

        <div class="field two-col">
          <label>결재 승인 일시:</label>
          <div class="input">{{ approval.aprvDate || '-' }}</div>
        </div>

        <div class="field two-col">
          <label>결재 승인 담당자:</label>
          <div class="input">{{ approval.aprvName }}</div>
        </div>

        <div class="field title-row">
          <div class="title-section">
            <label>결재 제목:</label>
            <div class="input">{{ approval.title }}</div>
          </div>
          <div class="button-section">
            <button class="contract-btn" @click="goToContract">계약 관리</button>
          </div>
        </div>

        <div class="field full">
          <label>결재 내용:</label>
          <div class="textarea-field">
            <textarea 
              :value="approval.content" 
              readonly 
              rows="8"
              class="content-textarea"
            ></textarea>
          </div>
        </div>

        <div class="field full">
          <label>결재 코멘트:</label>
          <div v-if="canEditComment" class="textarea-field editable">
            <textarea 
              v-model="editableComment"
              rows="6"
              class="comment-textarea editable"
              placeholder="결재 코멘트를 입력하세요..."
            ></textarea>
          </div>
          <div v-else class="textarea-field">
            <textarea 
              :value="approval.comment || ''" 
              readonly 
              rows="6"
              class="comment-textarea"
            ></textarea>
          </div>
        </div>

        <!-- 승인/반려 버튼 (팀장이고 요청 상태일 때만 표시) -->
        <div v-if="canApprove" class="field full action-buttons">
          <div class="button-group">
            <button class="approve-btn" @click="handleApprove">승인</button>
            <button class="reject-btn" @click="handleReject">반려</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
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
  // 계약 관리 페이지로 이동하는 로직
  console.log('계약 관리 페이지로 이동:', props.approval.contractCode)
  // 실제 구현시에는 router.push('/contract/manage') 등으로 처리
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
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  font-family: 'Noto Sans KR', sans-serif;
}

.modal-box {
  width: 900px;
  max-height: 90vh;
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 24px 32px;
}

.field {
  display: flex;
  flex-direction: column;
}

.field.full {
  grid-column: span 3;
}

.field.two-col:nth-child(4),
.field.two-col:nth-child(6) {
  grid-column: span 2;
}

.field.title-row {
  grid-column: span 3;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.field.title-row .title-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-right: 20px;
}

.field.title-row .button-section {
  flex: 0;
  display: flex;
  align-items: flex-start;
  padding-bottom: 0;
  margin-top: 20px;
}

.field.status-field {
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: -30px;
}

.field.status-field label {
  margin-bottom: 0;
}

.field label {
  font-weight: 500;
  margin-bottom: 8px;
  color: #555;
  font-size: 14px;
}

.input {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  padding: 9.5px 16px;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  min-height: 15px;
}

.textarea-field {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 4px;
}

.textarea-field.editable {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 4px;
}

.content-textarea,
.comment-textarea {
  width: 100%;
  border: none;
  background: transparent;
  padding: 30px 30px 30px 30px;
  font-size: 14px;
  color: #333;
  resize: none;
  outline: none;
  font-family: inherit;
  line-height: 1.5;
}

.content-textarea {
  min-height: 200px;
}

.comment-textarea {
  min-height: 150px;
}

.comment-textarea.editable {
  background: #ffffff;
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  min-width: 60px;
}

.status-badge.status-approved {
  background-color: #e3f2fd;
  color: #1565c0;
  border: 1px solid #90caf9;
}

.status-badge.status-pending {
  background-color: #fff3e0;
  color: #f57c00;
  border: 1px solid #ffcc02;
}

.status-badge.status-rejected {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ef5350;
}

.contract-btn {
  background-color: #e3f2fd;
  color: #1565c0;
  border: 1px solid #90caf9;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  height: 40px;
  width: 100px;
  box-sizing: border-box;
}

.contract-btn:hover {
  background-color: #bbdefb;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-top: 20px;
}

.button-group {
  display: flex;
  gap: 12px;
}

.approve-btn {
  background-color: #e8f5e8;
  color: #2e7d32;
  border: 1px solid #4caf50;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  height: 40px;
  width: 100px;
  box-sizing: border-box;
}

.reject-btn {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ef5350;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  height: 40px;
  width: 100px;
  box-sizing: border-box;
}

.approve-btn:hover {
  background-color: #c8e6c9;
}

.reject-btn:hover {
  background-color: #ffcdd2;
}

@media (max-width: 1000px) {
  .modal-box {
    width: 95%;
    margin: 0 auto;
    padding: 24px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .field.full,
  .field.two-col,
  .field.title-row {
    grid-column: span 1;
  }
}
</style> 