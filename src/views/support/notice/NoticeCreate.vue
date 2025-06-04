<template>
  <div class="notice-create-layout">
    <div class="notice-header">
      <h2>공지사항 작성</h2>
      <router-link to="/notices" class="back-btn">← 목록으로</router-link>
    </div>

    <form @submit.prevent="submitNotice" class="notice-form">
      <div class="form-group">
        <label>제목</label>
        <input type="text" v-model="title" required />
      </div>

      <div class="form-group">
        <label>내용</label>
        <div class="editor-wrapper">
          <QuillEditor v-model:content="content" contentType="html" theme="snow" />
        </div>
      </div>

      <div class="form-group">
        <label>공지 대상자</label>
        <div class="selected-list">
          <div
            class="selected-item"
            v-for="user in selectedEmployees"
            :key="user.id"
          >
            {{ user.name }} <span @click="removeUser(user)">✕</span>
          </div>
        </div>
        <button type="button" class="add-btn" @click="openAddModal = true">
          대상 추가
        </button>
      </div>

      <div class="submit-wrap">
        <button type="submit" class="submit-btn">작성하기</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import axios from 'axios'
import { useRouter } from 'vue-router'

const title = ref('')
const content = ref('')
const selectedEmployees = ref([]) // [{ id: 1, name: '홍길동' }, ...]

const openAddModal = ref(false)
const router = useRouter()

const removeUser = (user) => {
  selectedEmployees.value = selectedEmployees.value.filter(u => u.id !== user.id)
}

const submitNotice = async () => {
  try {
    const noticeRes = await axios.post('http://localhost:3001/notices', {
      title: title.value,
      content: content.value,
      employee_id: 2, // 작성자
      created_at: new Date().toISOString()
    })

    const noticeId = noticeRes.data.id
    await Promise.all(
      selectedEmployees.value.map(emp =>
        axios.post('http://localhost:3001/employee_notice', {
          notice_id: noticeId,
          employee_id: emp.id,
          is_checked: false
        })
      )
    )

    alert('공지 등록 완료!')
    router.push('/notices')
  } catch (e) {
    alert('등록 실패!')
    console.error(e)
  }
}
</script>

<style scoped>
.notice-create-layout {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem;
}
.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.back-btn {
  font-size: 0.9rem;
  color: #2d8f65;
  border: 1px solid #2d8f65;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  text-decoration: none;
  transition: 0.2s;
}
.back-btn:hover {
  background-color: #dff3eb;
  color: #1d6b4f;
  border-color: #1d6b4f;
}
.form-group {
  margin-bottom: 1.5rem;
}
label {
  font-weight: bold;
  display: block;
  margin-bottom: 0.5rem;
}
input[type='text'] {
  width: 100%;
  padding: 0.6rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
}
.editor-wrapper {
  width: 100%;
}
:deep(.ql-editor) {
  min-height: 200px;
  padding: 1rem;
  font-size: 1rem;
  line-height: 1.6;
}
.selected-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.selected-item {
  background: #eee;
  border-radius: 4px;
  padding: 0.4rem 0.6rem;
  font-size: 0.9rem;
}
.selected-item span {
  margin-left: 8px;
  color: red;
  cursor: pointer;
}
.add-btn {
  border: 1px solid #999;
  background: #fff;
  padding: 0.5rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
}
.submit-wrap {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}
.submit-btn {
  background-color: #00a86b;
  color: white;
  padding: 0.8rem 1.6rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
}
</style>
