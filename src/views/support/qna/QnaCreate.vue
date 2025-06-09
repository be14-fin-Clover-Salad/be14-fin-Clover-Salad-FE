<template>
  <div class="qna-create-layout">
    <h2>문의사항 작성</h2>

    <form @submit.prevent="submitQna">
      <div class="form-group">
        <label for="title">제목</label>
        <input type="text" id="title" v-model="title" required />
      </div>

      <div class="form-group">
        <label for="content">내용</label>
        <textarea id="content" v-model="content" rows="8" required></textarea>
      </div>

      <div class="btn-wrap">
        <button type="submit" class="btn submit-btn" :disabled="isSubmitting">
          {{ isSubmitting ? '등록 중...' : '등록' }}
        </button>
        <button type="button" class="btn cancel-btn" @click="goBack">취소</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const title = ref('')
const content = ref('')
const isSubmitting = ref(false)
const loginUserId = 8 // 로그인된 사용자 ID

const submitQna = async () => {
  if (!title.value.trim() || !content.value.trim()) {
    alert('제목과 내용을 모두 입력해주세요.')
    return
  }

  isSubmitting.value = true

  const newQna = {
    title: title.value.trim(),
    content: content.value.trim(),
    employee_id: loginUserId,
    status: '대기',
    answer_content: '',
    created_at: new Date().toISOString(),
    is_deleted: false
  }

  try {
    const res = await fetch('http://localhost:3001/qnas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newQna)
    })

    const savedQna = await res.json()

    alert('문의사항이 등록되었습니다.')
    router.push(`/support/qna/${savedQna.id}`) // ✅ 등록 후 해당 QnA 상세 페이지로 이동
  } catch (error) {
    console.error(error)
    alert('등록에 실패했습니다.')
  } finally {
    isSubmitting.value = false
  }
}

const goBack = () => {
  router.push('/support/qna')
}
</script>

<style scoped>
.qna-create-layout {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
}
h2 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}
.form-group {
  margin-bottom: 1.5rem;
}
label {
  font-weight: bold;
  display: block;
  margin-bottom: 0.5rem;
}
input,
textarea {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
}
textarea {
  resize: vertical;
}
.btn-wrap {
  display: flex;
  gap: 1rem;
}
.btn {
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
}
.submit-btn {
  background-color: #e6f7ec;
  color: #1eaf67;
  border: 1px solid #1eaf67;
}
.submit-btn:disabled {
  background-color: #f0f0f0;
  color: #aaa;
  border-color: #ccc;
  cursor: not-allowed;
}
.cancel-btn {
  background-color: #ffeaea;
  color: #cc0000;
  border: 1px solid #cc0000;
}
</style>
