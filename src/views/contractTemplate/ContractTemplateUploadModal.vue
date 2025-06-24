<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="emitClose">
    <div class="modal-content">
      <!-- 1) 타이틀 -->
      <h2 class="modal-title">{{ editMode ? '양식 수정' : '양식 등록' }}</h2>

      <!-- 2) 안내문 (텍스트만) -->
      <div class="upload-instruction-box">
        <p class="upload-instruction">계약서 양식을 업로드해 주세요!</p>
        <p class="upload-subtext">PDF 형식만 업로드 가능합니다.</p>
      </div>

      <!-- 3) 입력란 -->
      <div class="form-meta">
        <input
          type="text"
          placeholder="양식 이름"
          v-model="localMeta.name"
          class="input-field"
        />
        <input
          type="text"
          placeholder="설명"
          v-model="localMeta.description"
          class="input-field"
        />
      </div>

      <!-- 4) 버튼들: 파일 업로드 + 등록/수정 -->
      <div class="controls">
        <!-- 파일 업로드 -->
        <label class="upload-label">
          <input type="file" accept="application/pdf" @change="handleFileChange" hidden />
          <span class="upload-button">파일 업로드</span>
        </label>
        <!-- 등록/수정 -->
        <button
          class="submit-button"
          @click="submitUpload"
          :disabled="isSubmitting || (!selectedFile && !editMode)"
        >
          {{ isSubmitting ? '처리중…' : (editMode ? '수정' : '등록') }}
        </button>
      </div>

      <!-- 5) 파일명 표시(선택 시) -->
      <p v-if="selectedFile" class="file-name">선택된 파일: {{ selectedFile.name }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import api from '@/api/auth'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  isOpen: Boolean,
  editMode: Boolean,
  initialData: {
    type: Object,
    default: () => ({})
  }
})
const emit = defineEmits(['close', 'upload-success'])

const selectedFile = ref(null)
const localMeta = reactive({ name: '', description: '' })
const isSubmitting = ref(false)

// 모달 열릴 때 초기화
watch(() => props.isOpen, open => {
  if (open && !props.editMode) {
    selectedFile.value = null
    localMeta.name = ''
    localMeta.description = ''
    isSubmitting.value = false
  }
})

// 수정 모드일 때 초기값 세팅
watch(() => props.initialData, data => {
  if (props.editMode && data) {
    localMeta.name = data.name || ''
    localMeta.description = data.description || ''
    selectedFile.value = null
  }
}, { immediate: true })

function handleFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  selectedFile.value = file
  if (!props.editMode) {
    localMeta.name ||= file.name.replace(/\.pdf$/i, '')
    localMeta.description ||= '계약서 양식 설명란입니다'
  }
}

async function submitUpload() {
  if (!selectedFile.value && !props.editMode) {
    alert('파일을 선택해주세요.')
    return
  }
  isSubmitting.value = true

  const token = useAuthStore().accessToken
  const formData = new FormData()
  if (selectedFile.value) {
    formData.append('file', selectedFile.value)
  }
  formData.append('meta', new Blob([JSON.stringify({
    name: localMeta.name,
    description: localMeta.description
  })], { type: 'application/json' }))

  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    }
    let res
    if (props.editMode && props.initialData.id) {
      res = await api.patch(
        `/api/command/documentTemplate/${props.initialData.id}`,
        formData,
        config
      )
    } else {
      res = await api.post(
        '/api/command/documentTemplate/upload',
        formData,
        config
      )
    }
    alert('업로드 성공!')
    emit('upload-success', res.data)
    emit('close')
  } catch (err) {
    console.error(err)
    alert('업로드 실패: ' + (err.response?.data?.message || err.message))
  } finally {
    isSubmitting.value = false
  }
}

function emitClose() {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999;
}
.modal-content {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  width: 480px; max-width: 90%;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}
.modal-title {
  font-size: 20px; font-weight: bold;
  margin-bottom: 16px;
}
.upload-instruction-box {
  text-align: center;
  margin-bottom: 16px;
}
.upload-instruction {
  font-weight: bold;
}
.upload-subtext {
  font-size: 13px; color: #777;
  margin-top: 4px;
}
.form-meta {
  display: flex; flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}
.input-field {
  padding: 8px; border: 1px solid #ddd;
  border-radius: 4px; width: 100%;
  box-sizing: border-box;
}
.controls {
  display: flex; justify-content: center;
  align-items: center; gap: 16px;
  margin-bottom: 12px;
}
.upload-button {
  padding: 10px 16px;
  background: #1976d2; color: #fff;
  border-radius: 6px; cursor: pointer;
}
.submit-button {
  padding: 10px 20px;
  background: #388e3c; color: #fff;
  border: none; border-radius: 6px;
  cursor: pointer;
}
.submit-button:disabled {
  background: #999; cursor: not-allowed;
}
.file-name {
  text-align: center; font-size: 14px;
  margin-top: 8px;
}
</style>
