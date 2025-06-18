<template>
  <div class="qna-detail-layout" v-if="qna">
    <div class="qna-content">
      <!-- 목록 버튼 -->
      <button class="back-btn" @click="goBackToList">
        <span class="arrow"></span>목록
      </button>

      <!-- 삭제 안내 배너 -->
      <div v-if="qna.isDeleted" class="deleted-banner">
        🗑 삭제된 게시글입니다.
      </div>

      <!-- 제목 -->
      <div v-if="isWriter && isEditing">
        <input v-model="editTitle" class="edit-title" />
      </div>
      <h1 v-else class="qna-title">{{ qna.title }}</h1>

      <!-- 작성 정보 -->
      <div class="qna-info">
        <span>
          작성자:
          <template v-if="qna.writerName">{{ qna.writerName }}</template>
          <template v-if="qna.writerLevel"> {{ qna.writerLevel }}</template>
          <template v-if="qna.departmentName"> ({{ qna.departmentName }})</template>
        </span>
        <span>등록일자: {{ formatDate(qna.createdAt) }}</span>
        <span>
          상태:
          <span :class="['status-badge', qna.answerStatus === '대기' ? 'waiting' : 'done']">
            {{ qna.answerStatus }}
          </span>
        </span>
      </div>

      <!-- 본문 -->
      <div v-if="isWriter && isEditing">
        <textarea v-model="editContent" class="edit-content" rows="8" />
      </div>
      <div v-else class="qna-box">{{ qna.content }}</div>

      <!-- 작성자 수정 버튼 -->
      <div v-if="!qna.isDeleted && isWriter && !qna.answerContent" class="edit-btn-wrap">
        <div class="btn-wrap-between">
          <div class="left-buttons">
            <button v-if="!isEditing" class="btn edit-btn" @click="startEdit">수정하기</button>
            <button v-else class="btn answer-btn" @click="submitEdit">저장</button>
            <button v-if="isEditing" class="btn cancel-btn" @click="cancelEdit">취소</button>
          </div>
          <button class="btn delete-btn" @click="deleteQna">삭제하기</button>
        </div>
      </div>

      <!-- 답변 영역 -->
      <div class="qna-answer" v-if="qna.answerContent || isAdmin">
        <h3>답변</h3>
        <div v-if="qna.answerContent && !isEditingAnswer" class="answer-box">
          {{ qna.answerContent }}
        </div>
        <div v-if="!qna.isDeleted && isAdmin && (isEditingAnswer || !qna.answerContent)" class="qna-answer-form">
          <textarea v-model="answerContent" rows="6" placeholder="답변 내용을 입력하세요." />
          <div class="btn-wrap-between">
            <div class="left-buttons">
              <button class="btn answer-btn" @click="submitAnswer">
                {{ qna.answerContent ? '수정' : '등록' }}
              </button>
              <button v-if="qna.answerContent" class="btn cancel-btn" @click="cancelAnswerEdit">취소</button>
            </div>
            <button class="btn delete-btn" @click="deleteQna">삭제하기</button>
          </div>
        </div>
        <div v-if="!qna.isDeleted && (isAdmin || isWriter) && qna.answerContent && !isEditingAnswer" class="edit-btn-wrap">
          <div class="btn-wrap-between">
            <div class="left-buttons">
              <button v-if="isAdmin" class="btn edit-btn" @click="startAnswerEdit">수정하기</button>
            </div>
            <button class="btn delete-btn" @click="deleteQna">삭제하기</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axios from '@/api/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const accessToken = authStore.accessToken
const loginUserId = authStore.userId

const qnaId = Number(route.params.id)

const qna = ref(null)
const answerContent = ref('')
const editTitle = ref('')
const editContent = ref('')
const isEditing = ref(false)
const isEditingAnswer = ref(false)

const userInfo = computed(() => authStore.userInfo || null)
const isAdmin = computed(() =>
  userInfo.value?.roles?.includes('ROLE_ADMIN') ||
  userInfo.value?.name === '관리자'
)
const isWriter = computed(() => qna.value && Number(qna.value.writerId) === Number(loginUserId))

const fetchQna = async () => {
  try {
    const { data } = await axios.get(`/support/qna/${qnaId}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    qna.value = data
    answerContent.value = data?.answerContent || ''
    editTitle.value = data?.title || ''
    editContent.value = data?.content || ''
  } catch (e) {
    console.error('QNA 상세 데이터 조회 실패:', e)
  }
}

onMounted(fetchQna)

const formatDate = (str) => str?.split('T')[0] || '-'
const goBackToList = () => router.push('/support/qna')

const startEdit = () => isEditing.value = true
const cancelEdit = () => isEditing.value = false

const submitEdit = async () => {
  if (!editTitle.value.trim() || !editContent.value.trim()) {
    alert('제목과 내용을 모두 입력해주세요.');
    return;
  }
  await axios.patch(`/support/qna/${qnaId}`, {
    title: editTitle.value,
    content: editContent.value
  }, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  alert('문의사항이 수정되었습니다.')
  isEditing.value = false
  await fetchQna()
}

const startAnswerEdit = () => isEditingAnswer.value = true
const cancelAnswerEdit = () => isEditingAnswer.value = false

const submitAnswer = async () => {
  if (!answerContent.value.trim()) {
    alert('답변 내용을 입력해주세요.')
    return
  }
  await axios.patch(`/support/qna/${qnaId}/answer`, {
    answerContent: answerContent.value,
    status: '완료'
  }, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  alert(qna.value.answerContent ? '답변이 수정되었습니다.' : '답변이 등록되었습니다.')
  await fetchQna()
  isEditingAnswer.value = false
}

const deleteQna = async () => {
  if (!confirm('정말로 삭제하시겠습니까?')) return
  await axios.patch(`/support/qna/${qnaId}/delete`, {}, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  alert('게시글이 삭제되었습니다.')
  router.push('/support/qna')
}
</script>

<style scoped>
/* 기존 스타일 유지 */
.qna-detail-layout {
  display: flex;
  justify-content: center;
  padding: 2rem;
}
.qna-title.deleted {
  font-size: 1.4rem;
  font-weight: bold;
  color: #cc0000;
  text-align: center;
  margin: 2rem 0;
}
.qna-content {
  max-width: 800px;
  width: 100%;
}
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0.4rem 0.8rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: #2d8f65;
  background-color: transparent;
  border: 1px solid #2d8f65;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 1.2rem;
}
.back-btn:hover {
  background-color: #dff3eb;
}
.qna-title {
  font-size: 1.6rem;
  font-weight: bold;
  margin-bottom: 1rem;
}
.qna-info {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1.5rem;
}
.qna-box {
  padding: 1.2rem;
  background: #fdfdfd;
  border: 1px solid #ddd;
  border-radius: 6px;
  line-height: 1.6;
  white-space: pre-wrap;
}
.qna-answer {
  margin-top: 2rem;
}
.qna-answer h3 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #2e7d32;
}
.answer-box {
  border: 1px solid #c8e6c9;
  background-color: #f1fef3;
  padding: 1rem;
  border-radius: 6px;
  line-height: 1.6;
  white-space: pre-wrap;
}
.qna-answer-form textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  font-size: 14px;
  resize: vertical;
  border-radius: 6px;
  margin: 0.5rem 0 1rem;
  white-space: pre-wrap;
}
.btn-wrap-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.left-buttons {
  display: flex;
  gap: 0.5rem;
}
.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
}
.answer-btn {
  background-color: #e6f7ec;
  color: #1eaf67;
  border: 1px solid #1eaf67;
}
.answer-btn:hover {
  background-color: #d3f0e0;
}
.cancel-btn {
  background-color: #fbe6e6;
  color: #d11a2a;
  border: 1px solid #d11a2a;
}
.cancel-btn:hover {
  background-color: #f5cfcf;
}
.edit-btn-wrap {
  margin-top: 0.5rem;
}
.edit-btn {
  background-color: #e6f7ec;
  color: #1eaf67;
  border: 1px solid #1eaf67;
  padding: 0.5rem 1rem;
  border-radius: 6px;
}
.edit-btn:hover {
  background-color: #cfe2f8;
}
.delete-btn {
  background-color: #ffeaea;
  color: #cc0000;
  border: 1px solid #cc0000;
}
.delete-btn:hover {
  background-color: #ffdada;
}
.status-badge {
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}
.status-badge.waiting {
  background-color: #fff0f0;
  color: #e53935;
  border: 1px solid #e53935;
}
.status-badge.done {
  background-color: #e6f4ea;
  color: #43a047;
  border: 1px solid #43a047;
}
.deleted-banner {
  background-color: #fff0f0;
  border: 1px dashed #d11a2a;
  color: #d11a2a;
  padding: 12px;
  text-align: left;
  border-radius: 8px;
  font-weight: bold;
  margin-bottom: 1.5rem;
}
.edit-title,
.edit-content {
  width: 100%;
  padding: 0.6rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  margin-bottom: 1rem;
}
</style>
