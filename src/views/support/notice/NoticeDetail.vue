<template>
  <div v-if="notice">
    <div v-if="!notice.isDeleted || isAdmin" class="notice-detail-layout">
      <div class="notice-content">
        <button class="back-btn" @click="goBackToList">
          <span class="arrow"></span>목록
        </button>

        <div v-if="notice.isDeleted" class="deleted-banner">
          🗑 이 공지는 삭제된 상태입니다.
        </div>

        <h1 class="notice-title">{{ notice.title }}</h1>
        <div class="notice-info">
          <span>작성자: {{ notice.writerName }} {{ notice.writerLevel }}</span>
          <span>등록일자: {{ formatDate(notice.createdAt) }}</span>
        </div>
        <div class="notice-box" v-html="notice.content"></div>

        <div class="btn-wrap">
          <button
            v-if="canEditOrDelete && !notice.isDeleted"
            class="btn edit-btn"
            @click="goEditPage"
          >
            수정
          </button>
          <button
            v-if="canEditOrDelete && !notice.isDeleted"
            class="btn delete-btn"
            @click="deleteNotice"
          >
            삭제
          </button>
          <button
            v-if="!canEditOrDelete"
            class="btn check-btn"
            :disabled="alreadyChecked"
            @click="confirmCheck"
          >
            {{ alreadyChecked ? "✔ 확인 완료" : "✅ 확인하기" }}
          </button>
        </div>
      </div>

      <div class="sidebar-area">
        <div class="notice-sidebar">
          <h3>확인자 목록</h3>
          <input type="text" v-model="searchKeyword" placeholder="검색" class="search-input" />
          <ul class="checklist">
            <li
              v-for="entry in filteredCheckList"
              :key="entry.employeeId"
              :class="{
                checked: entry.isChecked,
                currentUser: Number(entry.employeeId) === Number(loginUserId)
              }"
            >
              <span>{{ entry.employeeName }} {{ entry.employeeLevel }}</span>
              <span>{{ entry.isChecked ? "✅" : "❌" }}</span>
            </li>
          </ul>
        </div>

        <div class="add-target-wrap">
          <button class="add-target-btn" @click="openAddTargetModal">+ 대상 추가</button>
        </div>
      </div>
    </div>

    <div v-else class="not-allowed">해당 공지에 가입할 수 없습니다.</div>

    <AddTargetModal
      v-if="isAddTargetOpen"
      :departments="departments"
      :employees="employees"
      :preselected="checkList"
      :loginUserId="loginUserId"
      @update:selected="handleTargetUpdate"
      @close="closeAddTargetModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axios from '@/api/auth'
import AddTargetModal from '@/components/notice/AddTargetModal.vue'

const route = useRoute()
const router = useRouter()
const noticeId = route.params.id

const authStore = useAuthStore()
const accessToken = computed(() => authStore.accessToken || '')
const loginUser = computed(() => authStore.userInfo || {})
const loginUserId = computed(() => authStore.userInfo?.id || null)

const notice = ref(null)
const checkList = ref([])
const searchKeyword = ref('')
const isAddTargetOpen = ref(false)
const departments = ref([])
const employees = ref([])

const isAdmin = computed(() =>
  loginUser.value?.roles?.includes('ROLE_ADMIN') || loginUser.value?.name === '관리자'
)

const canEditOrDelete = computed(() =>
  isAdmin.value || Number(notice.value?.writerId) === loginUserId.value
)

const alreadyChecked = computed(() => {
  const entry = checkList.value.find(e => Number(e.employeeId) === loginUserId.value)
  return entry ? !!entry.isChecked : false
})

const formatEmployeeLabel = id => {
  const entry = checkList.value.find(e => Number(e.employeeId) === Number(id))
  return entry ? `${entry.employeeName} ${entry.employeeLevel || ''}`.trim() : '-'
}

const filteredCheckList = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  return checkList.value
    .slice()
    .sort((a, b) => b.isChecked - a.isChecked)
    .filter(entry => formatEmployeeLabel(entry.employeeId).toLowerCase().includes(keyword))
})

const formatDate = dateStr => dateStr?.split('T')[0] || '-'

const fetchData = async () => {
  try {
    const headers = { Authorization: `Bearer ${accessToken.value}` }
    const res = await axios.get(`/support/notice/${noticeId}`, { headers })
    console.log('[공지 상세] 불러온 데이터:', res.data)
    notice.value = {
      ...res.data,
      isDeleted: res.data.isDeleted ?? res.data.is_deleted
    }
    checkList.value = res.data.checkList
  } catch (e) {
    console.error('❌ 공지 조회 실패:', e)
  }
}

const fetchTargetData = async () => {
  try {
    const headers = { Authorization: `Bearer ${accessToken.value}` }
    const [deptRes, empRes] = await Promise.all([
      axios.get('/department/hierarchy', { headers }),
      axios.post('/employee/search', {}, { headers })
    ])
    departments.value = deptRes.data
    employees.value = empRes.data
  } catch (e) {
    console.error('❌ 대상자 조회 실패:', e)
  }
}

const confirmCheck = async () => {
  const entry = checkList.value.find(e => Number(e.employeeId) === loginUserId.value)
  if (!entry || entry.isChecked) return

  try {
    await axios.put(`/support/notice/${noticeId}/check`, {}, {
      headers: { Authorization: `Bearer ${accessToken.value}` }
    })
    entry.isChecked = true
    checkList.value = [...checkList.value]
  } catch (e) {
    console.error('❌ 확인 요청 실패:', e)
  }
}

const deleteNotice = async () => {
  if (!confirm('정말 삭제하시겠습니까?')) return

  try {
    await axios.delete(`/support/notice/delete/${notice.value.id}`, {
      headers: { Authorization: `Bearer ${accessToken.value}` }
    })
    alert('삭제되었습니다.')
    router.push('/support/notice')
  } catch (e) {
    alert('삭제 중 오류가 발생했습니다.')
    console.error('❌ 삭제 실패:', e)
  }
}

const handleTargetUpdate = async (selectedList) => {
  const headers = { Authorization: `Bearer ${accessToken.value}` }
  const newIds = selectedList.map(emp => emp.id)

  try {
    await axios.put(`/support/notice/edit/${noticeId}`, {
      title: notice.value.title,
      content: notice.value.content,
      targetEmployeeId: newIds
    }, { headers })

    await fetchData()
    closeAddTargetModal()
  } catch (e) {
    console.error('❌ 대상자 업데이트 실패:', e)
  }
}

const goEditPage = () => router.push(`/support/notice/edit/${notice.value.id}`)
const goBackToList = () => router.push('/support/notice')

const openAddTargetModal = async () => {
  await fetchTargetData()
  isAddTargetOpen.value = true
}
const closeAddTargetModal = () => (isAddTargetOpen.value = false)

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.notice-detail-layout {
  display: flex;
  gap: 2rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.notice-content {
  flex: 2;
}

.notice-sidebar {
  width: 220px;
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  max-height: 500px;
  overflow-y: auto;
}

.notice-title {
  font-size: 1.6rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-align: left;
}

.notice-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1.5rem;
}

.notice-box {
  padding: 1.5rem;
  border: 1px solid #ddd;
  background-color: #f9f9f9;
  border-radius: 8px;
  white-space: pre-wrap;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.deleted-banner {
  background-color: #fff0f0;
  border: 1px dashed #d11a2a;
  color: #d11a2a;
  padding: 10px;
  margin-bottom: 1rem;
  font-weight: bold;
  font-size: 0.95rem;
  border-radius: 6px;
}
.btn-wrap {
  display: flex;
  justify-content: center;
  gap: 0.8rem;
  margin: 1.5rem 0;
}
.btn {
  padding: 0.55rem 1.2rem;
  min-width: 90px;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}
.edit-btn {
  background-color: #e6f0fb;
  color: #1e6fd9;
  border-color: #1e6fd9;
}
.edit-btn:hover {
  background-color: #cfe2f8;
}
.delete-btn {
  background-color: #fbe6e6;
  color: #d11a2a;
  border-color: #d11a2a;
}
.delete-btn:hover {
  background-color: #f5cfcf;
}
.check-btn {
  background-color: #e6f7ec;
  color: #1eaf67;
  border-color: #1eaf67;
}
.check-btn:disabled {
  background-color: #f0f0f0;
  color: #aaa;
  border: 1px solid #ccc;
  cursor: not-allowed;
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
.search-input {
  width: 90%;
  padding: 0.4rem 0.6rem;
  margin-bottom: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
}
.checklist {
  list-style: none;
  padding: 0;
  margin: 0;
}
.checklist li {
  display: flex;
  justify-content: space-between;
  padding: 0.3rem 0;
  border-bottom: 1px solid #eee;
  font-size: 0.85rem;
}
.checklist li.checked {
  background-color: #eef6ee;
  color: #666;
}
.checklist li.currentUser {
  font-weight: bold;
  color: #2d8f65;
}
.not-allowed {
  max-width: 960px;
  margin: 3rem auto;
  font-size: 1.2rem;
  text-align: center;
  color: #a00;
}
.add-target-wrap {
  width: 220px;
  margin: 1rem auto 0 auto;
  text-align: center;
}
.add-target-btn {
  width: 100%;
  padding: 0.5rem;
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #bbb;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.add-target-btn:hover {
  background-color: #e0e0e0;
}
</style>