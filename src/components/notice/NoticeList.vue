<template>
  <div class="notice-wrapper">
    <!-- 작성 버튼은 관리자 또는 팀장만 -->
    <div class="notice-actions">
      <button v-if="canWriteNotice" @click="goToWritePage"> 등록 </button>
    </div>

    <table class="notice-table">
      <thead>
        <tr>
          <th class="notice-index">번호</th>
          <th class="notice-title">제목</th>
          <th class="notice-author">작성자</th>
          <th class="notice-date">등록일자</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(notice, index) in pagedNotices"
          :key="notice.id"
          class="notice-row"
        >
          <td class="notice-index">
            {{ (currentPage - 1) * pageSize + index + 1 }}
          </td>
          <td
            class="notice-title"
            :class="{
              system: getEmployee(notice.employee_id)?.name === '관리자',
              read: notice.is_checked
            }"
            v-html="formatTitle(notice.title)"
          ></td>
          <td class="notice-author">
            {{ getEmployeeDisplayName(notice.employee_id) }}
          </td>
          <td class="notice-date">
            {{ notice.created_at.split('T')[0] }}
          </td>
        </tr>
      </tbody>
    </table>

    <Pagination
      :total="filteredNotices.length"
      :pageSize="pageSize"
      :currentPage="currentPage"
      @update:currentPage="currentPage = $event"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import Pagination from '@/components/notice/Pagination.vue'

// 로그인 유저 ID만 저장
const loginUserId = 2

const notices = ref([])
const employees = ref([])
const currentPage = ref(1)
const pageSize = 10

// 유저 객체 가져오기
const loginUser = computed(() => {
  return employees.value.find(emp => emp.id === loginUserId) || {}
})

// 작성 권한 (관리자 or 팀장)
const canWriteNotice = computed(() => {
  return loginUser.value.name === '관리자' || loginUser.value.level === '팀장'
})

// ✅ 관리자 공지는 모든 사용자에게 보여야 함
const filteredNotices = computed(() => {
  return notices.value.filter(notice => {
    const writer = getEmployee(notice.employee_id)
    if (!writer) return false

    // 1. 로그인한 사용자가 관리자
    if (loginUser.value.name === '관리자') return true

    // 2. 게시글 작성자가 관리자
    if (writer.name === '관리자') return true

    // 3. 같은 부서
    return writer.department_id === loginUser.value.department_id
  })
})

// 페이징 처리
const pagedNotices = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredNotices.value.slice(start, start + pageSize)
})

// 작성자 정보
const getEmployee = (employee_id) => {
  return employees.value.find(emp => emp.id === employee_id) || {}
}

const getEmployeeDisplayName = (employee_id) => {
  const emp = getEmployee(employee_id)
  if (!emp.name) return '-'
  return emp.name === '관리자' ? '관리자' : `${emp.name} ${emp.level}`
}

// 제목 강조
const formatTitle = (title) => {
  return title.replace(/(\[[^\]]+\])/g, '<strong>$1</strong>')
}

// 작성 페이지 이동
const goToWritePage = () => {
  alert('공지 등록 페이지로 이동합니다.')
}

// 데이터 로드
onMounted(async () => {
  const [noticeRes, employeeRes] = await Promise.all([
    fetch('http://localhost:3001/notices'),
    fetch('http://localhost:3001/employees')
  ])
  const noticeData = await noticeRes.json()
  const employeeData = await employeeRes.json()

  notices.value = noticeData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  employees.value = employeeData
})
</script>

<style scoped>
.notice-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  font-size: 15px;
  font-weight: 500;
  color: #222;
}

.notice-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 14px;
}

.notice-actions button {
  background-color: #E7F3D9;
  color: #222;
  padding: 10px 20px;
  font-size: 15px;
  font-weight: 600;
  border: 1px solid #B8DCA6;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.notice-actions button:hover {
  background-color: #d1e9c2;
}

.notice-table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background-color: #F0F7E4;
  font-size: 16px;
  font-weight: 600;
}

th,
td {
  padding: 12px 20px;
  vertical-align: middle;
  border-bottom: 1px solid #ddd;
}

.notice-index {
  text-align: center;
  width: 60px;
}

.notice-title {
  text-align: left;
}

.notice-author {
  text-align: center;
  width: 260px;
}

.notice-date {
  text-align: center;
  padding: 0 10px;
  width: 120px;
}

.system {
  color: red;
  font-weight: bold;
  font-size: inherit;
}

.read {
  color: #aaa;
}

.system.read {
  color: #aaa !important;
  font-weight: normal;
  font-size: inherit;
}

strong {
  font-weight: 900;
  font-size: 16px;
}
</style>
