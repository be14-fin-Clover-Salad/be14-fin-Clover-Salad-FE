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
            <div
              class="selected-item"
              v-for="user in visibleEmployees"
              :key="user.id"
            >
              {{ user.name }} {{ user.level }} ({{ user.departmentName || getDeptName(user.departmentId || user.department_id) }})
              <span v-if="user.id !== loginUserId" @click="removeUser(user)">✕</span>
            </div>
            <button
              v-if="selectedEmployees.length > maxVisible"
              class="show-more-btn"
              type="button"
              @click="showAll = !showAll"
            >
              {{ showAll ? '접기' : `+${selectedEmployees.length - maxVisible} 더보기` }}
            </button>
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
      :preselected="selectedEmployees"
      :loginUserId="loginUserId"
      @update:selected="updateSelectedEmployees"
      @close="openAddModal = false"
    />
  </div>
  <div v-else class="not-allowed">삭제된 공지는 수정할 수 없습니다.</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { QuillEditor } from '@vueup/vue-quill'
import api from '@/api/auth'
import AddTargetModal from '@/components/notice/AddTargetModal.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const noticeId = route.params.id
const authStore = useAuthStore()

const loginUser = ref({})
const loginUserId = ref(null)
const accessToken = ref('')

const title = ref('')
const content = ref('')
const isDeleted = ref(false)
const isSubmitting = ref(false)

const selectedEmployees = ref([])
const selectedDepartments = ref([])
const openAddModal = ref(false)
const employees = ref([])
const departments = ref([])

const maxVisible = 20
const showAll = ref(false)
const visibleEmployees = computed(() => {
  if (showAll.value || selectedEmployees.value.length <= maxVisible)
    return selectedEmployees.value
  return selectedEmployees.value.slice(0, maxVisible)
})

const getDeptName = (deptId) => {
  const dept = departments.value.find(d => String(d.id) === String(deptId))
  return dept ? dept.name : ''
}

const updateSelectedEmployees = (list) => {
  selectedEmployees.value = list
  if (selectedEmployees.value.length <= maxVisible) showAll.value = false
}

const removeUser = (user) => {
  selectedEmployees.value = selectedEmployees.value.filter(u => u.id !== user.id)
  if (selectedEmployees.value.length <= maxVisible) showAll.value = false
}

const fetchNotice = async () => {
  try {
    const headers = {
      Authorization: `Bearer ${authStore.accessToken}`
    }

    const [noticeRes, empRes, deptRes] = await Promise.all([
      api.get(`/support/notice/${noticeId}`, { headers }),
      api.post('/employee/search', {}, { headers }),
      api.get('/department/hierarchy', { headers })
    ])

    const data = noticeRes.data

    if (data.isDeleted) {
      isDeleted.value = true
      return
    }

    title.value = data.title
    content.value = data.content
    employees.value = empRes.data
    departments.value = deptRes.data

    const checkList = data.checkList || []
    const matched = checkList
      .map(e => employees.value.find(emp => emp.id === e.employeeId))
      .filter(Boolean)

    selectedEmployees.value = matched
  } catch (e) {
    console.error('❌ 공지사항 불러오기 실패:', e)
  }
}

const submitEdit = async () => {
  if (!title.value.trim() || !content.value.trim()) {
    alert('제목과 내용을 모두 입력해주세요.')
    return
  }

  isSubmitting.value = true

  try {
    await api.put(`/support/notice/edit/${noticeId}`, {
      title: title.value.trim(),
      content: content.value.trim(),
      targetDepartments: selectedDepartments.value,
      targetEmployees: selectedEmployees.value
    }, {
      headers: { Authorization: `Bearer ${authStore.accessToken}` }
    })
    
    alert('공지사항이 수정되었습니다.')
    router.push(`/support/notice/${noticeId}`)
  } catch (error) {
    console.error('수정 실패:', error)
    alert('수정에 실패했습니다.')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  if (authStore.userInfo?.id) {
    loginUser.value = authStore.userInfo
    loginUserId.value = authStore.userInfo.id
    accessToken.value = authStore.accessToken
  }
  fetchNotice()
})
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
  align-items: flex-start;
  position: relative;
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
.show-more-btn {
  background: #f2fbf2;
  color: #00a86b;
  font-weight: 600;
  border: 1px solid #a5d6b2;
  border-radius: 999px;
  font-size: 0.93rem;
  padding: 0.34rem 1.1rem;
  cursor: pointer;
  margin-left: 0.4rem;
  margin-top: 0.16rem;
  height: 2.1rem;
  transition: background 0.16s, color 0.16s;
}
.show-more-btn:hover {
  background: #e1f6ea;
  color: #007744;
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
