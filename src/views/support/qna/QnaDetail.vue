<template>
  <div class="qna-detail-layout" v-if="qna && employees.length">
    <div class="qna-content">
      <button class="back-btn" @click="goBackToList">
        <span class="arrow"></span>목록
      </button>

      <h1 class="qna-title">{{ qna.title }}</h1>

      <div class="qna-info">
        <span>작성자: {{ getEmployeeDisplayName(qna.employee_id) }}</span>
        <span>등록일자: {{ formatDate(qna.created_at) }}</span>
        <span>
          상태:
          <span :class="['status-badge', qna.status === '대기' ? 'waiting' : 'done']">
            {{ qna.status }}
          </span>
        </span>
      </div>

      <div class="qna-box" v-html="qna.content" />

      <!-- 답변 영역 -->
      <div class="qna-answer">
        <h3>답변</h3>

        <!-- 답변이 있을 때 표시 -->
        <div v-if="qna.answer_content && !isEditing" class="answer-box" v-html="qna.answer_content" />

        <!-- 답변 작성 or 수정 폼 -->
        <div v-if="isAdmin && (isEditing || !qna.answer_content)" class="qna-answer-form">
          <textarea v-model="answerContent" rows="6" placeholder="답변 내용을 입력하세요." />
          <div class="btn-wrap">
            <button class="btn answer-btn" @click="submitAnswer">{{ qna.answer_content ? '수정' : '등록' }}</button>
            <button v-if="qna.answer_content" class="btn cancel-btn" @click="cancelEdit">취소</button>
          </div>
        </div>

        <!-- 수정 버튼 -->
        <div v-if="isAdmin && qna.answer_content && !isEditing" class="edit-btn-wrap">
          <button class="btn edit-btn" @click="startEdit">수정하기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const qnaId = Number(route.params.id)

const qna = ref(null)
const employees = ref([])
const answerContent = ref('')
const isEditing = ref(false)
const loginUserId = 8

const loginUser = computed(() =>
  employees.value.find(emp => Number(emp.id) === loginUserId) || {}
)
const isAdmin = computed(() => loginUser.value.name === '관리자')

onMounted(async () => {
  const [qnaRes, empRes] = await Promise.all([
    fetch(`http://localhost:3001/qnas/${qnaId}`),
    fetch(`http://localhost:3001/employees`)
  ])
  qna.value = await qnaRes.json()
  employees.value = await empRes.json()

  if (qna.value?.answer_content) {
    answerContent.value = qna.value.answer_content
  }
})

const getEmployeeDisplayName = (id) => {
  const emp = employees.value.find(e => Number(e.id) === Number(id))
  return emp?.name === '관리자' ? '관리자' : `${emp?.name || '-'} ${emp?.level || ''}`
}
const formatDate = (str) => str?.split('T')[0] || '-'

const goBackToList = () => {
  router.push('/support/qna')
}

const startEdit = () => {
  isEditing.value = true
  answerContent.value = qna.value.answer_content || ''
}

const cancelEdit = () => {
  isEditing.value = false
  answerContent.value = ''
}

const submitAnswer = async () => {
  if (!answerContent.value.trim()) {
    alert('답변 내용을 입력해주세요.')
    return
  }

  await fetch(`http://localhost:3001/qnas/${qnaId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      answer_content: answerContent.value,
      status: '완료'
    })
  })

  alert(qna.value.answer_content ? '답변이 수정되었습니다.' : '답변이 등록되었습니다.')
  router.go(0)
}
</script>

<style scoped>
.qna-detail-layout {
  display: flex;
  justify-content: center;
  padding: 2rem;
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
  transition: all 0.2s ease;
  margin-bottom: 1.2rem;
}
.back-btn:hover {
  background-color: #dff3eb;
  color: #1d6b4f;
  border-color: #1d6b4f;
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
}
.qna-answer-form textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  font-size: 14px;
  resize: vertical;
  border-radius: 6px;
  margin: 0.5rem 0 1rem;
}
.btn-wrap {
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
</style>
