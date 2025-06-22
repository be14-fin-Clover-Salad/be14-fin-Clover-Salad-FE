<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-box">
      <div class="form-grid">
        <div class="field">
          <label>계약 코드:</label>
          <div class="input">{{ contractCode }}</div>
        </div>

        <div class="field">
          <label>요청자:</label>
          <div class="input">{{ requester }}</div>
        </div>

        <div class="field status-field">
          <label>결재 상태:</label>
          <span class="status-badge" :class="getStatusClass(contractState)">
            {{ contractState || '알 수 없음' }}
          </span>
        </div>

        <div class="field full">
          <label>결재 제목:</label>
          <input v-model="form.title" class="input editable" placeholder="결재 제목을 입력하세요" />
        </div>

        <!-- 결재 내용 textarea를 아래로 확장 -->
        <div class="field full">
          <label>결재 내용:</label>
          <textarea
            v-model="form.content"
            rows="12"
            class="content-textarea editable"
            placeholder="결재 요청 내용을 입력하세요"
          ></textarea>
        </div>

        <!-- action buttons -->
        <div class="field full action-buttons">
          <div class="button-group">
            <button
              class="approve-btn"
              :disabled="isApproveDisabled"
              @click="handleSubmit"
            >
              {{ approveBtnLabel }}
            </button>
            <button class="reject-btn" @click="emit('close')">취소</button>
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
})
console.log('props.contractState:', props.contractState)

const emit = defineEmits(['close', 'refresh'])

const authStore = useAuthStore()
const requester = authStore.userInfo?.name || ''

const form = ref({
  title: '',
  content: ''
})

// 상태에 따라 버튼 라벨과 비활성화 조건 계산
const approveBtnLabel = computed(() => {
  if (props.contractState === '결재전') return '요청'
  if (props.contractState === '반려') return '재요청'
  return '요청'
})

const isApproveDisabled = computed(() => {
  // 결재중(혹은 '완료' 등 비활성화할 상태)에는 버튼 비활성화
  return props.contractState === '결재중'
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
      // comment 제거
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

.field.status-field {
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: -30px;
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

.input.editable {
  background: #fff;
}

textarea {
  font-family: inherit;
}

.content-textarea {
  width: 100%;
  border: none;
  background: #f8f9fa;
  padding: 20px;
  font-size: 14px;
  color: #333;
  resize: none;
  outline: none;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  min-height: 180px;
  /* 결재내용란 더 크게 */
}

.editable {
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

.status-badge.status-pending {
  background-color: #fff3e0;
  color: #f57c00;
  border: 1px solid #ffcc02;
}

.status-badge.status-inprogress {
  background-color: #e3f2fd;
  color: #1565c0;
  border: 1px solid #90caf9;
}

.status-badge.status-active {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #81c784;
}

.status-badge.status-rejected {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ef5350;
}

.status-badge.status-unknown {
  background-color: #eeeeee;
  color: #888;
  border: 1px solid #ccc;
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

.approve-btn:disabled {
  background: #f1f1f1;
  color: #aaa;
  border: 1px solid #ddd;
  cursor: not-allowed;
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

.approve-btn:hover:enabled {
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

  .field.full {
    grid-column: span 1;
  }
}
</style>
