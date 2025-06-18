<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="emitClose">
    <div class="modal-content">
      <h2 class="modal-title">계약서 등록</h2>
      <div class="upload-box">
        <p class="upload-instruction">해당 계약에 해당하는 계약서를 첨부해 주세요!</p>
        <p class="upload-subtext">PDF 형식의 전자 계약서만 업로드 가능합니다.</p>
        <label class="upload-label">
          <input type="file" accept="application/pdf" @change="handleFileChange" hidden />
          <span class="upload-button">파일 업로드</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import api from '@/api/auth'

const props = defineProps({ isOpen: Boolean })
const emit = defineEmits(['close', 'upload-success'])

const emitClose = () => emit('close')

const handleFileChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  try {
    const token = useAuthStore().accessToken
    const res = await api.post('/api/command/contract/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    })
    emit('upload-success', res.data) // 업로드 성공시 계약 데이터 전달
  } catch (err) {
    alert('업로드 실패')
    console.error(err)
  }
}
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: white; border-radius: 10px; padding: 40px; width: 400px; }
.upload-box { border: 2px dashed #8e8eff; padding: 40px 20px; text-align: center; border-radius: 8px; }
.upload-instruction { font-weight: bold; font-size: 16px; }
.upload-subtext { font-size: 13px; color: #aaa; margin-top: 6px; }
.upload-label { display: inline-block; margin-top: 16px; }
.upload-button {
  border: 1px solid #4791ff; padding: 6px 14px; border-radius: 4px;
  color: #4791ff; cursor: pointer; transition: 0.2s;
}
.upload-button:hover { background-color: #e6f0ff; }
</style>
