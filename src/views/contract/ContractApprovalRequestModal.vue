<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-box">
      <!-- 모달 헤더 -->
      <div class="modal-header">
        <h2 class="modal-title">결재 요청</h2>
        <button class="close-btn" @click="emit('close')">×</button>
      </div>

      <div class="modal-content">
        <!-- 결재 정보 테이블 -->
        <div class="table-container">
          <table class="erp-table">
            <tbody>
              <tr>
                <th class="th-label">계약 코드</th>
                <td class="td-value">{{ contractCode }}</td>
                <th class="th-label">요청자</th>
                <td class="td-value">{{ requester }}</td>
              </tr>
              <tr>
                <th class="th-label">결재 상태</th>
                <td class="td-value">
                  <span class="status-badge" :class="getStatusClass(contractState)">
                    {{ contractState || '알 수 없음' }}
                  </span>
                </td>
                <th class="th-label">-</th>
                <td class="td-value">-</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 결재 제목 -->
        <div class="section-container">
          <h3 class="section-title">결재 제목</h3>
          <div class="content-box editable" :class="{ 'disabled': isContractActive || isTeamLead || isAdmin }">
            <input v-model="form.title" class="content-input editable"
              :class="{ 'disabled': isContractActive || isTeamLead || isAdmin }"
              :disabled="isContractActive || isTeamLead || isAdmin" placeholder="결재 제목을 입력하세요" />
          </div>
        </div>

        <!-- 결재 내용 -->
        <div class="section-container">
          <h3 class="section-title">결재 내용</h3>
          <div class="content-box editable" :class="{ 'disabled': isContractActive || isTeamLead || isAdmin }">
            <textarea v-model="form.content" rows="8" class="content-textarea editable"
              :class="{ 'disabled': isContractActive || isTeamLead || isAdmin }"
              :disabled="isContractActive || isTeamLead || isAdmin" placeholder="결재 요청 내용을 입력하세요"></textarea>
          </div>
        </div>

        <!-- action buttons -->
        <div class="action-section">
          <div class="button-group">
            <button class="approve-btn" :disabled="isApproveDisabled" @click="handleSubmit" :title="(isTeamLead || isAdmin)
              ? '팀장/관리자는 결재 요청 할 수 없습니다'
              : ''">
              {{ approveBtnLabel }}
            </button>
            <button class="reject-btn" @click="handleCancel">
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/api/auth'

const props = defineProps({
  isOpen: Boolean,
  contractId: Number,
  contractCode: String,
  contractState: String,
  approvalState: String,
})

const emit = defineEmits(['close', 'refresh'])

const authStore = useAuthStore()

// --- 권한 확인
const isAdmin = computed(() => authStore.userLevel === '관리자')
const isTeamLead = computed(() => authStore.userLevel === '팀장')

const requester = authStore.userInfo?.name || ''

const form = ref({
  title: '',
  content: ''
})

// 계약 상태가 "계약중"인지 확인
const isContractActive = computed(() => {
  return props.contractState === '계약중'
})

// 상태에 따라 버튼 라벨과 비활성화 조건 계산
const approveBtnLabel = computed(() => {
  if (props.contractState === '결재전') return '요청'
  if (props.contractState === '반려') return '재요청'
  return '요청'
})

const isApproveDisabled = computed(() => {
  // 계약중 상태이면 비활성화
  if (props.contractState === '계약중') {
    return true
  }
  // 결재중이지만 반려 상태인 경우는 활성화
  if (props.contractState === '결재중' && props.approvalState === '반려') {
    // 단, 팀장/관리자는 무조건 비활성화
    return isTeamLead.value || isAdmin.value ? true : false
  }
  // 결재중이고 반려가 아닌 경우는 비활성화
  if (props.contractState === '결재중') {
    return true
  }
  // 팀장/관리자는 무조건 비활성화
  if (isTeamLead.value || isAdmin.value) {
    return true
  }
  return false
})

function getStatusClass(status) {
  switch (status) {
    case '결재전':
      return 'status-pending'
    case '결재중':
      return 'status-inprogress'
    case '계약중':
      return 'status-active'
    case '반려':
      return 'status-rejected'
    default:
      return 'status-unknown'
  }
}

function handleCancel() {
  emit('close')
}

async function handleSubmit() {
  if (!form.value.title.trim() || !form.value.content.trim()) {
    alert('결재 제목과 내용을 모두 입력해주세요.')
    return
  }

  try {
    const token = authStore.accessToken
    const payload = {
      contractId: props.contractId,
      title: form.value.title,
      content: form.value.content
    }

    await api.post('/approval/request', payload, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    alert('결재 요청이 완료되었습니다.')
    emit('refresh')
    emit('close')
  } catch (err) {
    console.error('결재 요청 실패:', err)
    alert('결재 요청 중 오류가 발생했습니다.')
  }
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
  min-height: 60px;
  display: flex;
  align-items: center;
}

.content-box.editable {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  min-height: 28px;
}

.content-box.disabled {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
}

.content-input {
  width: 100%;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #212529;
  outline: none;
  font-family: inherit;
  line-height: 1.6;
  padding: 0;
  min-height: 28px;
}

.content-input.disabled {
  color: #6c757d;
  cursor: default;
}

.content-textarea {
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
  min-height: 120px;
}

.content-textarea.disabled {
  color: #6c757d;
  cursor: default;
}

.content-textarea::placeholder,
.content-input::placeholder {
  color: #6c757d;
  font-style: italic;
}

.content-input.disabled::placeholder,
.content-textarea.disabled::placeholder {
  color: #adb5bd;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
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

.status-badge.status-pending {
  background-color: #ffc107;
}

.status-badge.status-inprogress {
  background-color: #4A90E2;
}

.status-badge.status-active {
  background-color: #28a745;
}

.status-badge.status-rejected {
  background-color: #FF5D5D;
}

.status-badge.status-unknown {
  background-color: #6c757d;
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
  background: #6A7F64;
  color: white;
}

.approve-btn:disabled {
  background: #adb5bd;
  color: #fff;
  cursor: default;
}

.reject-btn {
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
  cursor: pointer;
}

.approve-btn:hover:not(:disabled) {
  background: #5A6F54;
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
