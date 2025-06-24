<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="emitClose">
    <div class="modal-box">
      <!-- 1) 모달 타이틀 -->
      <h2 class="modal-title">양식 상세</h2>

      <!-- 2) 썸네일 또는 PDF 미리보기 -->
      <div class="preview-box">
        <!-- 썸네일 이미지가 있으면 -->
        <img
          v-if="thumbnailSrc"
          :src="thumbnailSrc"
          alt="양식 썸네일"
          class="preview-image"
        />
        <!-- 아니면 PDF 첫 페이지 iframe -->
        <iframe
          v-else
          :src="fileSrc + '#page=1&zoom=100'" 
          frameborder="0"
          class="preview-pdf"
        ></iframe>
      </div>

      <!-- 3) 다운로드 버튼 (클릭 시 다운로드) -->
      <div class="download-row">
        <a
          :href="fileSrc"
          download
          class="download-button"
        >
          PDF 다운로드
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  template: {
    type: Object,
    required: true
    // { uploadFilePath: string, thumbnailPath?: string }
  }
})
const emit = defineEmits(['close'])
const emitClose = () => emit('close')

// S3 베이스 URL (환경에 맞게 조정)
const S3_BASE = 'https://saladerp-bucket.s3.ap-northeast-2.amazonaws.com/'

// 전체 PDF URL 계산
const fileSrc = computed(() => {
  const p = props.template.uploadFilePath
  if (!p) return ''
  return p.startsWith('http') ? p : S3_BASE + p
})
// 썸네일 URL 계산
const thumbnailSrc = computed(() => {
  const t = props.template.thumbnailPath
  if (!t) return ''
  return t.startsWith('http') ? t : S3_BASE + t
})
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
}
.modal-box {
  background: #fff;
  border-radius: 8px;
  padding: 0;
  width: 80vw;  max-width: 900px;
  height: 90vh;
  display: flex; flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}
.modal-title {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  padding: 12px 0;
  border-bottom: 1px solid #ddd;
  margin: 0;
}

/* 2) 썸네일 또는 PDF 미리보기 */
.preview-box {
  flex: 1;
  overflow: hidden;
}
.preview-image,
.preview-pdf {
  width: 100%;
  height: 100%;
  object-fit: contain; /* 이미지 비율 유지 */
}

/* 3) 다운로드 버튼 */
.download-row {
  padding: 12px;
  text-align: center;
  background: #f9f9f9;
  border-top: 1px solid #ddd;
}
.download-button {
  display: inline-block;
  padding: 8px 24px;
  background: #1976d2;
  color: #fff;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
}
.download-button:hover {
  background: #125ba1;
}
</style>
