<template>
  <div class="notice-create-layout">
    <div class="notice-header">
      <h2>공지사항 작성</h2>
      <router-link to="/support/notice" class="back-btn">목록</router-link>
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
            {{ user.name }} {{ user.level }} ({{ user.departmentName || getDeptName(user.departmentId) }})
            <span @click="removeUser(user)">✕</span>
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

    <AddTargetModal
      v-if="openAddModal"
      :employees="employees"
      :departments="departments"
      :preselected="selectedEmployees"
      :loginUserId="loginUserId"
      @update:selected="updateSelectedEmployees"
      @close="openAddModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { QuillEditor } from '@vueup/vue-quill'
import axios from 'axios'
import AddTargetModal from '@/components/notice/AddTargetModal.vue'
import { useAuthStore } from '@/stores/auth'

const title = ref('')
const content = ref('')
const selectedEmployees = ref([])
const openAddModal = ref(false)
const employees = ref([])
const departments = ref([])

const router = useRouter()
const authStore = useAuthStore()

const loginUser = computed(() => authStore.userInfo || {})
const loginUserId = computed(() => loginUser.value?.id ?? loginUser.value?.code ?? null)

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

onMounted(async () => {
   console.log('🧾 authStore.userInfo:', authStore.userInfo);
  console.log('🧾 loginUserId:', loginUserId);
  try {
    const [empRes, deptRes] = await Promise.all([
      axios.post('http://localhost:8080/employee/search', {}),
      axios.get('http://localhost:8080/department/hierarchy')
    ])
    employees.value = empRes.data
    departments.value = deptRes.data
  } catch (e) {
    alert('데이터 조회 실패')
    console.error('❌ 초기 로딩 실패:', e)
  }
})

const submitNotice = async () => {
  console.log('🚨 제출 시점 loginUserId:', loginUserId.value);
  console.log('🚨 선택된 대상자:', selectedEmployees.value);

  if (!loginUserId.value) {
    alert('로그인 유저 정보 없음')
    return
  }

  try {
    const employeeIds = selectedEmployees.value.map(emp => emp.id)

    await axios.post('http://localhost:8080/support/notice/create', {
      title: title.value,
      content: content.value,
      targetEmployeeId: [...employeeIds, loginUserId.value]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })

    alert('공지 등록 완료!')
    router.push('/support/notice')
  } catch (e) {
    alert('공지 등록 실패!')
    console.error('❌ 등록 실패:', e)
  }
}
</script>

<style scoped>
/* 그대로 유지 */
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
</style>
