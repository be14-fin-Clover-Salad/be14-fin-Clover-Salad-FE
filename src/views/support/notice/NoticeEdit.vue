<template>
  <div class="notice-create-layout" v-if="!isDeleted">
    <div class="notice-header">
      <h2>공지사항 수정</h2>
      <router-link to="/support/notice" class="back-btn">목록</router-link>
    </div>

    <form @submit.prevent="submitEdit" class="notice-form">
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
          <template v-if="selectedEmployees.length">
            <div class="selected-item" v-for="user in selectedEmployees" :key="user.id">
              {{ user.name }} {{ user.level }} ({{ getDeptName(user.department_id) }})
              <span v-if="user.id !== loginUserId" @click="removeUser(user)">✕</span>
            </div>
          </template>
          <template v-else>
            <div style="font-size: 0.9rem; color: #999;">선택된 대상자가 없습니다.</div>
          </template>
        </div>
        <button type="button" class="add-btn" @click="openAddModal = true">대상 추가</button>
      </div>

      <div class="submit-wrap">
        <button type="submit" class="submit-btn">수정하기</button>
      </div>
    </form>

    <AddTargetModal
      v-if="openAddModal"
      :employees="employees"
      :departments="departments"
      :preselected="selectedEmployees || []"
      :loginUserId="loginUserId"
      @update:selected="updateSelectedEmployees"
      @close="openAddModal = false"
    />
  </div>
  <div v-else class="not-allowed">삭제된 공지는 수정할 수 없습니다.</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { QuillEditor } from '@vueup/vue-quill'
import axios from 'axios'
import AddTargetModal from '@/components/notice/AddTargetModal.vue'

const route = useRoute()
const router = useRouter()
const noticeId = route.params.id
const loginUserId = 8

const title = ref('')
const content = ref('')
const isDeleted = ref(false)
const employeeId = ref(null)

const selectedEmployees = ref([])
const openAddModal = ref(false)
const employees = ref([])
const departments = ref([])

const getDeptName = (deptId) => {
  const dept = departments.value.find(d => Number(d.id) === Number(deptId))
  return dept ? dept.name : ''
}

const updateSelectedEmployees = (list) => {
  selectedEmployees.value = list
}

const removeUser = (user) => {
  selectedEmployees.value = selectedEmployees.value.filter(u => u.id !== user.id)
}

const fetchNotice = async () => {
  const [noticeRes, empRes, deptRes, empNoticeRes] = await Promise.all([
    axios.get(`http://localhost:3001/notices/${noticeId}`),
    axios.get('http://localhost:3001/employees'),
    axios.get('http://localhost:3001/departments'),
    axios.get(`http://localhost:3001/employee_notice?notice_id=${noticeId}`)
  ])

  const data = noticeRes.data
  if (data.is_deleted) {
    isDeleted.value = true
    return
  }

  title.value = data.title
  content.value = data.content
  employeeId.value = data.employee_id

  employees.value = empRes.data
  departments.value = deptRes.data

  const selectedIds = empNoticeRes.data.map(e => e.employee_id)
  selectedEmployees.value = employees.value.filter(emp => selectedIds.includes(emp.id) && emp.id !== loginUserId)
}

const submitEdit = async () => {
  try {
    await axios.put(`http://localhost:3001/notices/${noticeId}`, {
      title: title.value,
      content: content.value,
      employee_id: employeeId.value,
      is_deleted: false,
      created_at: new Date().toISOString() // ✅ 현재 시간으로 덮어쓰기
    })

    const oldNoticeList = await axios.get(`http://localhost:3001/employee_notice?notice_id=${noticeId}`)
    await Promise.all(
      oldNoticeList.data.map(e => axios.delete(`http://localhost:3001/employee_notice/${e.id}`))
    )

    await Promise.all([
      ...selectedEmployees.value.map(emp =>
        axios.post('http://localhost:3001/employee_notice', {
          notice_id: noticeId,
          employee_id: emp.id,
          is_checked: false
        })
      ),
      axios.post('http://localhost:3001/employee_notice', {
        notice_id: noticeId,
        employee_id: loginUserId,
        is_checked: false
      })
    ])

    alert('공지 수정 완료!')
    router.push(`/support/notice/${noticeId}`)
  } catch (e) {
    alert('수정 실패!')
    console.error(e)
  }
}

onMounted(fetchNotice)
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
  width: 98%;
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
  background: #f5f5f5;
  border-radius: 9999px;
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  color: #333;
  display: flex;
  align-items: center;
  box-shadow: 0 0 0 1px #ccc inset;
}
.selected-item span {
  margin-left: 8px;
  color: red;
  cursor: pointer;
  font-weight: bold;
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
.not-allowed {
  max-width: 960px;
  margin: 3rem auto;
  font-size: 1.2rem;
  text-align: center;
  color: #a00;
}
</style>
