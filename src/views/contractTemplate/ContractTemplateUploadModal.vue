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

        <button class="submit-button" @click="submitUpload">
          {{ editMode ? '수정' : '등록' }}
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
const localMeta = reactive({
  name: '',
  description: ''
})

watch(() => props.initialData, (val) => {
  if (val) {
    localMeta.name = val.name || ''
    localMeta.description = val.description || ''
  }
}, { immediate: true })

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  selectedFile.value = file

  // 기본 이름 자동 세팅
  if (!props.editMode) {
    localMeta.name ||= file.name.replace(/\.pdf$/i, '')
    localMeta.description ||= '계약서 양식 설명란입니다'
  }
}

const submitUpload = async () => {
  console.log('editMode:', props.editMode)
  console.log('initialData.id:', props.initialData?.id)
  if (!selectedFile.value && !props.editMode) {
    alert('파일을 선택해주세요.')
    return
  }

  const token = useAuthStore().accessToken
  const formData = new FormData()

  if (selectedFile.value) {
    formData.append('file', selectedFile.value)
  }

  const meta = {
    name: localMeta.name,
    description: localMeta.description
  }

  formData.append('meta', new Blob([JSON.stringify(meta)], {
    type: 'application/json'
  }))

  try {
    let res
    if (props.editMode && typeof props.initialData?.id === 'number') {
      res = await api.patch(`/api/command/documentTemplate/${props.initialData.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      })
    } else {
      res = await api.post('/api/command/documentTemplate/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      })
    }

    alert('업로드 성공!')
    emit('upload-success', res.data)
    emit('close')
  } catch (err) {
    alert('업로드 실패')
    console.error(err)
  }
}

const emitClose = () => {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  z-index: 9999;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  z-index: 10000;
  width: 480px;
}
.modal-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
}
.upload-box {
  text-align: center;
}
.upload-instruction {
  font-weight: bold;
}
.upload-subtext {
  font-size: 13px;
  color: #777;
}
.upload-label {
  display: inline-block;
  margin-top: 16px;
  cursor: pointer;
}
.upload-button {
  padding: 10px 16px;
  background-color: #1976d2;
  color: white;
  border-radius: 6px;
  display: inline-block;
}
.file-name {
  margin-top: 12px;
  font-size: 14px;
}
.form-meta {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.input-field {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.submit-button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #388e3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>
