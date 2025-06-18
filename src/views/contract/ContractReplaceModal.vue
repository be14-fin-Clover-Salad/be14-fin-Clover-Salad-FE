<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="emitClose">
    <div class="modal-content">
      <h2 class="modal-title">계약서 재업로드</h2>
      <div class="upload-box">
        <p class="upload-instruction">
          계약 <strong>{{ contract.code }}</strong>에 대한 계약서를 새로 업로드해 주세요.
        </p>
        <p class="upload-subtext">PDF 형식의 전자 계약서만 가능합니다.</p>

        <input
          v-model="note"
          class="note-input"
          type="text"
          placeholder="변경 사유를 입력하세요"
        />

        <div class="file-control">
          <label class="upload-label">
            <input type="file" accept="application/pdf" @change="handleFileChange" hidden />
            <span class="upload-button">PDF 파일 선택</span>
          </label>
          <span class="selected-file" v-if="selectedFileName">{{ selectedFileName }}</span>
        </div>

        <button class="submit-button" @click="submitUpload">업로드 시작</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/api/auth'

const props = defineProps({
  isOpen: Boolean,
  contract: Object
})
const emit = defineEmits(['close', 'replace-success'])

const emitClose = () => emit('close')

const note = ref('')
const selectedFile = ref(null)
const selectedFileName = ref('')

// 모달 열릴때 초기화
watch(() => props.isOpen, (val) => {
  if (val) {
    note.value = ''
    selectedFile.value = null
    selectedFileName.value = ''
  }
})

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    selectedFile.value = file
    selectedFileName.value = file.name
  }
}

const submitUpload = async () => {
  if (!note.value.trim()) {
    alert('변경 사유를 입력해 주세요.')
    return
  }
  if (!selectedFile.value) {
    alert('PDF 파일을 선택해 주세요.')
    return
  }

  const formData = new FormData()
  formData.append('file', selectedFile.value)
  formData.append('note', note.value)

  try {
    const token = useAuthStore().accessToken
    const res = await api.patch(
      `/api/command/contract/replace/${props.contract.id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      }
    )
    emit('replace-success', res.data)
  } catch (err) {
    alert('재업로드 실패')
    console.error(err)
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  border-radius: 10px;
  padding: 40px;
  width: 400px;
}
.upload-box {
  border: 2px dashed #8e8eff;
  padding: 40px 20px;
  text-align: center;
  border-radius: 8px;
}
.upload-instruction {
  font-weight: bold;
  font-size: 16px;
}
.upload-subtext {
  font-size: 13px;
  color: #aaa;
  margin-top: 6px;
}
.note-input {
  width: 100%;
  padding: 8px;
  margin-top: 14px;
  border-radius: 4px;
  border: 1px solid #ccc;
}
.file-control {
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
}
.upload-label {
  display: inline-block;
}
.upload-button {
  border: 1px solid #4791ff;
  padding: 6px 14px;
  border-radius: 4px;
  color: #4791ff;
  cursor: pointer;
  transition: 0.2s;
}
.upload-button:hover {
  background-color: #e6f0ff;
}
.selected-file {
  font-size: 13px;
  color: #444;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.submit-button {
  margin-top: 20px;
  background-color: #4791ff;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.submit-button:hover {
  background-color: #317ae0;
}
</style>
