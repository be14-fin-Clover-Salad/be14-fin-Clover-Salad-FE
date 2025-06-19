<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
    <div class="modal-content">
      <h2 class="modal-title">
        <span class="highlight">계약서</span> 재업로드
      </h2>

      <p class="description">
        계약 <strong>{{ contract?.code }}</strong>에 대한 계약서를 새로 업로드해 주세요.
      </p>
      <p class="subtext">PDF 형식의 전자 계약서만 가능합니다.</p>

      <input
        type="text"
        v-model="reason"
        placeholder="변경 사유를 입력하세요"
        class="reason-input"
      />

      <!-- 파일명 공간 고정 -->
      <div class="file-name-area">
        {{ fileName || '\u00A0' }}
      </div>

      <div class="button-row">
        <label class="file-button">
          PDF 파일 선택
          <input type="file" accept="application/pdf" @change="handleFileChange" hidden />
        </label>
        <button class="upload-button" @click="handleUpload">업로드 시작</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import api from '@/api/auth'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  isOpen: Boolean,
  contract: Object
})

const emit = defineEmits(['close', 'replace-success'])

const reason = ref('')
const selectedFile = ref(null)
const fileName = ref('')

watch(() => props.isOpen, (val) => {
  if (!val) {
    reset()
  }
})

function reset() {
  reason.value = ''
  selectedFile.value = null
  fileName.value = ''
}

function handleClose() {
  reset()
  emit('close')
}

function handleFileChange(event) {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    fileName.value = file.name
  } else {
    selectedFile.value = null
    fileName.value = ''
  }
}

async function handleUpload() {
  if (!selectedFile.value) {
    alert('PDF 파일을 선택해주세요.')
    return
  }
  if (!reason.value.trim()) {
    alert('변경 사유를 입력해주세요.')
    return
  }

  try {
    const authStore = useAuthStore()
    const token = authStore.accessToken

    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('note', reason.value)

    const response = await api.patch(
      `/api/command/contract/replace/${props.contract.id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    )

    emit('replace-success', response.data)
  } catch (error) {
    console.error('재업로드 실패: ', error)
    alert('계약서 재업로드에 실패했습니다.')
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 420px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.15);
  text-align: center;
  z-index: 1001;
}

.modal-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 12px;
}

.highlight {
  color: #3b82f6;
}

.description {
  margin: 8px 0;
}

.subtext {
  font-size: 12px;
  color: #888;
  margin-bottom: 16px;
}

.reason-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-bottom: 8px;
}

.file-name-area {
  height: 20px;
  font-size: 13px;
  color: #444;
  margin-bottom: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.button-row {
  display: flex;
  justify-content: center;
  gap: 10px;
  align-items: center;
}

.file-button {
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.upload-button {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}
</style>
