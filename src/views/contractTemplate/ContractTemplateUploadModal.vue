<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="emitClose">
    <div class="modal-content">
      <h2 class="modal-title">{{ editMode ? '양식 수정' : '양식 등록' }}</h2>
      <div class="upload-box">
        <p class="upload-instruction">계약서 양식을 업로드해 주세요!</p>
        <p class="upload-subtext">PDF 형식만 업로드 가능합니다.</p>

        <label class="upload-label">
          <input type="file" accept="application/pdf" @change="handleFileChange" hidden />
          <span class="upload-button">파일 업로드</span>
        </label>

        <p v-if="selectedFile" class="file-name">선택된 파일: {{ selectedFile.name }}</p>

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

        <button class="submit-button" @click="submitUpload" :disabled="isSubmitting">
          {{ isSubmitting ? '처리중…' : (editMode ? '수정' : '등록') }}
        </button>
      </div>
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
const localMeta    = reactive({ name: '', description: '' })
const isSubmitting = ref(false)

// 모달이 열릴 때마다(= isOpen=true) editMode가 아니면 폼 초기화
watch(() => props.isOpen, open => {
  if (open && !props.editMode) {
    selectedFile.value = null
    localMeta.name = ''
    localMeta.description = ''
    isSubmitting.value = false
  }
})

// editMode일 때만 initialData로 값 채워주기
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
  position: fixed; top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999;
}
.modal-content {
  background: #fff; border-radius: 12px; padding: 24px;
  width: 480px; max-width: 90%; box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}
.modal-title { font-size: 20px; font-weight: bold; margin-bottom: 20px }
.upload-box { text-align: center }
.upload-instruction { font-weight: bold }
.upload-subtext { font-size: 13px; color: #777 }
.upload-label { display: inline-block; margin-top: 16px; cursor: pointer }
.upload-button {
  padding: 10px 16px; background: #1976d2; color: #fff; border-radius: 6px;
}
.file-name { margin-top: 12px; font-size: 14px }
.form-meta {
  margin-top: 20px; display: flex; flex-direction: column; gap: 8px;
}
.input-field {
  padding: 8px; border: 1px solid #ddd; border-radius: 4px; width: 100%;
}
.submit-button {
  margin-top: 20px; padding: 10px 20px;
  background: #388e3c; color: #fff; border: none; border-radius: 6px;
  cursor: pointer;
}
.submit-button:disabled {
  background: #999; cursor: not-allowed;
}
</style>
