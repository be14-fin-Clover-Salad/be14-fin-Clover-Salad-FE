<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="emitClose">
    <div class="modal-content">
      <h2 class="modal-title">사진 업로드</h2>
      <div class="upload-box">
        <p class="upload-instruction">해당 제품에 해당하는 사진을 첨부해 주세요!</p>
        <p class="upload-subtext"></p>
        <label class="upload-label">
          <input type="file" accept="image/png, image/jpeg" @change="handleFileChange" hidden />
          <span class="upload-button">사진 업로드</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import api from '@/api/auth.js'

const props = defineProps({ isOpen: Boolean })
const emit = defineEmits(['close', 'upload-success'])

const emitClose = () => emit('close')

const handleFileChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  try {
    console.log(formData);
    // 아직 api 없음
    const response = await api.post('/api/product/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    })
    emit('upload-success', response.data) // 업로드 성공 시 생성된 이미지 id와 경로를 전달
  } catch (err) {
    alert('업로드 실패')
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

.upload-label {
  display: inline-block;
  margin-top: 16px;
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
</style>
